<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Fokus

Pomodoro timer app — fully client-side. Optional accounts via Firebase (client SDK only, Spark/free plan); guests use localStorage.

## Commands
- `npm run dev` — dev server
- `npm run build` — production build (this also typechecks)
- `npm run start` — production server
- `npm run lint` — ESLint

## Framework & tooling quirks
- **Tailwind v4** — use `@import "tailwindcss"`, not `@tailwind` directives. PostCSS plugin: `@tailwindcss/postcss`. CSS variables in `app/globals.css`. Also imports `tw-animate-css` for animation utilities.
- **zod v4** — API differs from v3 (`z.email()` not `z.string().email()`, `z.infer<T>` alias for `z.output<T>`).
- **No `src/` dir** — `@/*` maps to project root, e.g. `@/hooks/timer/use-timer`.
- All pages are `"use client"` (except `/task`, server-rendered so shared links have real HTML) — no other server components, no API routes (except `app/img/[id]/route.ts`, which serves task images), no server actions, no Cloud Functions, no Cloud Storage (must stay on the free Spark plan; Storage needs Blaze since Feb 2026).
- **Recharts** (`^3.8.0`) — charts on `/reports` (PieChart, BarChart).
- **Lucide React** — icon library used throughout (import from `lucide-react`).
- **Two DnD libraries**: `@dnd-kit` (sortable list on `/timer`) and `@hello-pangea/dnd` (kanban board on `/tasks`).

## Architecture
- **Timer engine**: `hooks/timer/use-timer.ts` with 3 modes (`pomodoro | short-break | long-break`) and `adjustMinutes(delta)` for ±1 min adjustment. Auto-cycles between modes.
- **Sessions**: `hooks/timer/use-sessions.tsx` — multi-session CRUD. Guests: persisted to `localStorage` under `"fokus-sessions"`. Signed in: live Firestore snapshot of `users/{uid}/sessions/{id}` (whole Session + `order`), written via `syncToCloud()` in `hooks/timer/cloud.ts` (batch, changed-by-reference sessions only; `isRunning` always stored `false`). Offline via IndexedDB cache (`lib/firebase.ts`). Every mutation goes through `commit(prev, next)` — never write storage directly. Active session ID stored in `"fokus-active-session"`. Each session has its own settings, timer state, and task list. Legacy `"fokus-tasks"` key auto-migrated. `updateSessionTasks` runs `trackTaskChanges()` (in `shared.ts`), which stamps `createdAt` on new tasks and appends `history` events (created / renamed / note / status) — so callers just pass the new task list.
- **Kanban board**: `/tasks` page has 3 columns (To Do / In Progress / Done) using `@hello-pangea/dnd` `Droppable`/`Draggable`. Sidebar for session management (`SessionSidebar` component).
- **Shared types**: `hooks/timer/shared.ts` — `TimerMode`, `TaskStatus`, `Task`, `SessionSettings`, `TimerState`, `Session`, constants, and utility functions (`loadSettings()`, `fmt(seconds)`).
- **Audio**: `hooks/use-audio.ts` — Web Audio API tone generator (`playBreakChime()`, `playFocusChime()`).
- **Notifications**: `hooks/use-notification.ts` — Browser Notification API wrapper (`requestPermission()`, `notify(title, body?)`).
- **Mobile**: `hooks/use-mobile.ts` — `useIsMobile()` hook (768px breakpoint).
- **Layout components**: `components/compiled-ui/Navbar.tsx` + `Footer.tsx` — shared across all pages.
- **Forms**: react-hook-form + `@hookform/resolvers/zod` + shadcn `<Form>` components.
- **Toasts**: `sonner` — `<Toaster>` is in root layout, call `toast.success(...)` anywhere.
- **Animations**: AOS — globally initialized in `<AosProvider>` with `once: true`, `duration: 600`, `offset: 50`. Just add `data-aos="fade-up"` + optional `data-aos-delay` / `data-aos-duration` / `data-aos-offset="0"`.
- **Theme**: next-themes with `class` strategy (light/dark). `<ThemeProvider>` wraps root layout.
- **Color themes**: `lib/themes.ts` (tokens, presets with light+dark palettes) + `hooks/use-themes.ts` (store). Custom themes in `"fokus-custom-themes"`, active id in `"fokus-active-theme"`, compiled CSS in `"fokus-theme-css"` (applied pre-paint by a `beforeInteractive` script in root layout). Editor: `components/theme/ThemeDialog.tsx` (navbar palette button); browser: `/themes`.
- **Auth**: `lib/firebase.ts` (app/auth/db init from `NEXT_PUBLIC_FIREBASE_*` in `.env.local`) + `hooks/use-auth.tsx` (`<AuthProvider>` in root layout, `useAuth()` → `{ user, profile, loading }`, plus `signUp`/`signIn`/`signOut`/`resetPassword`/`saveProfile`). Firestore: `users/{uid}` `{ displayName, username, createdAt }`, `usernames/{name}` `{ uid }` for uniqueness — claimed/released in one transaction. Security rules live in `firestore.rules` (paste into console to deploy); keep its username regex in sync with `usernameSchema`. Pages: `/login`, `/register`, `/account`; navbar `AccountButton`.
- **Guest data never auto-copies into an account.** A server-empty account is seeded with one blank session (in `use-sessions`). Importing this device's guest sessions is explicit: `/welcome` offers it right after sign-up; `components/session/CloudLinkDialog.tsx` (mounted in layout) asks on later sign-ins (`/register` calls `skipNextLinkPrompt()`). Id clashes import as copies (`deviceSessions()`). Flag `"fokus-linked-<uid>"` = offered on this device.
- **Onboarding**: `/register` → `/welcome` (4-step guide + import offer); also linked from the account menu ("Getting started").
- **Task share links**: `taskLink()` / `parseTaskLink()` in `shared.ts` put the task in plain query params (`/task?title=…&status=…&note=…&session=…&created=…&tag=key:value`). `/task` renders it server-side with metadata + a JSON block (`#fokus-task`, `type: "fokus.task"`). A snapshot: no DB, works for anyone. Copy from board cards / `TaskDetail` (`copyTaskLink`).
- **Task tags**: `Task.tags?: TaskTag[]` where `TaskTag = { key, value, color? }` — key/value free text chosen by the user (e.g. `priority: high`, `client: Acme`); no fixed key list. `color` is optional, one of `TAG_COLORS` (`red orange yellow green blue purple pink gray`; unknown → dropped; chip classes in `TAG_COLOR_CLASS`). Keys unique per task (case-insensitive), no `:` in keys. Validation: `tagSchema` / `tagsSchema` in `shared.ts` (used by `TaskDialog` and import). Edited in `TaskDialog` (Add/Edit Task), shown via `TagChips`. History event `{ type: "tag", key, change }`. Share links: repeated `tag=key:value` (split on first `:`) + `tagcolor=key:red`; `SharedTask.tags` is always an array.
- **Task images**: Markdown lines inside the task note: `![alt](src)` where `src` is `/img/<32-hex id>` (uploaded) or any `https://` URL — that's the whole format, so to add an image just write that line (`IMAGE_MD`, `imageMarkdown`, `noteImages`, `stripImages` in `shared.ts`; rendered by `components/session/NoteContent.tsx`). Uploads (`lib/task-images.ts`, signed-in only; button or paste in `TaskDialog`): resize to ≤2560px long edge + WebP q0.9 in the browser (JPEG on Safari; original kept if smaller; steps down only to fit), stored as bytes in Firestore `images/{id}` `{ owner, type, data, width, height, createdAt }` (≤ ~900 KB; public `get` by id, no list, immutable — see `firestore.rules`). `GET /img/<id>` streams it (cached forever). `SharedTask.images` lists them with absolute URLs.
- **Password fields**: use `components/ui/password-input.tsx` (show/hide toggle).
- **Export / import**: `buildExport` / `parseImport` (zod-validated) / `mergeSessions` in `shared.ts`; `ImportDialog` + export buttons in `SessionSidebar`; `importSessions()` in `use-sessions` (same id replaces, new ids append, history preserved).
- **Class merging**: `cn()` from `@/lib/utils` (clsx + tailwind-merge).

## Routes
`/` `/timer` `/tasks` `/themes` `/settings` `/reports` `/reports/[id]` `/login` `/register` `/account` `/welcome` `/task` `/img/[id]` (image route)

## Settings
Persisted to `localStorage` under `"fokus-settings"` — stores `{ pomodoro, shortBreak, longBreak, sessionsBeforeLongBreak, autoStart }` in minutes.

## Commit style
See `.claude/skills/commit-planner/SKILL.md` — uses `type: description` format with atomic commits.

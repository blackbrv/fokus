<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Fokus

Pomodoro timer app — fully client-side, no backend, no database.

## Commands
- `npm run dev` — dev server
- `npm run build` — production build (this also typechecks)
- `npm run start` — production server
- `npm run lint` — ESLint

## Framework & tooling quirks
- **Tailwind v4** — use `@import "tailwindcss"`, not `@tailwind` directives. PostCSS plugin: `@tailwindcss/postcss`. CSS variables in `app/globals.css`. Also imports `tw-animate-css` for animation utilities.
- **zod v4** — API differs from v3 (`z.email()` not `z.string().email()`, `z.infer<T>` alias for `z.output<T>`).
- **No `src/` dir** — `@/*` maps to project root, e.g. `@/hooks/timer/use-timer`.
- All pages are `"use client"` — no server components, no API routes, no server actions.
- **Recharts** (`^3.8.0`) — charts on `/reports` (PieChart, BarChart).
- **Lucide React** — icon library used throughout (import from `lucide-react`).
- **Two DnD libraries**: `@dnd-kit` (sortable list on `/timer`) and `@hello-pangea/dnd` (kanban board on `/tasks`).

## Architecture
- **Timer engine**: `hooks/timer/use-timer.ts` with 3 modes (`pomodoro | short-break | long-break`) and `adjustMinutes(delta)` for ±1 min adjustment. Auto-cycles between modes.
- **Sessions**: `hooks/timer/use-sessions.tsx` — multi-session CRUD persisted to `localStorage` under `"fokus-sessions"`. Active session ID stored in `"fokus-active-session"`. Each session has its own settings, timer state, and task list. Legacy `"fokus-tasks"` key auto-migrated.
- **Kanban board**: `/tasks` page has 3 columns (To Do / In Progress / Done) using `@hello-pangea/dnd` `Droppable`/`Draggable`. Sidebar for session management (`SessionSidebar` component).
- **Shared types**: `hooks/timer/shared.ts` — `TimerMode`, `TaskStatus`, `Task`, `SessionSettings`, `TimerState`, `Session`, constants, and utility functions (`loadSettings()`, `fmt(seconds)`).
- **Audio**: `hooks/use-audio.ts` — Web Audio API tone generator (`playBreakChime()`, `playFocusChime()`).
- **Notifications**: `hooks/use-notification.ts` — Browser Notification API wrapper (`requestPermission()`, `notify(title, body?)`).
- **Mobile**: `hooks/use-mobile.ts` — `useIsMobile()` hook (768px breakpoint).
- **Layout components**: `components/compiled-ui/Navbar.tsx` + `Footer.tsx` — shared across all pages.
- **Forms**: react-hook-form + `@hookform/resolvers/zod` + shadcn `<Form>` components.
- **Toasts**: `sonner` — `<Toaster>` is in root layout, call `toast.success(...)` anywhere.
- **Animations**: AOS — globally initialized in `<AosProvider>` with `once: true`, `duration: 600`, `offset: 50`. Just add `data-aos="fade-up"` + optional `data-aos-delay` / `data-aos-duration` / `data-aos-offset="0"`.
- **Theme**: next-themes with `class` strategy. `<ThemeProvider>` wraps root layout.
- **Class merging**: `cn()` from `@/lib/utils` (clsx + tailwind-merge).

## Routes
`/` `/timer` `/tasks` `/settings` `/reports` `/reports/[id]` `/login` `/register`

## Settings
Persisted to `localStorage` under `"fokus-settings"` — stores `{ pomodoro, shortBreak, longBreak, sessionsBeforeLongBreak, autoStart }` in minutes.

## Commit style
See `.claude/skills/commit-planner/SKILL.md` — uses `type: description` format with atomic commits.

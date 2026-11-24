import type { Metadata } from "next";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusDot } from "@/components/session/BoardTaskCardContent";
import { parseTaskLink } from "@/hooks/timer/shared";
import { CopyButton } from "./CopyButton";

// Server-rendered on purpose (the one non-"use client" page): the task comes
// from the URL, so people, link previews and AI agents all get real HTML.
type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const task = parseTaskLink(await searchParams);
  const title = task ? `${task.title} · Task` : "Shared task"; // layout appends " | Fokus"
  const description = task?.description.replace(/\s+/g, " ").slice(0, 160) || "A task shared from Fokus.";
  return { title, description, robots: { index: false }, openGraph: { title, description }, twitter: { title, description } };
}

const label = "mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground";

export default async function TaskPage({ searchParams }: Props) {
  const task = parseTaskLink(await searchParams);

  if (!task) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 min-h-screen text-center">
        <h1 className="text-3xl font-bold text-foreground">This task link is incomplete</h1>
        <p className="text-foreground/50 font-medium">Ask whoever shared it to copy the link again.</p>
        <Button asChild className="bg-foreground">
          <Link href="/">Open Fokus</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center pt-10 pb-24 px-4 font-sans min-h-screen">
      <article className="w-full max-w-[720px] flex flex-col gap-8">
        <header className="flex flex-col gap-4" data-aos="fade-up" data-aos-duration="700" data-aos-offset="0">
          <p className="text-sm font-medium text-foreground/50">
            Fokus task{task.session && <> · <span className="text-foreground">{task.session}</span></>}
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground leading-tight break-words">{task.title}</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-foreground/50">
            <span className="inline-flex items-center gap-1.5 rounded-full border bg-muted px-3 py-1 text-xs font-semibold text-foreground">
              <StatusDot status={task.status} />
              {task.statusLabel}
            </span>
            {task.createdAt && (
              <time dateTime={task.createdAt}>Created {format(new Date(task.createdAt), "MMM d, yyyy")}</time>
            )}
          </div>
        </header>

        <section
          className="rounded-xl border bg-card p-6"
          data-aos="fade-up"
          data-aos-duration="700"
          data-aos-delay="100"
          data-aos-offset="0"
        >
          <h2 className={label}>Description</h2>
          {task.description ? (
            <p className="text-base leading-relaxed whitespace-pre-wrap break-words text-card-foreground">
              {task.description}
              {task.descriptionTruncated && <span className="text-muted-foreground"> … (shortened to fit the link)</span>}
            </p>
          ) : (
            <p className="text-muted-foreground italic">No description.</p>
          )}
        </section>

        <div
          className="flex flex-wrap gap-2"
          data-aos="fade-up"
          data-aos-duration="700"
          data-aos-delay="200"
          data-aos-offset="0"
        >
          <CopyButton label="Copy link" />
          <CopyButton label="Copy as JSON" variant="outline" text={JSON.stringify(task, null, 2)} />
          <Button asChild variant="outline" className="font-medium">
            <Link href="/timer">
              Open Fokus <ArrowRight />
            </Link>
          </Button>
        </div>

        {/* Machine-readable copy of the same payload, present in the server HTML. */}
        <details className="rounded-xl border p-4 text-sm" data-aos="fade-up" data-aos-delay="300" data-aos-offset="0">
          <summary className="cursor-pointer font-medium text-foreground/70">Task data (JSON, for AI agents and tools)</summary>
          <pre id="fokus-task" className="mt-3 overflow-x-auto whitespace-pre-wrap break-words text-xs text-foreground/80">
            {JSON.stringify(task, null, 2)}
          </pre>
        </details>
      </article>
    </div>
  );
}

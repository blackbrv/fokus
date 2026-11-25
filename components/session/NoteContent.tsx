import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { IMAGE_MD } from "@/hooks/timer/shared";

/** A task note: plain text, with `![alt](src)` lines rendered as images. */
export function NoteContent({ note, className }: { note: string; className?: string }) {
  const parts: ReactNode[] = [];
  let last = 0;
  for (const m of note.matchAll(IMAGE_MD)) {
    parts.push(note.slice(last, m.index));
    parts.push(
      <a key={m.index} href={m[2]} target="_blank" rel="noreferrer" className="my-2 block w-fit">
        {/* eslint-disable-next-line @next/next/no-img-element -- stored pre-sized; next/image adds nothing */}
        <img
          src={m[2]}
          alt={m[1]}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="block max-h-[28rem] max-w-full rounded-lg border object-contain"
        />
      </a>,
    );
    last = m.index + m[0].length;
  }
  parts.push(note.slice(last));
  return <div className={cn("whitespace-pre-wrap break-words", className)}>{parts}</div>;
}

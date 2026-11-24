"use client";

import { useEffect, useState } from "react";
import { getDocsFromServer } from "firebase/firestore";
import { toast } from "sonner";
import { CloudUpload } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { loadSessions } from "@/hooks/timer/use-sessions";
import { sessionsCol, syncToCloud } from "@/hooks/timer/cloud";
import type { Session } from "@/hooks/timer/shared";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const linkedKey = (uid: string) => `fokus-linked-${uid}`;
export const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

/**
 * This device's guest sessions, if there's anything worth offering to an
 * account ([] otherwise). Ids already in the account become copies so an
 * import never overwrites synced data.
 */
export function deviceSessions(cloudIds: Set<string>): Session[] {
  const local = loadSessions();
  if (local.length <= 1 && !local.some((s) => s.tasks.length > 0)) return [];
  return local.map((s) =>
    cloudIds.has(s.id) ? { ...s, id: crypto.randomUUID(), name: `${s.name} (this device)` } : s,
  );
}

// /register sets this before signing up: a new account's import offer is on
// /welcome instead. Consumed by the sign-in it precedes.
let skipNext = false;
export const skipNextLinkPrompt = (skip = true) => {
  skipNext = skip;
};

/**
 * Runs once per account per device, on sign-in: accounts never pick up guest
 * data on their own; if this device has some, the user is asked to import it.
 */
export function CloudLinkDialog() {
  const { user } = useAuth();
  const [pending, setPending] = useState<{ uid: string; local: Session[] } | null>(null);

  useEffect(() => {
    if (!user) return;
    if (skipNext) {
      skipNext = false;
      return;
    }
    if (localStorage.getItem(linkedKey(user.uid))) return;
    const uid = user.uid;
    let cancelled = false;
    (async () => {
      // From the server, so clashing ids are known even on a cold cache.
      const cloud = await getDocsFromServer(sessionsCol(uid));
      if (cancelled) return;
      const local = deviceSessions(new Set(cloud.docs.map((d) => d.id)));
      if (local.length) setPending({ uid, local });
      else localStorage.setItem(linkedKey(uid), "1");
    })().catch(() => {
      /* Offline or transient: try again on the next load. */
    });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const close = () => {
    if (pending) localStorage.setItem(linkedKey(pending.uid), "1");
    setPending(null);
  };

  const importLocal = async () => {
    if (!pending) return;
    try {
      await syncToCloud(pending.uid, [], pending.local);
      toast.success(`Added ${plural(pending.local.length, "session")} to your account`, {
        icon: <CloudUpload className="size-4" />,
      });
      close();
    } catch {
      toast.error("Couldn't import. Check your connection and try again.");
    }
  };

  const taskCount = pending?.local.reduce((n, s) => n + s.tasks.length, 0) ?? 0;

  return (
    <AlertDialog open={!!pending} onOpenChange={(open) => !open && close()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Bring this device&apos;s sessions?</AlertDialogTitle>
          <AlertDialogDescription>
            {`This device has ${plural(pending?.local.length ?? 0, "session")} and ${plural(taskCount, "task")} that aren't in your account yet. Importing adds them alongside your synced sessions. Nothing in your account is removed.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Not now</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              importLocal();
            }}
          >
            Import
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

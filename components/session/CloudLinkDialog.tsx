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

const linkedKey = (uid: string) => `fokus-linked-${uid}`;
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

/**
 * Runs once per account per device, on first sign-in: an empty account gets
 * this device's sessions automatically; otherwise the user is asked.
 */
export function CloudLinkDialog() {
  const { user } = useAuth();
  const [pending, setPending] = useState<{ uid: string; local: Session[] } | null>(null);

  useEffect(() => {
    if (!user || localStorage.getItem(linkedKey(user.uid))) return;
    const uid = user.uid;
    let cancelled = false;
    (async () => {
      const local = loadSessions();
      // From the server: an empty offline cache must not look like an empty account.
      const cloud = await getDocsFromServer(sessionsCol(uid));
      if (cancelled) return;
      if (cloud.empty) {
        await syncToCloud(uid, [], local);
        localStorage.setItem(linkedKey(uid), "1");
      } else if (local.length > 1 || local.some((s) => s.tasks.length > 0)) {
        // This device's guest copy can share ids with (older versions of)
        // synced sessions; import those as copies so nothing is overwritten.
        const cloudIds = new Set(cloud.docs.map((d) => d.id));
        setPending({
          uid,
          local: local.map((s) =>
            cloudIds.has(s.id) ? { ...s, id: crypto.randomUUID(), name: `${s.name} (this device)` } : s,
          ),
        });
      } else {
        localStorage.setItem(linkedKey(uid), "1");
      }
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

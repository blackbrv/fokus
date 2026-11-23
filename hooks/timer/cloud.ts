import { collection, doc, writeBatch, type QuerySnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Session } from "./shared";

// Firestore layout: users/{uid}/sessions/{sessionId} = Session + { order }.
// ponytail: whole session (tasks embedded) per doc, last write wins; 1 MiB doc cap
// is hundreds of tasks. Split tasks into their own docs if that ever bites.

export const sessionsCol = (uid: string) => collection(db, "users", uid, "sessions");

// Stable sort key per session id, assigned on first upload. Shared by every
// useSessions instance on the page.
const orders = new Map<string, number>();

export function fromSnapshot(snap: QuerySnapshot): Session[] {
  return snap.docs
    .map((d) => {
      const { order, ...session } = d.data() as Session & { order: number };
      orders.set(session.id, order);
      return { order, session };
    })
    .sort((a, b) => a.order - b.order)
    .map((x) => x.session);
}

/**
 * Writes sessions that changed (by reference) between `prev` and `next` and
 * deletes removed ones, in one batch. A running timer is stored paused so
 * other devices never count down from a stale remainingSeconds.
 */
export function syncToCloud(uid: string, prev: Session[], next: Session[]): Promise<void> {
  const before = new Map(prev.map((s) => [s.id, s]));
  const nextIds = new Set(next.map((s) => s.id));
  const batch = writeBatch(db);
  let ops = 0;
  const base = Date.now();

  next.forEach((s, i) => {
    if (before.get(s.id) === s) return;
    if (!orders.has(s.id)) orders.set(s.id, base + i);
    batch.set(doc(sessionsCol(uid), s.id), {
      ...s,
      timerState: { ...s.timerState, isRunning: false },
      order: orders.get(s.id),
    });
    ops++;
  });
  for (const s of prev) {
    if (nextIds.has(s.id)) continue;
    batch.delete(doc(sessionsCol(uid), s.id));
    ops++;
  }
  return ops ? batch.commit() : Promise.resolve();
}

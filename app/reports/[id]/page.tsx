"use client";

import { useParams, useRouter } from "next/navigation";
import { useSessions } from "@/hooks/timer/use-sessions";
import { SessionDetail } from "@/components/reports/SessionDetail";

export default function SessionReportPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { sessions, isLoaded } = useSessions();

  if (!isLoaded) return null;

  const session = sessions.find((s) => s.id === id);

  if (!session) {
    return (
      <div className="flex flex-1 flex-col items-center pt-10 pb-24 px-4 font-sans min-h-screen">
        <div className="w-full max-w-[700px] flex flex-col gap-4">
          <p className="text-foreground/45 font-medium">Session not found.</p>
          <button
            onClick={() => router.push("/reports")}
            className="text-sm font-semibold text-foreground/60 hover:text-foreground transition-colors cursor-pointer w-fit"
          >
            ← Back to Reports
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center pt-10 pb-24 px-4 font-sans min-h-screen">
      <div className="w-full max-w-[700px]">
        <SessionDetail session={session} />
      </div>
    </div>
  );
}

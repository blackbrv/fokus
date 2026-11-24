"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowRight, CloudUpload, Layers, Smartphone, SquareKanban, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useSessions } from "@/hooks/timer/use-sessions";
import type { Session } from "@/hooks/timer/shared";
import { deviceSessions, linkedKey, plural } from "@/components/session/CloudLinkDialog";

const steps = [
  {
    icon: Layers,
    title: "Make a session",
    body: "A session is a project or a goal. Each one keeps its own timer lengths and task list. Create and switch them in the sidebar on Tasks.",
  },
  {
    icon: SquareKanban,
    title: "Plan your tasks",
    body: "Add tasks on the board and drag them between To Do, In Progress and Done. Open a task to add notes.",
  },
  {
    icon: Timer,
    title: "Focus with the timer",
    body: "Press start for a 25-minute focus block. Fokus moves to short and long breaks for you, and shows your next task while you work.",
  },
  {
    icon: Smartphone,
    title: "Pick up anywhere",
    body: "While you're signed in, everything saves to your account. Sign in on your phone to see the same sessions. Reports show where your time went.",
  },
];

export default function WelcomePage() {
  const { user, profile } = useAuth();
  const { sessions, isLoaded, importSessions } = useSessions();
  const [offer, setOffer] = useState<Session[]>([]);

  // Guest sessions on this device that haven't been offered to this account yet.
  useEffect(() => {
    if (!user || !isLoaded || localStorage.getItem(linkedKey(user.uid))) return;
    setOffer(deviceSessions(new Set(sessions.map((s) => s.id)))); // eslint-disable-line react-hooks/set-state-in-effect
  }, [user, isLoaded, sessions]);

  const settle = () => {
    if (user) localStorage.setItem(linkedKey(user.uid), "1");
    setOffer([]);
  };

  const onImport = () => {
    importSessions(offer);
    toast.success(`Added ${plural(offer.length, "session")} to your account`, {
      icon: <CloudUpload className="size-4" />,
    });
    settle();
  };

  const firstName = profile?.displayName.split(" ")[0];
  const taskCount = offer.reduce((n, s) => n + s.tasks.length, 0);

  return (
    <div className="flex flex-1 flex-col items-center pt-10 pb-24 px-4 font-sans min-h-screen">
      <div className="w-full max-w-[640px] flex flex-col gap-8">
        <div className="flex flex-col gap-3 text-center">
          <h1
            className="text-4xl sm:text-5xl font-bold text-foreground"
            data-aos="fade-up"
            data-aos-duration="800"
            data-aos-offset="0"
          >
            {firstName ? `Welcome, ${firstName}.` : "Welcome to Fokus."}
          </h1>
          <p
            className="text-foreground/50 font-medium"
            data-aos="fade-up"
            data-aos-duration="800"
            data-aos-delay="120"
            data-aos-offset="0"
          >
            {user
              ? "Your account is ready, with one blank session. Here's how Fokus works in four steps."
              : "Here's how Fokus works in four steps."}
          </p>
        </div>

        {offer.length > 0 && (
          <Card data-aos="fade-up" data-aos-duration="700" data-aos-delay="200" data-aos-offset="0">
            <CardContent className="flex flex-col sm:flex-row sm:items-center gap-4">
              <CloudUpload className="size-5 shrink-0 text-foreground/50" />
              <p className="flex-1 text-sm text-foreground/70">
                {`This device has ${plural(offer.length, "session")} and ${plural(taskCount, "task")} from before you signed up. Your account doesn't include them yet.`}
              </p>
              <div className="flex gap-2 self-end sm:self-auto">
                <Button variant="ghost" size="sm" onClick={settle}>
                  Not now
                </Button>
                <Button size="sm" onClick={onImport}>
                  Import
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <ol className="grid gap-4 sm:grid-cols-2">
          {steps.map(({ icon: Icon, title, body }, i) => (
            <li
              key={title}
              data-aos="fade-up"
              data-aos-duration="700"
              data-aos-delay={String(240 + i * 80)}
              data-aos-offset="0"
            >
              <Card className="h-full">
                <CardContent className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex size-9 items-center justify-center rounded-lg bg-foreground text-background">
                      <Icon className="size-4" />
                    </span>
                    <span className="text-xs font-semibold text-foreground/40">Step {i + 1}</span>
                  </div>
                  <h2 className="font-semibold text-foreground">{title}</h2>
                  <p className="text-sm text-foreground/60">{body}</p>
                </CardContent>
              </Card>
            </li>
          ))}
        </ol>

        <p
          className="text-center text-sm text-foreground/50"
          data-aos="fade-up"
          data-aos-duration="700"
          data-aos-delay="560"
          data-aos-offset="0"
        >
          Have a .json export? Use the upload button in the Tasks sidebar to import it.
        </p>

        <div
          className="flex flex-wrap justify-center gap-2"
          data-aos="fade-up"
          data-aos-duration="700"
          data-aos-delay="620"
          data-aos-offset="0"
        >
          <Button asChild className="font-medium bg-foreground">
            <Link href="/timer">
              Start Fokusing
              <ArrowRight strokeWidth={2.5} />
            </Link>
          </Button>
          <Button asChild variant="outline" className="font-medium">
            <Link href="/tasks">Plan my tasks</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

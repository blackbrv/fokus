"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useSessions } from "@/hooks/timer/use-sessions";
import type { Session } from "@/hooks/timer/shared";

const OVERVIEW_PIE_COLORS = ["oklch(0.577 0.245 27.325)", "oklch(0.708 0 0)"];

function formatDuration(minutes: number): string {
  if (minutes === 0) return "0m";
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function sessionStats(session: Session) {
  const done = session.tasks.filter((t) => t.status === "done").length;
  const inProgress = session.tasks.filter(
    (t) => t.status === "in-progress",
  ).length;
  const todo = session.tasks.filter((t) => t.status === "todo").length;
  const pomodoros = Math.max(0, session.timerState.pomodoroCount - 1);
  const focusMinutes = pomodoros * session.settings.pomodoroMinutes;
  return { done, inProgress, todo, pomodoros, focusMinutes };
}

export default function ReportsPage() {
  const { sessions, isLoaded } = useSessions();

  const allTasks = useMemo(() => sessions.flatMap((s) => s.tasks), [sessions]);

  const totalCompleted = useMemo(
    () => allTasks.filter((t) => t.status === "done").length,
    [allTasks],
  );

  const totalFocusMinutes = useMemo(
    () =>
      sessions.reduce((sum, s) => {
        const pomodoros = Math.max(0, s.timerState.pomodoroCount - 1);
        return sum + pomodoros * s.settings.pomodoroMinutes;
      }, 0),
    [sessions],
  );

  const pieData = [
    { name: "Completed", value: totalCompleted },
    { name: "Active", value: allTasks.length - totalCompleted },
  ];

  const barData = useMemo(
    () =>
      sessions.map((s) => ({
        name: s.name.length > 14 ? s.name.slice(0, 14) + "…" : s.name,
        Total: s.tasks.length,
        Completed: s.tasks.filter((t) => t.status === "done").length,
      })),
    [sessions],
  );

  const isEmpty = isLoaded && allTasks.length === 0 && totalFocusMinutes === 0;

  return (
    <div className="flex flex-1 flex-col items-center pt-10 pb-24 px-4 font-sans min-h-screen">
      <div className="w-full max-w-[700px] flex flex-col gap-7">
        <h1
          className="text-3xl font-bold text-foreground"
          data-aos="fade-down"
          data-aos-duration="600"
          data-aos-offset="0"
        >
          Reports
        </h1>

        {!isLoaded ? null : isEmpty ? (
          <p
            className="text-center text-foreground/45 font-medium py-10"
            data-aos="fade-up"
            data-aos-duration="600"
            data-aos-offset="0"
          >
            No data yet. Start adding and completing tasks to see your stats.
          </p>
        ) : (
          <>
            {/* Summary cards */}
            <div
              className="grid grid-cols-3 gap-4"
              data-aos="fade-up"
              data-aos-duration="600"
              data-aos-delay="100"
              data-aos-offset="0"
            >
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-foreground/60">
                    Total Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{allTasks.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-foreground/60">
                    Completed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-destructive">
                    {totalCompleted}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-foreground/60">
                    Focus Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">
                    {formatDuration(totalFocusMinutes)}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Sessions list */}
            <div className="flex flex-col gap-3">
              <h2
                className="text-lg font-bold text-foreground"
                data-aos="fade-up"
                data-aos-duration="500"
                data-aos-delay="150"
                data-aos-offset="0"
              >
                Sessions
              </h2>

              <div
                className={cn(
                  "flex flex-col gap-2",
                  sessions.length > 3 && "max-h-[304px] overflow-y-auto pr-1",
                )}
              >
                {sessions.map((session, i) => {
                  const { done, inProgress, todo, pomodoros, focusMinutes } =
                    sessionStats(session);

                  return (
                    <Link
                      key={session.id}
                      href={`/reports/${session.id}`}
                      data-aos="fade-up"
                      data-aos-duration="500"
                      data-aos-delay={200 + i * 75}
                      data-aos-offset="0"
                    >
                      <Card className="cursor-pointer hover:bg-foreground/[0.02] transition-colors">
                        <CardContent className="pt-4 pb-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex flex-col gap-2 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-foreground truncate">
                                  {session.name}
                                </span>
                                <span className="text-xs font-semibold text-foreground/40 bg-foreground/5 px-1.5 py-0.5 rounded-full shrink-0">
                                  {session.tasks.length}{" "}
                                  {session.tasks.length === 1
                                    ? "task"
                                    : "tasks"}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-foreground/60 flex-wrap">
                                <span className="flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full bg-foreground/25 shrink-0" />
                                  Todo: {todo}
                                </span>
                                <span className="flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                                  In Progress: {inProgress}
                                </span>
                                <span className="flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                                  Done: {done}
                                </span>
                              </div>
                            </div>

                            <div className="flex flex-col items-end gap-0.5 shrink-0 text-right">
                              <span className="text-xl font-bold leading-none">
                                {formatDuration(focusMinutes)}
                              </span>
                              <span className="text-xs text-foreground/50">
                                {pomodoros}{" "}
                                {pomodoros === 1 ? "pomodoro" : "pomodoros"}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Pie chart */}
            <Card
              data-aos="fade-up"
              data-aos-duration="600"
              data-aos-delay="300"
              data-aos-offset="0"
            >
              <CardHeader>
                <CardTitle>Task Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={OVERVIEW_PIE_COLORS[i]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Bar chart */}
            <Card
              data-aos="fade-up"
              data-aos-duration="600"
              data-aos-delay="400"
              data-aos-offset="0"
            >
              <CardHeader>
                <CardTitle>Per Session Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={barData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="oklch(0.922 0 0)"
                    />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="Total"
                      fill="oklch(0.708 0 0)"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="Completed"
                      fill="oklch(0.577 0.245 27.325)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Session, TaskStatus } from "@/hooks/timer/shared";

const DETAIL_PIE_COLORS = [
  "oklch(0.708 0 0)",
  "oklch(0.85 0.12 85)",
  "oklch(0.577 0.245 27.325)",
];

const STATUS_DOT: Record<TaskStatus, string> = {
  todo: "bg-foreground/25",
  "in-progress": "bg-amber-400",
  done: "bg-emerald-400",
};

const STATUS_LABEL: Record<TaskStatus, string> = {
  todo: "To Do",
  "in-progress": "In Progress",
  done: "Done",
};

function formatDuration(minutes: number): string {
  if (minutes === 0) return "0m";
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function SessionDetail({ session }: { session: Session }) {
  const router = useRouter();

  const done = session.tasks.filter((t) => t.status === "done").length;
  const inProgress = session.tasks.filter(
    (t) => t.status === "in-progress",
  ).length;
  const todo = session.tasks.filter((t) => t.status === "todo").length;
  const pomodoros = Math.max(0, session.timerState.pomodoroCount - 1);
  const focusMinutes = pomodoros * session.settings.pomodoroMinutes;

  const detailPieData = [
    { name: "To Do", value: todo },
    { name: "In Progress", value: inProgress },
    { name: "Done", value: done },
  ].filter((d) => d.value > 0);

  const tasksByStatus: TaskStatus[] = ["todo", "in-progress", "done"];

  return (
    <div className="flex flex-col gap-7">
      {/* Breadcrumb */}
      <div
        className="flex items-center gap-3"
        data-aos="fade-down"
        data-aos-duration="500"
        data-aos-offset="0"
      >
        <button
          onClick={() => router.push("/reports")}
          className="flex items-center gap-1 text-sm font-semibold text-foreground/50 hover:text-foreground transition-colors cursor-pointer"
        >
          <ChevronLeft size={16} />
          Reports
        </button>
        <span className="text-foreground/20">/</span>
        <span className="text-sm font-semibold text-foreground truncate">
          {session.name}
        </span>
      </div>

      {/* Summary stats */}
      <div
        className="grid grid-cols-4 gap-3"
        data-aos="fade-up"
        data-aos-duration="500"
        data-aos-delay="50"
        data-aos-offset="0"
      >
        {[
          { label: "Total", value: String(session.tasks.length) },
          { label: "Done", value: String(done) },
          { label: "Focus Time", value: formatDuration(focusMinutes) },
          { label: "Pomodoros", value: String(pomodoros) },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-1 pt-3 px-4">
              <CardTitle className="text-xs font-medium text-foreground/60">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-3 px-4">
              <p className="text-2xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Task list by status */}
      {session.tasks.length === 0 ? (
        <p
          className="text-center text-foreground/45 font-medium py-6"
          data-aos="fade-up"
          data-aos-duration="500"
          data-aos-offset="0"
        >
          No tasks in this session yet.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {tasksByStatus.map((status, si) => {
            const group = session.tasks.filter((t) => t.status === status);
            if (group.length === 0) return null;
            return (
              <div
                key={status}
                className="flex flex-col gap-2"
                data-aos="fade-up"
                data-aos-duration="500"
                data-aos-delay={100 + si * 75}
                data-aos-offset="0"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "w-2 h-2 rounded-full shrink-0",
                      STATUS_DOT[status],
                    )}
                  />
                  <span className="text-xs font-bold text-foreground/50 uppercase tracking-wider">
                    {STATUS_LABEL[status]}
                  </span>
                  <span className="text-xs text-foreground/30 font-semibold">
                    {group.length}
                  </span>
                </div>
                <div className="flex flex-col gap-1.5 pl-4">
                  {group.map((task) => (
                    <div
                      key={task.id}
                      className="flex flex-col gap-0.5 px-3 py-2 rounded-lg bg-foreground/[0.03] border border-foreground/8"
                    >
                      <span
                        className={cn(
                          "text-sm font-semibold",
                          status === "done" &&
                            "line-through text-foreground/40",
                        )}
                      >
                        {task.title}
                      </span>
                      {task.note && (
                        <span className="text-xs text-foreground/45 leading-relaxed">
                          {task.note}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pie chart */}
      {detailPieData.length > 0 && (
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
                  data={detailPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  dataKey="value"
                  stroke="none"
                >
                  {detailPieData.map((_, i) => (
                    <Cell
                      key={i}
                      fill={DETAIL_PIE_COLORS[i % DETAIL_PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

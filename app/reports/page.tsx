"use client";

import { useState, useEffect } from "react";
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
} from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { STORAGE_KEY, type Task } from "@/hooks/timer/shared";

const PIE_COLORS = ["oklch(0.577 0.245 27.325)", "oklch(0.708 0 0)"];

function loadTasks(): Task[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Task[]) : [];
  } catch {
    return [];
  }
}

export default function ReportsPage() {
  const [tasks] = useState<Task[]>(loadTasks);

  useEffect(() => {
    const handler = () => {
      window.location.reload();
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const completed = tasks.filter((t) => t.completed).length;
  const active = tasks.length - completed;

  const pieData = [
    { name: "Completed", value: completed || 0 },
    { name: "Active", value: active || 0 },
  ];

  const barData = [
    { name: "Total", value: tasks.length },
    { name: "Completed", value: completed },
    { name: "Active", value: active },
  ];

  return (
    <div className="flex flex-1 flex-col items-center pt-10 pb-24 px-4 font-sans">
      <div className="w-full max-w-[700px] flex flex-col gap-7">
        <h1
          className="text-3xl font-bold text-foreground"
          data-aos="fade-down"
          data-aos-duration="600"
          data-aos-offset="0"
        >
          Reports
        </h1>

        {tasks.length === 0 ? (
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
                  <p className="text-3xl font-bold">{tasks.length}</p>
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
                    {completed}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-foreground/60">
                    Completion Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">
                    {tasks.length > 0
                      ? Math.round((completed / tasks.length) * 100)
                      : 0}
                    %
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Pie chart */}
            <Card
              data-aos="fade-up"
              data-aos-duration="600"
              data-aos-delay="200"
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
                        <Cell key={i} fill={PIE_COLORS[i]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Bar chart */}
            <Card
              data-aos="fade-up"
              data-aos-duration="600"
              data-aos-delay="300"
              data-aos-offset="0"
            >
              <CardHeader>
                <CardTitle>Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.922 0 0)" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" fill="oklch(0.3171 0 0)" radius={[4, 4, 0, 0]} />
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

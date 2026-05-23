"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const SETTINGS_KEY = "fokus-settings";

interface TimerSettings {
  pomodoro: number;
  shortBreak: number;
  longBreak: number;
}

const DEFAULTS: TimerSettings = {
  pomodoro: 25,
  shortBreak: 5,
  longBreak: 15,
};

function loadSettings(): TimerSettings {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? (JSON.parse(raw) as TimerSettings) : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<TimerSettings>(loadSettings);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  const update = (key: keyof TimerSettings, value: number) => {
    setSettings((prev) => ({ ...prev, [key]: Math.max(1, Math.min(120, value)) }));
    toast.success("Settings saved");
  };

  return (
    <div className="flex flex-1 flex-col items-center pt-10 pb-24 px-4 font-sans">
      <div className="w-full max-w-[500px] flex flex-col gap-7">
        <h1
          className="text-3xl font-bold text-foreground"
          data-aos="fade-down"
          data-aos-duration="600"
          data-aos-offset="0"
        >
          Settings
        </h1>

        <Card
          data-aos="fade-up"
          data-aos-duration="700"
          data-aos-offset="0"
        >
          <CardHeader
            data-aos="fade-up"
            data-aos-duration="600"
            data-aos-delay="100"
            data-aos-offset="0"
          >
            <CardTitle>Timer Durations (minutes)</CardTitle>
          </CardHeader>
          <CardContent
            className="flex flex-col gap-5"
            data-aos="fade-up"
            data-aos-duration="600"
            data-aos-delay="200"
            data-aos-offset="0"
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="pomodoro">Pomodoro</Label>
              <Input
                id="pomodoro"
                type="number"
                min={1}
                max={120}
                value={settings.pomodoro}
                onChange={(e) =>
                  update("pomodoro", Number(e.target.value))
                }
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="shortBreak">Short Break</Label>
              <Input
                id="shortBreak"
                type="number"
                min={1}
                max={120}
                value={settings.shortBreak}
                onChange={(e) =>
                  update("shortBreak", Number(e.target.value))
                }
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="longBreak">Long Break</Label>
              <Input
                id="longBreak"
                type="number"
                min={1}
                max={120}
                value={settings.longBreak}
                onChange={(e) =>
                  update("longBreak", Number(e.target.value))
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

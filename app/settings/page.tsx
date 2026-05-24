"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Settings, Sun, Moon, Monitor } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

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
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  const update = (key: keyof TimerSettings, value: number) => {
    setSettings((prev) => ({ ...prev, [key]: Math.max(1, Math.min(120, value)) }));
    toast.success("Settings saved", { icon: <Settings className="size-4" /> });
  };

  return (
    <div className="flex flex-1 flex-col items-center pt-10 pb-24 px-4 font-sans min-h-screen">
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

        <Card
          data-aos="fade-up"
          data-aos-duration="700"
          data-aos-delay="300"
          data-aos-offset="0"
        >
          <CardHeader
            data-aos="fade-up"
            data-aos-duration="600"
            data-aos-delay="400"
            data-aos-offset="0"
          >
            <CardTitle>Theme</CardTitle>
          </CardHeader>
          <CardContent
            data-aos="fade-up"
            data-aos-duration="600"
            data-aos-delay="500"
            data-aos-offset="0"
          >
            <ToggleGroup
              type="single"
              value={theme ?? "system"}
              onValueChange={(v) => v && setTheme(v)}
              variant="outline"
              className="w-full"
            >
              <ToggleGroupItem value="light" className="flex-1 gap-2">
                <Sun className="size-4" />
                Light
              </ToggleGroupItem>
              <ToggleGroupItem value="dark" className="flex-1 gap-2">
                <Moon className="size-4" />
                Dark
              </ToggleGroupItem>
              <ToggleGroupItem value="system" className="flex-1 gap-2">
                <Monitor className="size-4" />
                System
              </ToggleGroupItem>
            </ToggleGroup>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

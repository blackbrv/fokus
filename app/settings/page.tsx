"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Settings, Sun, Moon, Monitor } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { SETTINGS_KEY, loadSettings, type TimerSettings } from "@/hooks/timer/shared";

export default function SettingsPage() {
  const [settings, setSettings] = useState<TimerSettings>(loadSettings);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  const handleNumberChange = (key: "pomodoro" | "shortBreak" | "longBreak" | "sessionsBeforeLongBreak", value: number) => {
    const max = key === "sessionsBeforeLongBreak" ? 20 : 120;
    setSettings((prev) => ({ ...prev, [key]: Math.max(1, Math.min(max, value)) }));
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
              <p className="text-sm text-foreground/50 -mt-1">
                Focus session duration.
              </p>
              <Input
                id="pomodoro"
                type="number"
                min={1}
                max={120}
                value={settings.pomodoro}
                onChange={(e) =>
                  handleNumberChange("pomodoro", Number(e.target.value))
                }
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="shortBreak">Short Break</Label>
              <p className="text-sm text-foreground/50 -mt-1">
                Brief rest between pomodoros.
              </p>
              <Input
                id="shortBreak"
                type="number"
                min={1}
                max={120}
                value={settings.shortBreak}
                onChange={(e) =>
                  handleNumberChange("shortBreak", Number(e.target.value))
                }
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="longBreak">Long Break</Label>
              <p className="text-sm text-foreground/50 -mt-1">
                Extended rest after multiple pomodoros.
              </p>
              <Input
                id="longBreak"
                type="number"
                min={1}
                max={120}
                value={settings.longBreak}
                onChange={(e) =>
                  handleNumberChange("longBreak", Number(e.target.value))
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card
          data-aos="fade-up"
          data-aos-duration="700"
          data-aos-delay="200"
          data-aos-offset="0"
        >
          <CardHeader
            data-aos="fade-up"
            data-aos-duration="600"
            data-aos-delay="300"
            data-aos-offset="0"
          >
            <CardTitle>Session Cycle</CardTitle>
          </CardHeader>
          <CardContent
            className="flex flex-col gap-5"
            data-aos="fade-up"
            data-aos-duration="600"
            data-aos-delay="400"
            data-aos-offset="0"
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="sessionsBeforeLongBreak">
                Pomodoros before long break
              </Label>
              <p className="text-sm text-foreground/50 -mt-1">
                After this many pomodoros, a long break replaces the short break.
              </p>
              <Input
                id="sessionsBeforeLongBreak"
                type="number"
                min={1}
                max={20}
                value={settings.sessionsBeforeLongBreak}
                onChange={(e) =>
                  handleNumberChange("sessionsBeforeLongBreak", Number(e.target.value))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="autoStart" className="cursor-pointer">
                Auto-start sessions
              </Label>
              <Switch
                id="autoStart"
                checked={settings.autoStart}
                onCheckedChange={(checked: boolean) => {
                  setSettings((prev) => ({ ...prev, autoStart: checked }));
                  toast.success("Settings saved", { icon: <Settings className="size-4" /> });
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card
          data-aos="fade-up"
          data-aos-duration="700"
          data-aos-delay="500"
          data-aos-offset="0"
        >
          <CardHeader
            data-aos="fade-up"
            data-aos-duration="600"
            data-aos-delay="600"
            data-aos-offset="0"
          >
            <CardTitle>Theme</CardTitle>
            <p className="text-sm text-foreground/50">
              Choose between light, dark, or system theme.
            </p>
          </CardHeader>
          <CardContent
            className="flex flex-col gap-5"
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

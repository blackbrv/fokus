"use client";

import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "../ui/navigation-menu";
import { Clock, Settings, BarChart3 } from "lucide-react";

const timerMenuItems = [
  {
    title: "Timer",
    href: "/timer",
    icon: Clock,
    description: "Start a focused Pomodoro session",
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    description: "Customize your timer preferences",
  },
  {
    title: "Reports",
    href: "/reports",
    icon: BarChart3,
    description: "Track your focus sessions and progress",
  },
];

export default function Navbar() {
  return (
    <div
      className="flex sticky top-0 z-50 w-full p-4"
      data-aos="fade-down"
      data-aos-duration="600"
      data-aos-offset="0"
    >
      <NavigationMenu
        viewport={false}
        className="mx-auto h-max bg-foreground rounded-lg text-background p-2"
      >
        <NavigationMenuList>
          {/* Timer — dropdown */}
          <NavigationMenuItem>
            <NavigationMenuTrigger
              className={cn(
                "bg-transparent text-background font-semibold text-sm h-auto px-3 py-1.5 ",
                "focus:bg-background/10 focus:text-background hover:[&>svg]:text-foreground",
                "data-[state=open]:bg-background data-[state=open]:text-foreground data-[state=open]:[&>svg]:text-foreground",
                "[&>svg]:text-background/60",
              )}
            >
              Timer
            </NavigationMenuTrigger>
            <NavigationMenuContent className="min-w-55 p-1 bg-foreground border-background/20 text-background group-data-[viewport=false]/navigation-menu:bg-foreground">
              {timerMenuItems.map((item) => (
                <NavigationMenuLink
                  key={item.href}
                  href={item.href}
                  className="flex flex-row items-start gap-3 rounded-md px-3 py-2.5 hover:bg-background/10 hover:text-background"
                >
                  <item.icon className="mt-0.5 size-4 shrink-0 text-background/50" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold leading-none text-background">
                      {item.title}
                    </span>
                    <span className="text-xs text-background/50 leading-snug">
                      {item.description}
                    </span>
                  </div>
                </NavigationMenuLink>
              ))}
            </NavigationMenuContent>
          </NavigationMenuItem>

          {/* Tasks */}
          <NavigationMenuItem>
            <NavigationMenuLink className="font-semibold" href="/tasks">
              Tasks
            </NavigationMenuLink>
          </NavigationMenuItem>

          {/* Sign in */}
          <NavigationMenuItem>
            <NavigationMenuLink className="font-semibold" href="/login">
              Sign in
            </NavigationMenuLink>
          </NavigationMenuItem>

          {/* Sign up — reverted */}
          <NavigationMenuItem>
            <NavigationMenuLink
              className="font-semibold hover:bg-foreground bg-background hover:text-background text-foreground"
              href="/register"
            >
              Sign up
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
}

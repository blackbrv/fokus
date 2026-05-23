"use client";

import Link from "next/link";
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
      <div className="mx-auto flex items-center gap-1 bg-foreground text-background rounded-xl px-2 py-1.5 shadow-sm">
        {/* Fokus logo */}
        <Link
          href="/"
          className="flex flex-col items-center justify-center w-[42px] h-[50px] bg-background text-foreground rounded-md font-black text-[10px] leading-[1.2] tracking-widest shrink-0 mr-1 select-none hover:opacity-90 transition-opacity"
        >
          <span>FOK</span>
          <span>US</span>
        </Link>

        <NavigationMenu viewport={false} className="bg-transparent">
          <NavigationMenuList className="gap-0.5">
            {/* Timer — dropdown */}
            <NavigationMenuItem>
              <NavigationMenuTrigger
                className={cn(
                  "bg-transparent text-background font-semibold text-sm py-2 px-2",
                  "hover:bg-background hover:text-foreground",
                  "focus:bg-background focus:text-foreground",
                  "data-[state=open]:bg-background data-[state=open]:text-foreground",
                  "[&>svg]:text-background/60 data-[state=open]:[&>svg]:text-foreground",
                )}
              >
                Timer
              </NavigationMenuTrigger>
              <NavigationMenuContent className="min-w-[220px] p-1 bg-foreground border-background/20 text-background group-data-[viewport=false]/navigation-menu:bg-foreground">
                {timerMenuItems.map((item) => (
                  <NavigationMenuLink
                    asChild
                    key={item.href}
                    className="flex flex-row items-start gap-3 rounded-md px-3 py-2.5 hover:bg-background/10 hover:text-background"
                  >
                    <Link href={item.href}>
                      <item.icon className="mt-0.5 size-4 shrink-0 text-background/50" />
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-semibold leading-none text-background">
                          {item.title}
                        </span>
                        <span className="text-xs text-background/50 leading-snug">
                          {item.description}
                        </span>
                      </div>
                    </Link>
                  </NavigationMenuLink>
                ))}
              </NavigationMenuContent>
            </NavigationMenuItem>

            {/* Tasks */}
            <NavigationMenuItem>
              <NavigationMenuLink
                className="font-semibold text-background hover:bg-background hover:text-foreground"
                href="/tasks"
              >
                Tasks
              </NavigationMenuLink>
            </NavigationMenuItem>

            {/* Sign in */}
            <NavigationMenuItem>
              <NavigationMenuLink
                className="font-semibold text-background hover:bg-background hover:text-foreground"
                href="/login"
              >
                Sign in
              </NavigationMenuLink>
            </NavigationMenuItem>

            {/* Sign up — inverted */}
            <NavigationMenuItem>
              <NavigationMenuLink
                className="font-semibold bg-background text-foreground hover:bg-foreground hover:text-background"
                href="/register"
              >
                Sign up
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";
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
          className="shrink-0 mr-1 select-none hover:opacity-90 transition-opacity"
        >
          <Image
            src="/images/Fokus-large-transparent-logo.png"
            alt="Fokus"
            width={42}
            height={50}
            className="h-[50px] w-auto rounded-md"
          />
        </Link>

        <NavigationMenu viewport={false} className="bg-transparent">
          <NavigationMenuList className="gap-1">
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
                asChild
                className="font-semibold text-background hover:bg-background hover:text-foreground"
              >
                <Link href="/tasks">Tasks</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            {/* Sign in */}
            <NavigationMenuItem>
              <NavigationMenuLink
                asChild
                className="font-semibold text-background hover:bg-background hover:text-foreground"
              >
                <Link href="/login">Sign in</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            {/* Sign up — inverted */}
            <NavigationMenuItem>
              <NavigationMenuLink
                asChild
                className="font-semibold bg-background text-foreground hover:bg-foreground hover:text-background"
              >
                <Link href="/register">Sign up</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </div>
  );
}

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
import { Clock, Settings, BarChart3, Palette, UserRound, LogOut, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { ThemeDialog } from "@/components/theme/ThemeDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut, useAuth } from "@/hooks/use-auth";
import { firebaseEnabled } from "@/lib/firebase";

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

const iconBtn =
  "flex size-9 items-center justify-center rounded-md text-background/70 hover:bg-background hover:text-foreground data-[state=open]:bg-background data-[state=open]:text-foreground transition-colors cursor-pointer";

function AccountButton() {
  const { user, profile, loading } = useAuth();
  if (!firebaseEnabled) return null;

  if (loading || !user) {
    return (
      <Link href="/login" aria-label="Sign in" className={cn(iconBtn, loading && "pointer-events-none opacity-50")}>
        <UserRound className="size-4" />
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button aria-label="Account menu" className={iconBtn}>
          <UserRound className="size-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="min-w-[200px] bg-foreground text-background border-background/20"
      >
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="truncate text-sm font-semibold">{profile?.displayName ?? user.email}</span>
          {profile && <span className="truncate text-xs font-normal text-background/50">@{profile.username}</span>}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-background/15" />
        <DropdownMenuItem asChild className="focus:bg-background/10 focus:text-background [&_svg]:text-background/50">
          <Link href="/account">
            <UserRound /> Account
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="focus:bg-background/10 focus:text-background [&_svg]:text-background/50">
          <Link href="/welcome">
            <BookOpen /> Getting started
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={async () => {
            await signOut();
            toast("Signed out", { icon: <LogOut className="size-4" /> });
          }}
          className="focus:bg-background/10 focus:text-background [&_svg]:text-background/50"
        >
          <LogOut /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

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

            {/* Themes */}
            <NavigationMenuItem>
              <NavigationMenuLink
                asChild
                className="font-semibold text-background hover:bg-background hover:text-foreground"
              >
                <Link href="/themes">Themes</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

          </NavigationMenuList>
        </NavigationMenu>

        <ThemeDialog>
          <button
            aria-label="Customize theme"
            className="ml-1 flex size-9 items-center justify-center rounded-md text-background/70 hover:bg-background hover:text-foreground transition-colors cursor-pointer"
          >
            <Palette className="size-4" />
          </button>
        </ThemeDialog>
        <AccountButton />
      </div>
    </div>
  );
}

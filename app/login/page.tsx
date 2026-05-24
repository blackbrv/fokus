"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 font-sans min-h-screen">
      <Card
        className="w-full max-w-[400px]"
        data-aos="fade-up"
        data-aos-duration="700"
        data-aos-offset="0"
      >
        <CardHeader
          className="text-center"
          data-aos="fade-up"
          data-aos-duration="600"
          data-aos-delay="100"
          data-aos-offset="0"
        >
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>
            Authentication is coming soon. This is a preview.
          </CardDescription>
        </CardHeader>
        <CardContent
          className="flex flex-col gap-4"
          data-aos="fade-up"
          data-aos-duration="600"
          data-aos-delay="200"
          data-aos-offset="0"
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="••••••••" />
          </div>
        </CardContent>
        <CardFooter
          className="flex-col gap-3"
          data-aos="fade-up"
          data-aos-duration="600"
          data-aos-delay="300"
          data-aos-offset="0"
        >
          <Button className="w-full" disabled>
            Sign In
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="underline underline-offset-2 hover:text-foreground"
            >
              Register
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

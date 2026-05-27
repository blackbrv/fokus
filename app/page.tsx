"use client";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center font-sans min-h-screen pb-4">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-20 px-16 sm:items-start">
        <div className="w-max h-max mx-auto flex flex-col gap-10 items-center justify-center">
          <h1
            className="text-foreground text-6xl font-bold text-center"
            data-aos="fade-up"
            data-aos-duration="800"
            data-aos-offset="0"
          >
            Focus Deeper. <br /> Work Sharper.
          </h1>

          <p
            className="text-center text-foreground/50 font-medium"
            data-aos="fade-up"
            data-aos-duration="800"
            data-aos-delay="120"
            data-aos-offset="0"
          >
            A minimal Pomodoro timer designed to help you stay focused, <br />
            build momentum, and finish meaningful work sessions with clarity.
          </p>

          <div
            className="flex flex-col gap-2 w-max items-center justify-center"
            data-aos="fade-up"
            data-aos-duration="800"
            data-aos-delay="240"
            data-aos-offset="0"
          >
            <Button
              asChild
              className="w-max font-medium flex items-center justify-center bg-foreground"
            >
              <Link href={"/timer"}>
                <span>Start Fokusing</span>
                <ArrowRight strokeWidth={2.5} />
              </Link>
            </Button>
            <p className="text-md text-foreground/50 font-medium">
              Free plan. No card required
            </p>
          </div>
        </div>
      </main>

      <div
        className="relative min-w-4xl min-h-150 rounded-xl border border-accent-foreground"
        data-aos="fade-up"
        data-aos-duration="1000"
        data-aos-delay="360"
        data-aos-offset="0"
      >
        <Image
          className="object-cover rounded-xl"
          alt="landing-page-showcase"
          fill
          src="/images/Landing-page-showcase.png"
        />
      </div>
    </div>
  );
}

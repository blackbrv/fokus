import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center font-sans">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-20 px-16 sm:items-start">
        <div className="w-max h-max mx-auto flex flex-col gap-10 items-center justify-center">
          <h1 className="text-foreground text-6xl font-bold text-center">
            Focus Deeper. <br /> Work Sharper.
          </h1>
          <p className="text-center text-foreground/50 font-medium">
            A minimal Pomodoro timer designed to help you stay focused, <br />
            build momentum, and finish meaningful work sessions with clarity.
          </p>

          <div className="flex flex-col gap-2 w-max items-center justify-center">
            <Button className="w-max font-medium flex items-center justify-center">
              Start Fokusing
              <ArrowRight strokeWidth={2.5} />
            </Button>
            <p className="text-md text-foreground/50 font-medium">
              Free plan. No card required
            </p>
          </div>
        </div>
      </main>
      <div className="relative min-w-4xl min-h-150 rounded-xl border border-accent-foreground">
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

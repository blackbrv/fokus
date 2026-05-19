export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center font-sans">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-20 px-16 sm:items-start">
        <div className="w-max h-max mx-auto flex flex-col gap-10">
          <h1 className="text-foreground text-6xl font-bold text-center">
            Focus Deeper. <br /> Work Sharper.
          </h1>
          <p className="text-center text-foreground/50 font-medium">
            A minimal Pomodoro timer designed to help you stay focused, <br />
            build momentum, and finish meaningful work sessions with clarity.
          </p>
        </div>
      </main>
    </div>
  );
}

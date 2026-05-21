"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import AOS from "aos";
import "aos/dist/aos.css";

export function AosProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    AOS.init({
      duration: 600,
      easing: "ease-out-cubic",
      once: true,
      offset: 50,
    });
  }, []);

  const pathname = usePathname();

  useEffect(() => {
    AOS.refresh();
  }, [pathname]);

  return <>{children}</>;
}

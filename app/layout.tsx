import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { AosProvider } from "@/components/aos-provider";
import "./globals.css";
import Navbar from "@/components/compiled-ui/Navbar";
import Footer from "@/components/compiled-ui/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Fokus — Minimal Pomodoro Timer for Deep Focus",
    template: "%s | Fokus",
  },
  description:
    "A minimal Pomodoro timer designed to help you stay focused, build momentum, and finish meaningful work sessions with clarity.",
  metadataBase: new URL("https://fokus-cyan-six.vercel.app"),
  alternates: { canonical: "/" },
  keywords: [
    "Pomodoro timer",
    "focus app",
    "productivity tool",
    "Next.js timer",
    "task manager",
    "time management",
  ],
  authors: [{ name: "Lpdev" }],
  creator: "Lpdev",
  publisher: "Lpdev",
  category: "productivity",
  robots: { index: true, follow: true },
  openGraph: {
    title: "Fokus — Minimal Pomodoro Timer for Deep Focus",
    description:
      "A minimal Pomodoro timer designed to help you stay focused, build momentum, and finish meaningful work sessions with clarity.",
    url: "https://fokus-cyan-six.vercel.app",
    siteName: "Fokus",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "https://fokus-cyan-six.vercel.app/Fokus-landing-page.png",
        width: 2855,
        height: 1381,
        alt: "Fokus Pomodoro Timer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fokus — Minimal Pomodoro Timer for Deep Focus",
    description:
      "A minimal Pomodoro timer designed to help you stay focused, build momentum, and finish meaningful work sessions with clarity.",
    images: ["https://fokus-cyan-six.vercel.app/Fokus-landing-page.png"],
    creator: "@lpdev",
  },
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col relative">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            <AosProvider>
              <Navbar />
              {children}
              <Footer />
            </AosProvider>
          </TooltipProvider>
          <Toaster richColors position="top-right" />
          <Script
            id="structured-data"
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "SoftwareApplication",
                name: "Fokus",
                applicationCategory: "ProductivityApplication",
                operatingSystem: "Web",
                description:
                  "A minimal Pomodoro timer designed to help you stay focused, build momentum, and finish meaningful work sessions with clarity.",
                url: "https://fokus-cyan-six.vercel.app",
                offers: {
                  "@type": "Offer",
                  price: "0",
                  priceCurrency: "USD",
                },
                author: {
                  "@type": "Person",
                  name: "Lpdev",
                },
              }),
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}

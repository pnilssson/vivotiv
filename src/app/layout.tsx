import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

import { cn } from "@/lib/utils";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Toaster } from "@/components/ui/toaster";
import Termly from "@/components/shared/termly";

export const metadata: Metadata = {
  applicationName: "Vivotiv",
  title: "Vivotiv - Training made easy",
  description:
    "Revolutionize your home workouts with AI-powered tailor-made training programs just for you. Say goodbye to guesswork and hello to effective, personalized workouts designed specifically for your home environment. Start your fitness journey today!",
  generator: "Next.js",
  keywords: [
    "tailor-made programs",
    "personalized training programs",
    "training personalized for you",
    "working out from home",
    "individualized workout program",
    "custom training plans",
    "home workout plans",
    "effective home training",
    "personalized home workout plans",
    "ai workouts",
    "train from home program",
    "home training workouts",
    "personal home workouts",
    "custom workout program"
  ],
  alternates: {
    canonical: "./",
  },
  openGraph: {
    title: "Vivotiv - Training made easy",
    description:
      "Revolutionize your home workouts with AI-powered tailor-made training programs just for you.",
    url: "./",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          GeistSans.variable,
          GeistMono.variable
        )}>
        <link rel="icon" type="image/svg+xml" href="favicon.svg" />
        {children}
        <SpeedInsights />
        <Analytics />
        <Toaster />
        <Termly websiteUUID={process.env.TERMLY_WEBSITE_UUID!} />
      </body>
    </html>
  );
}

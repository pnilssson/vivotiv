import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import "./globals.css";

import { cn } from "@/lib/utils";
import Navbar from "@/components/navbar";
import { auth } from "@/auth";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Vivotiv",
  description:
    "Revolutionize your home workouts with AI-powered tailor-made training programs just for you. Say goodbye to guesswork and hello to effective, personalized workouts designed specifically for your home environment. Start your fitness journey today!",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased container",
          fontSans.variable
        )}>
        <Navbar session={session} />
        {children}
      </body>
    </html>
  );
}

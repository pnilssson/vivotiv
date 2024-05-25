import type { Metadata } from "next";
import "./globals.css";

import { cn } from "@/lib/utils";
import Navbar from "@/components/navbar";
import LoginButton from "@/components/buttons/login-button";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";

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
  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          GeistSans.variable,
          GeistMono.variable
        )}>
        <Navbar>
          <LoginButton />
        </Navbar>
        {children}
      </body>
    </html>
  );
}

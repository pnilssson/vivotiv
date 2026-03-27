import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { headers } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";

import { locales } from "@vivotiv/shared";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vivotiv",
  description: "Free website scan",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headerStore = await headers();
  const localeHeader = headerStore.get("x-next-intl-locale");
  const lang = hasLocale(locales, localeHeader) ? localeHeader : "en";

  return (
    <html
      lang={lang}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

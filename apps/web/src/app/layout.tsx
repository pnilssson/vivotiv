import { hasLocale } from "next-intl";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";

import { locales, publicSiteOrigin } from "@vivotiv/shared";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(publicSiteOrigin),
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
      className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} h-full antialiased overflow-x-clip`}
    >
      <body className="min-h-full flex flex-col overflow-x-clip">{children}</body>
    </html>
  );
}

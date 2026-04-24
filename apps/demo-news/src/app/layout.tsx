import type { ReactNode } from "react";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Nanopayer Times — AI-era journalism, priced per read",
  description:
    "Every article on this site is HTTP 402-gated. Humans read free. Bots pay $0.001 per request in USDC on Circle infrastructure. Powered by Tollgate.",
  openGraph: {
    title: "The Nanopayer Times",
    description:
      "AI-era journalism, priced per read. HTTP 402 paywall · Circle · Arc.",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

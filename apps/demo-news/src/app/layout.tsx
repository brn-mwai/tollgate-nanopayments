import type { ReactNode } from "react";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://demo-news.brianmwai.com"),
  title: "The Nanopayer Times — AI-era journalism, priced per read",
  description:
    "Every article on this site is HTTP 402-gated. Humans read free. Bots pay $0.001 per request in USDC on Circle infrastructure. Powered by Tollgate.",
  openGraph: {
    title: "The Nanopayer Times — Powered by Tollgate",
    description:
      "AI-era journalism, priced per read. Every article is HTTP 402-gated. Humans read free. Bots pay $0.001 per request in USDC on Circle infrastructure.",
    url: "https://demo-news.brianmwai.com",
    siteName: "The Nanopayer Times",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 2400,
        height: 1260,
        alt: "Tollgate — Charge AI bots per request in USDC",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Nanopayer Times — Powered by Tollgate",
    description:
      "Humans read free. Bots pay $0.001 per request in USDC. HTTP 402 paywall on Circle + Arc.",
    images: ["/og.png"],
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

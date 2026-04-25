import type { Metadata } from "next";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tollgate · Pay per request on Arc",
  description:
    "Bot-economics payment rail on Arc. HTTP 402 + USDC. Every AI scrape becomes a transaction, not a theft.",
  metadataBase: new URL("https://tollgate.brianmwai.com"),
  openGraph: {
    title: "Tollgate — Charge AI bots per request in USDC",
    description:
      "A dashboard and middleware that lets any publisher charge AI bots per request in USDC over the open x402 standard. Priced by Gemini. Settled on Arc.",
    url: "https://tollgate.brianmwai.com",
    siteName: "Tollgate",
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
    title: "Tollgate — Charge AI bots per request in USDC",
    description:
      "A dashboard and middleware that lets any publisher charge AI bots per request in USDC. Priced by Gemini. Settled on Arc.",
    images: ["/og.png"],
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Instrument+Serif&family=JetBrains+Mono:wght@400;500;600;700&family=Instrument+Sans:wght@600;700&display=swap"
          rel="stylesheet"
        />
        {/* Hoist theme before React hydrates to prevent flash of wrong theme. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var m=localStorage.getItem('tollgate-theme');if(!m||m==='system'){m=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.setAttribute('data-theme',m)}catch(e){}})();`,
          }}
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

import Link from "next/link";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

export default function LandingPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background:
          "radial-gradient(ellipse at top, rgba(230,0,126,0.12), transparent 60%), radial-gradient(ellipse at bottom, rgba(39,117,202,0.1), transparent 60%), #0A0B10",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 32px",
        }}
      >
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            textDecoration: "none",
            color: "#E8E9F0",
          }}
        >
          <svg width="26" height="26" viewBox="0 0 129 155" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.5 21.5L0 38V116.5L15.5 133.5V21.5Z" fill="#fff" />
            <path d="M63.5 21.5L32 38V116.5L63.5 133.5V21.5Z" fill="#fff" />
            <path d="M129 21.5L80 38V116.5L129 133.5V21.5Z" fill="#fff" />
          </svg>
          <span
            style={{
              fontFamily: "Instrument Sans, sans-serif",
              fontWeight: 700,
              fontSize: 18,
              letterSpacing: "0.01em",
            }}
          >
            Tollgate
          </span>
        </Link>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button type="button" style={ghostBtn}>Sign in</button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button type="button" style={primaryBtn}>Sign up</button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <Link href="/app" style={primaryBtn}>Go to dashboard</Link>
            <UserButton afterSignOutUrl="/" />
          </Show>
        </div>
      </header>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ maxWidth: 760, textAlign: "center" }}>
          <h1
            style={{
              fontFamily: "Instrument Serif, serif",
              fontSize: "clamp(40px, 7vw, 72px)",
              fontWeight: 400,
              lineHeight: 1.04,
              letterSpacing: "-0.02em",
              marginBottom: 20,
              color: "#E8E9F0",
            }}
          >
            Every AI scrape becomes a transaction, not a theft.
          </h1>
          <p
            style={{
              fontSize: 17,
              color: "#8A8CA0",
              lineHeight: 1.5,
              maxWidth: 560,
              margin: "0 auto 36px",
            }}
          >
            The payment layer Andreessen said was missing. HTTP 402 + USDC on Arc. Publishers charge AI
            bots per request. Sub-cent pricing, 96% margin, settled onchain in a second.
          </p>
          <div style={{ display: "inline-flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
            <Show when="signed-out">
              <SignUpButton mode="modal">
                <button type="button" style={primaryBtnLarge}>Start monetising bot traffic</button>
              </SignUpButton>
              <SignInButton mode="modal">
                <button type="button" style={ghostBtnLarge}>Sign in</button>
              </SignInButton>
            </Show>
            <Show when="signed-in">
              <Link href="/app" style={primaryBtnLarge}>Open dashboard</Link>
            </Show>
          </div>
        </div>
      </div>
    </main>
  );
}

const primaryBtn = {
  display: "inline-flex",
  alignItems: "center" as const,
  gap: 6,
  padding: "8px 16px",
  fontSize: 13,
  fontWeight: 600,
  color: "#FFFFFF",
  background: "linear-gradient(155deg, #FF3CC0 0%, #FF00AA 55%, #E60098 100%)",
  border: "1px solid #B3007D",
  borderRadius: 6,
  cursor: "pointer",
  textDecoration: "none",
  boxShadow:
    "inset 0 1px 0 rgba(255,255,255,0.28), inset 0 -1px 1px rgba(0,0,0,0.18), 0 1px 2px rgba(0,0,0,0.20)",
  textShadow: "0 1px 0 rgba(0,0,0,0.2)",
  fontFamily: "inherit",
};

const primaryBtnLarge = {
  ...primaryBtn,
  padding: "12px 24px",
  fontSize: 14,
};

const ghostBtn = {
  display: "inline-flex",
  alignItems: "center" as const,
  gap: 6,
  padding: "8px 14px",
  fontSize: 13,
  fontWeight: 500,
  color: "#E8E9F0",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 6,
  cursor: "pointer",
  textDecoration: "none",
  fontFamily: "inherit",
};

const ghostBtnLarge = {
  ...ghostBtn,
  padding: "12px 20px",
  fontSize: 14,
};

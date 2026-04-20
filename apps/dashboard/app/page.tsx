import Link from "next/link";

export default function LandingPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background:
          "radial-gradient(ellipse at top, rgba(230,0,126,0.12), transparent 60%), radial-gradient(ellipse at bottom, rgba(39,117,202,0.1), transparent 60%), #0A0B10",
      }}
    >
      <div style={{ maxWidth: 720, textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
          <svg width="32" height="32" viewBox="0 0 129 155" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.5 21.5L0 38V116.5L15.5 133.5V21.5Z" fill="#fff" />
            <path d="M63.5 21.5L32 38V116.5L63.5 133.5V21.5Z" fill="#fff" />
            <path d="M129 21.5L80 38V116.5L129 133.5V21.5Z" fill="#fff" />
          </svg>
          <span
            style={{
              fontFamily: "Instrument Sans, sans-serif",
              fontWeight: 700,
              fontSize: 22,
              letterSpacing: "0.01em",
              color: "#E8E9F0",
            }}
          >
            Tollgate
          </span>
          <span className="pill pill-pink badge-3d">Beta</span>
        </div>
        <h1
          style={{
            fontFamily: "Instrument Serif, serif",
            fontSize: "clamp(36px, 6vw, 64px)",
            fontWeight: 400,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            marginBottom: 18,
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
            maxWidth: 520,
            margin: "0 auto 32px",
          }}
        >
          The payment layer Andreessen said was missing. HTTP 402 + USDC on Arc. Publishers charge AI
          bots per request. Sub-cent pricing, 96% margin, settled onchain in a second.
        </p>
        <div style={{ display: "inline-flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
          <Link
            href="/sign-up"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 20px",
              fontSize: 14,
              fontWeight: 600,
              color: "#FFFFFF",
              background: "linear-gradient(155deg, #FF3CC0 0%, #FF00AA 55%, #E60098 100%)",
              border: "1px solid #B3007D",
              borderRadius: 6,
              textDecoration: "none",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.28), inset 0 -1px 1px rgba(0,0,0,0.18), 0 1px 2px rgba(0,0,0,0.20)",
              textShadow: "0 1px 0 rgba(0,0,0,0.2)",
            }}
          >
            Start monetising bot traffic
          </Link>
          <Link
            href="/sign-in"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 20px",
              fontSize: 14,
              fontWeight: 500,
              color: "#E8E9F0",
              background: "#101420",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 6,
              textDecoration: "none",
            }}
          >
            Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}

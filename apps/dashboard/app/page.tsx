import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";

export const dynamic = "force-dynamic";

export default function Landing() {
  return (
    <main style={{ background: "var(--bg-shell)", color: "var(--text-1)" }}>
      <Nav />
      <Hero />
      <Proof />
      <HowItWorks />
      <Pricing />
      <Stack />
      <CTA />
      <Footer />
    </main>
  );
}

function Nav() {
  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 28px",
        borderBottom: "1px solid var(--border-s)",
        background: "rgba(10,11,16,0.72)",
        backdropFilter: "blur(14px)",
      }}
    >
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
        <svg width="22" height="26" viewBox="0 0 129 155" xmlns="http://www.w3.org/2000/svg">
          <path d="M15.5 21.5L0 38V116.5L15.5 133.5V21.5Z" fill="#FF00AA" />
          <path d="M63.5 21.5L32 38V116.5L63.5 133.5V21.5Z" fill="#FF00AA" />
          <path d="M129 21.5L80 38V116.5L129 133.5V21.5Z" fill="#FF00AA" />
        </svg>
        <span style={{ fontSize: 17, fontWeight: 700, color: "var(--text-1)", letterSpacing: "-0.01em" }}>
          Tollgate
        </span>
      </Link>
      <div style={{ display: "flex", gap: 22, alignItems: "center" }}>
        <Link href="#how" style={navLink}>How it works</Link>
        <Link href="#pricing" style={navLink}>Pricing</Link>
        <Link href="#stack" style={navLink}>Stack</Link>
        <a href="https://demo-news.brianmwai.com" style={navLink} target="_blank" rel="noopener noreferrer">
          Live demo
        </a>
        <a href="https://github.com/brn-mwai/tollgate" style={navLink} target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
        <SignedOut>
          <Link href="/sign-in" style={ghostBtn}>Sign in</Link>
          <Link href="/sign-up" style={primaryBtn}>Start</Link>
        </SignedOut>
        <SignedIn>
          <Link href="/app" style={primaryBtn}>Open dashboard</Link>
        </SignedIn>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section
      style={{
        padding: "104px 28px 80px",
        maxWidth: 1200,
        margin: "0 auto",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at top right, rgba(255,60,192,0.1), transparent 60%), radial-gradient(ellipse at bottom left, rgba(39,117,202,0.08), transparent 60%)",
          pointerEvents: "none",
        }}
      />
      <div style={{ position: "relative", textAlign: "center", maxWidth: 880, margin: "0 auto" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 14px",
            borderRadius: 999,
            border: "1px solid rgba(255,60,192,0.35)",
            background: "rgba(255,60,192,0.06)",
            fontSize: 11.5,
            fontFamily: "JetBrains Mono, monospace",
            color: "var(--pink-bright)",
            letterSpacing: "0.06em",
            marginBottom: 28,
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#06A77D", boxShadow: "0 0 8px #06A77D" }} />
          Live · 180+ real onchain settlements on Base Sepolia
        </div>
        <h1
          style={{
            fontFamily: "Instrument Serif, serif",
            fontSize: "clamp(48px, 8vw, 102px)",
            fontWeight: 400,
            lineHeight: 1.0,
            letterSpacing: "-0.03em",
            margin: "0 0 24px",
          }}
        >
          Every AI scrape becomes{" "}
          <span style={{ color: "var(--pink-bright)" }}>revenue</span>,<br />
          not theft.
        </h1>
        <p
          style={{
            fontSize: 19,
            color: "var(--text-2)",
            lineHeight: 1.55,
            maxWidth: 720,
            margin: "0 auto 40px",
          }}
        >
          Tollgate is the HTTP 402 payment rail for the agent economy. Install the
          middleware, provision a Circle Wallet, charge AI bots per request in USDC. Sub-cent
          pricing, 99% margin, settled onchain. No API keys. No subscriptions. No humans in the
          loop.
        </p>
        <div style={{ display: "inline-flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <SignedOut>
            <Link href="/sign-up" style={primaryBtnLarge}>Start monetising bot traffic →</Link>
            <a
              href="https://demo-news.brianmwai.com"
              target="_blank"
              rel="noopener noreferrer"
              style={ghostBtnLarge}
            >
              See it running live
            </a>
          </SignedOut>
          <SignedIn>
            <Link href="/app" style={primaryBtnLarge}>Open dashboard →</Link>
            <a
              href="https://demo-news.brianmwai.com"
              target="_blank"
              rel="noopener noreferrer"
              style={ghostBtnLarge}
            >
              See it running live
            </a>
          </SignedIn>
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 12,
            color: "var(--text-3)",
            fontFamily: "JetBrains Mono, monospace",
            letterSpacing: "0.03em",
          }}
        >
          Built for the{" "}
          <a
            href="https://lablab.ai/ai-hackathons/nano-payments-arc"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--pink-bright)" }}
          >
            Agentic Economy on Arc
          </a>{" "}
          hackathon · April 2026
        </div>
      </div>
    </section>
  );
}

function Proof() {
  const stats = [
    { label: "Onchain settlements", value: "180+", sub: "real Base Sepolia txs" },
    { label: "Per-request price", value: "$0.001", sub: "cap $0.01 · Gemini priced" },
    { label: "Margin on Arc", value: "99.2%", sub: "vs −19,900% on Ethereum" },
    { label: "Compression ratio", value: "5–50×", sub: "receipts cache onchain" },
  ];
  return (
    <section style={{ padding: "0 28px 80px", maxWidth: 1200, margin: "0 auto" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 1,
          background: "var(--border)",
          border: "1px solid var(--border)",
          borderRadius: 14,
          overflow: "hidden",
        }}
      >
        {stats.map((s) => (
          <div key={s.label} style={{ padding: "26px 24px", background: "var(--bg-card)" }}>
            <div
              style={{
                fontSize: 10.5,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--text-3)",
                fontFamily: "JetBrains Mono, monospace",
                marginBottom: 12,
              }}
            >
              {s.label}
            </div>
            <div
              style={{
                fontFamily: "Instrument Serif, serif",
                fontSize: 42,
                lineHeight: 1,
                color: "var(--text-1)",
                marginBottom: 8,
              }}
            >
              {s.value}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-3)" }}>{s.sub}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "Bot sends a GET",
      body: "A crawler, LLM trainer, or research agent fetches a protected URL. No API key. No OAuth. Just HTTP.",
      code: "GET /api/articles/arc-primer",
    },
    {
      num: "02",
      title: "Your site returns 402",
      body: "Tollgate's middleware replies with a signed x402 quote carrying a nonce, price, and your Circle Wallet as payTo.",
      code: "HTTP 402 · $0.001 USDC · nonce:n_...",
    },
    {
      num: "03",
      title: "Agent authorizes USDC",
      body: "Circle Transfer fires onchain. Tx confirms on Base Sepolia (Arc when Circle enables it) in seconds.",
      code: "tx 0xe37676... ✓ CONFIRMED",
    },
    {
      num: "04",
      title: "Content served + cached",
      body: "A 5-minute HMAC receipt attaches. Next 50 reads from that agent skip the facilitator. One tx, many hits.",
      code: "X-Tollgate-Receipt-Set: v1.ey...",
    },
  ];
  return (
    <section id="how" style={{ padding: "80px 28px", maxWidth: 1200, margin: "0 auto" }}>
      <SectionHeader kicker="How it works" title="Four steps between request and revenue" />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 16,
          marginTop: 40,
        }}
      >
        {steps.map((s) => (
          <div
            key={s.num}
            style={{
              padding: 24,
              border: "1px solid var(--border)",
              borderRadius: 12,
              background: "var(--bg-card)",
            }}
          >
            <div
              style={{
                fontFamily: "Instrument Serif, serif",
                fontSize: 34,
                color: "var(--pink-bright)",
                marginBottom: 12,
              }}
            >
              {s.num}
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-1)", marginBottom: 10 }}>
              {s.title}
            </div>
            <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.55, margin: "0 0 14px" }}>
              {s.body}
            </p>
            <div
              style={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: 11,
                padding: "7px 10px",
                border: "1px solid var(--border-s)",
                borderRadius: 6,
                background: "rgba(0,0,0,0.35)",
                color: "var(--text-1)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {s.code}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section
      id="pricing"
      style={{ padding: "80px 28px", maxWidth: 1200, margin: "0 auto" }}
    >
      <SectionHeader
        kicker="Unit economics"
        title="Only Arc makes per-request paywalls profitable"
      />
      <p
        style={{
          fontSize: 15,
          color: "var(--text-2)",
          maxWidth: 680,
          marginTop: 12,
          lineHeight: 1.6,
        }}
      >
        A single $0.001 API call shipped onchain. Same load, four chains. Arc is the only place
        where the spreadsheet is green &mdash; by a factor of 125.
      </p>
      <div
        style={{
          marginTop: 32,
          border: "1px solid var(--border)",
          borderRadius: 14,
          overflow: "hidden",
          background: "var(--bg-card)",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr>
              {["Chain", "Gas / tx", "Net / request", "Margin", "Verdict"].map((h) => (
                <th
                  key={h}
                  style={{
                    textAlign: "left",
                    padding: "14px 20px",
                    fontSize: 11,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "var(--text-3)",
                    fontWeight: 500,
                    borderBottom: "1px solid var(--border)",
                    background: "rgba(255,255,255,0.015)",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <PricingRow chain="Arc (USDC native gas)" gas="$0.00002" net="+$0.00098" margin="99.2%" verdict="Tollgate ships here" tone="good" />
            <PricingRow chain="Solana" gas="$0.00025" net="+$0.00075" margin="75%" verdict="Works but stablecoin gas is different" tone="ok" />
            <PricingRow chain="Polygon" gas="$0.0016" net="−$0.0006" margin="−60%" verdict="Gas exceeds revenue" tone="bad" />
            <PricingRow chain="Ethereum L1" gas="$0.50" net="−$0.499" margin="−49,900%" verdict="Every call loses half a dollar" tone="bad" />
          </tbody>
        </table>
      </div>
      <p style={{ marginTop: 16, fontSize: 12, color: "var(--text-3)" }}>
        Figures assume $0.001 revenue per request. Full derivation + compression math in the{" "}
        <a
          href="https://github.com/brn-mwai/tollgate/blob/main/docs/MARGIN.md"
          style={{ color: "var(--pink-bright)" }}
        >
          MARGIN.md
        </a>{" "}
        doc.
      </p>
    </section>
  );
}

function PricingRow({
  chain,
  gas,
  net,
  margin,
  verdict,
  tone,
}: {
  chain: string;
  gas: string;
  net: string;
  margin: string;
  verdict: string;
  tone: "good" | "ok" | "bad";
}) {
  const color = tone === "good" ? "#06A77D" : tone === "ok" ? "#F2A541" : "#E84A53";
  return (
    <tr style={{ borderTop: "1px solid var(--border-s)" }}>
      <td style={{ padding: "16px 20px", color: "var(--text-1)", fontWeight: 500 }}>{chain}</td>
      <td style={{ padding: "16px 20px", fontFamily: "JetBrains Mono, monospace", color: "var(--text-2)" }}>
        {gas}
      </td>
      <td style={{ padding: "16px 20px", fontFamily: "JetBrains Mono, monospace", color }}>{net}</td>
      <td style={{ padding: "16px 20px", fontFamily: "JetBrains Mono, monospace", color, fontWeight: 600 }}>
        {margin}
      </td>
      <td style={{ padding: "16px 20px", fontSize: 13, color: "var(--text-2)" }}>{verdict}</td>
    </tr>
  );
}

function Stack() {
  const products = [
    {
      name: "Arc L1",
      line: "Stablecoin-native gas",
      body: "USDC is the native gas token. Per-request settlement clears sub-cent. Deterministic margin.",
    },
    {
      name: "Circle Wallets",
      line: "Custodial publisher treasury",
      body: "One-click provision, zero key management. USDC lands directly. CCTP-ready for multi-chain off-ramp.",
    },
    {
      name: "Circle Nanopayments",
      line: "Onchain settlement rail",
      body: "Every x402 payment produces a real Base Sepolia (Arc-ready) transaction. Idempotent, retry-safe.",
    },
    {
      name: "Gemini 3 Flash",
      line: "Live quote pricing",
      body: "Function Calling chains tools: agent reputation, site rules, recent activity. Reasoning captured per-quote.",
    },
    {
      name: "x402 Standard",
      line: "Open protocol",
      body: "Linux Foundation + Coinbase standard. HTTP 402 response body, X-PAYMENT header, receipt caching.",
    },
    {
      name: "ERC-8004 Reputation",
      line: "Agent identity layer",
      body: "Onchain reputation scores feed the pricer. Trusted bots pay less; flagged bots pay more.",
    },
  ];
  return (
    <section id="stack" style={{ padding: "80px 28px", maxWidth: 1200, margin: "0 auto" }}>
      <SectionHeader
        kicker="Stack"
        title="Every product in the Circle + Google + x402 lineup"
      />
      <div
        style={{
          marginTop: 40,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 16,
        }}
      >
        {products.map((p) => (
          <div
            key={p.name}
            style={{
              padding: 22,
              border: "1px solid var(--border)",
              borderRadius: 12,
              background: "var(--bg-card)",
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-1)", marginBottom: 4 }}>
              {p.name}
            </div>
            <div
              style={{
                fontSize: 11,
                fontFamily: "JetBrains Mono, monospace",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--pink-bright)",
                marginBottom: 12,
              }}
            >
              {p.line}
            </div>
            <p style={{ fontSize: 13, color: "var(--text-2)", margin: 0, lineHeight: 1.55 }}>{p.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section
      style={{
        padding: "100px 28px",
        maxWidth: 1200,
        margin: "0 auto",
      }}
    >
      <div
        style={{
          padding: "64px 48px",
          border: "1px solid var(--border)",
          borderRadius: 20,
          background:
            "linear-gradient(155deg, rgba(255,60,192,0.08), rgba(39,117,202,0.06) 60%)",
          position: "relative",
          overflow: "hidden",
          textAlign: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -100,
            right: -100,
            width: 320,
            height: 320,
            background: "radial-gradient(circle, rgba(255,60,192,0.18), transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <h2
          style={{
            fontFamily: "Instrument Serif, serif",
            fontSize: "clamp(36px, 5vw, 58px)",
            fontWeight: 400,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            margin: "0 0 18px",
            position: "relative",
          }}
        >
          Stop blocking bots.<br />
          <span style={{ color: "var(--pink-bright)" }}>Start charging them.</span>
        </h2>
        <p
          style={{
            fontSize: 16,
            color: "var(--text-2)",
            maxWidth: 560,
            margin: "0 auto 32px",
            lineHeight: 1.55,
            position: "relative",
          }}
        >
          Install the middleware. Provision a Circle Wallet in one click. Watch your first
          settlement land on basescan within 60 seconds.
        </p>
        <div
          style={{
            display: "inline-flex",
            gap: 12,
            flexWrap: "wrap",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <SignedOut>
            <Link href="/sign-up" style={primaryBtnLarge}>Create free account →</Link>
            <a
              href="https://github.com/brn-mwai/tollgate"
              target="_blank"
              rel="noopener noreferrer"
              style={ghostBtnLarge}
            >
              View on GitHub
            </a>
          </SignedOut>
          <SignedIn>
            <Link href="/app" style={primaryBtnLarge}>Open dashboard →</Link>
          </SignedIn>
        </div>
      </div>
    </section>
  );
}

function SectionHeader({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div>
      <div
        style={{
          fontFamily: "JetBrains Mono, monospace",
          fontSize: 11,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "var(--pink-bright)",
          marginBottom: 14,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <span style={{ width: 22, height: 1, background: "var(--pink-bright)" }} />
        {kicker}
      </div>
      <h2
        style={{
          fontFamily: "Instrument Serif, serif",
          fontSize: "clamp(30px, 4vw, 44px)",
          fontWeight: 400,
          lineHeight: 1.1,
          letterSpacing: "-0.02em",
          margin: 0,
          color: "var(--text-1)",
          maxWidth: 700,
        }}
      >
        {title}
      </h2>
    </div>
  );
}

function Footer() {
  return (
    <footer
      style={{
        padding: "60px 28px 32px",
        borderTop: "1px solid var(--border)",
        background: "var(--bg-card)",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.4fr) repeat(3, minmax(0, 1fr))",
            gap: 40,
            marginBottom: 36,
          }}
        >
          <div>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <svg width="22" height="26" viewBox="0 0 129 155" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.5 21.5L0 38V116.5L15.5 133.5V21.5Z" fill="#FF00AA" />
                <path d="M63.5 21.5L32 38V116.5L63.5 133.5V21.5Z" fill="#FF00AA" />
                <path d="M129 21.5L80 38V116.5L129 133.5V21.5Z" fill="#FF00AA" />
              </svg>
              <span style={{ fontSize: 17, fontWeight: 700, color: "var(--text-1)" }}>Tollgate</span>
            </Link>
            <p style={{ fontSize: 12.5, color: "var(--text-3)", lineHeight: 1.6, margin: 0, maxWidth: 340 }}>
              HTTP 402 payment rail for the agent economy. Built by Brian Mwai for the Agentic Economy on
              Arc hackathon, April 2026.
            </p>
          </div>
          <FooterCol title="Product" links={[
            { label: "Sign up", href: "/sign-up" },
            { label: "Sign in", href: "/sign-in" },
            { label: "Dashboard", href: "/app" },
            { label: "Install SDK", href: "/app/install" },
          ]} />
          <FooterCol title="Live" links={[
            { label: "Realtime stream", href: "/app/realtime" },
            { label: "Demo publisher", href: "https://demo-news.brianmwai.com" },
            { label: "GitHub", href: "https://github.com/brn-mwai/tollgate" },
            { label: "Hackathon", href: "https://lablab.ai/ai-hackathons/nano-payments-arc" },
          ]} />
          <FooterCol title="Stack" links={[
            { label: "Arc docs", href: "https://docs.arc.network" },
            { label: "Circle Wallets", href: "https://developers.circle.com/w3s" },
            { label: "x402 spec", href: "https://github.com/coinbase/x402" },
            { label: "Gemini Function Calling", href: "https://ai.google.dev/gemini-api/docs/function-calling" },
          ]} />
        </div>
        <div
          style={{
            paddingTop: 20,
            borderTop: "1px solid var(--border-s)",
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 11,
            color: "var(--text-3)",
          }}
        >
          <span>© 2026 Brian Mwai · Tollgate is MIT licensed</span>
          <span>tollgate.brianmwai.com</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: Array<{ label: string; href: string }> }) {
  return (
    <div>
      <div
        style={{
          fontSize: 10.5,
          fontFamily: "JetBrains Mono, monospace",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          color: "var(--text-3)",
          marginBottom: 14,
        }}
      >
        {title}
      </div>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
        {links.map((l) => {
          const external = l.href.startsWith("http");
          const Cmp = external ? "a" : Link;
          return (
            <li key={l.href}>
              <Cmp
                href={l.href}
                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                style={{ fontSize: 13, color: "var(--text-1)", textDecoration: "none" }}
              >
                {l.label}
              </Cmp>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ───── styles ─────

const navLink: React.CSSProperties = {
  fontSize: 13,
  color: "var(--text-2)",
  textDecoration: "none",
};

const primaryBtn: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "8px 16px",
  fontSize: 13,
  fontWeight: 600,
  color: "#FFFFFF",
  background: "linear-gradient(155deg, #FF3CC0 0%, #FF00AA 55%, #E60098 100%)",
  border: "1px solid #B3007D",
  borderRadius: 7,
  textDecoration: "none",
  fontFamily: "inherit",
};

const primaryBtnLarge: React.CSSProperties = {
  ...primaryBtn,
  padding: "14px 28px",
  fontSize: 14.5,
};

const ghostBtn: React.CSSProperties = {
  padding: "8px 14px",
  fontSize: 13,
  fontWeight: 500,
  color: "var(--text-1)",
  background: "rgba(255,255,255,0.03)",
  border: "1px solid var(--border)",
  borderRadius: 7,
  textDecoration: "none",
  fontFamily: "inherit",
};

const ghostBtnLarge: React.CSSProperties = {
  ...ghostBtn,
  padding: "14px 24px",
  fontSize: 14.5,
};

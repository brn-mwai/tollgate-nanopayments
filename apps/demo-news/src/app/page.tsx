import Link from "next/link";
import { ARTICLES } from "../lib/articles-data";

export default function Home() {
  const featured = ARTICLES[0]!;
  const rest = ARTICLES.slice(1);

  return (
    <main style={{ maxWidth: 1120, margin: "0 auto", padding: "40px 28px 96px" }}>
      <Navbar />
      <Hero featured={featured} />
      <StatsStrip />
      <HowItWorks />
      <LatestSection rest={rest} />
      <PublishSection />
      <Footer />
    </main>
  );
}

function Navbar() {
  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "6px 0 34px",
        borderBottom: "1px solid var(--border-s)",
        marginBottom: 48,
      }}
    >
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span
          className="serif"
          style={{ fontSize: 22, letterSpacing: "-0.01em", color: "var(--fg)" }}
        >
          The Nanopayer Times
        </span>
      </Link>
      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <span className="pill green">Live on Base Sepolia</span>
        <Link href="#latest" style={{ fontSize: 13, color: "var(--fg-2)" }}>
          Stories
        </Link>
        <Link href="#how" style={{ fontSize: 13, color: "var(--fg-2)" }}>
          How it works
        </Link>
        <Link href="#publish" style={{ fontSize: 13, color: "var(--fg-2)" }}>
          Publishers
        </Link>
        <a
          href="https://github.com/brn-mwai/tollgate"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: 12,
            color: "var(--pink)",
            fontFamily: "JetBrains Mono, monospace",
            padding: "6px 12px",
            border: "1px solid rgba(255,60,192,0.3)",
            borderRadius: 999,
          }}
        >
          github ↗
        </a>
      </div>
    </nav>
  );
}

function Hero({ featured }: { featured: (typeof ARTICLES)[number] }) {
  return (
    <section style={{ marginBottom: 72 }}>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)", gap: 56, alignItems: "center" }}>
        <div>
          <div
            style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 11,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "var(--fg-3)",
              marginBottom: 18,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <span style={{ width: 28, height: 1, background: "var(--pink)" }} />
            Journalism for the agent economy
          </div>
          <h1
            className="serif"
            style={{
              fontSize: "clamp(48px, 7vw, 92px)",
              lineHeight: 1.02,
              margin: "0 0 20px",
              letterSpacing: "-0.025em",
            }}
          >
            Built by humans.<br />
            <span style={{ color: "var(--pink)" }}>Priced</span> for machines.
          </h1>
          <p
            style={{
              color: "var(--fg-2)",
              fontSize: 17,
              maxWidth: 520,
              marginBottom: 32,
              lineHeight: 1.6,
            }}
          >
            Every article on this site has two prices. Humans read for free on{" "}
            <code>/read</code>. Bots, scrapers, and LLM training pipelines pay{" "}
            <strong style={{ color: "var(--fg) " }}>$0.001 in USDC</strong> per API
            call &mdash; settled onchain by Circle, priced live by Google Gemini, cached
            so fifty repeat reads collapse into one transaction.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link
              href={`/read/${featured.slug}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 22px",
                fontSize: 14,
                fontWeight: 600,
                color: "#fff",
                background: "linear-gradient(155deg, #FF3CC0 0%, #E60098 100%)",
                border: "1px solid #B3007D",
                borderRadius: 8,
              }}
            >
              Read the featured story →
            </Link>
            <a
              href="#how"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 22px",
                fontSize: 14,
                fontWeight: 500,
                color: "var(--fg)",
                background: "transparent",
                border: "1px solid var(--border)",
                borderRadius: 8,
              }}
            >
              How the paywall works
            </a>
          </div>
        </div>

        <FeaturedCard article={featured} />
      </div>
    </section>
  );
}

function FeaturedCard({ article }: { article: (typeof ARTICLES)[number] }) {
  return (
    <Link
      href={`/read/${article.slug}`}
      style={{
        display: "block",
        padding: 28,
        border: "1px solid var(--border)",
        borderRadius: 18,
        background: "linear-gradient(160deg, rgba(255,60,192,0.06), rgba(39,117,202,0.04))",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -40,
          right: -40,
          width: 180,
          height: 180,
          background: "radial-gradient(circle, rgba(255,60,192,0.25), transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          fontFamily: "JetBrains Mono, monospace",
          fontSize: 10.5,
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          color: "var(--pink)",
          marginBottom: 14,
          position: "relative",
        }}
      >
        · Featured read ·
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
        {article.tags.map((t) => (
          <span key={t} className="tag">
            {t}
          </span>
        ))}
      </div>
      <h2
        className="serif"
        style={{ fontSize: 30, lineHeight: 1.15, margin: "0 0 12px", color: "var(--fg)" }}
      >
        {article.title}
      </h2>
      <p style={{ color: "var(--fg-2)", fontSize: 14, margin: "0 0 18px", lineHeight: 1.55 }}>
        {article.dek}
      </p>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: 16,
          borderTop: "1px solid var(--border-s)",
          fontFamily: "JetBrains Mono, monospace",
          fontSize: 11.5,
          color: "var(--fg-3)",
        }}
      >
        <span>
          By <strong style={{ color: "var(--fg)" }}>{article.author}</strong> ·{" "}
          {article.published}
        </span>
        <span>{article.readingTimeMin} min read</span>
      </div>
    </Link>
  );
}

function StatsStrip() {
  const stats = [
    { label: "Onchain settlements", value: "180+", sub: "real Base Sepolia txs" },
    { label: "Price per request", value: "$0.001", sub: "1,000 uUSDC · cap $0.01" },
    { label: "Margin on Arc", value: "99.2%", sub: "vs -19,900% on Ethereum" },
    { label: "Articles open to bots", value: String(ARTICLES.length), sub: "all paywalled at 402" },
  ];
  return (
    <section
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: 1,
        background: "var(--border)",
        border: "1px solid var(--border)",
        borderRadius: 14,
        overflow: "hidden",
        marginBottom: 72,
      }}
    >
      {stats.map((s) => (
        <div
          key={s.label}
          style={{ padding: "22px 24px", background: "var(--bg)" }}
        >
          <div
            style={{
              fontSize: 10.5,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--fg-3)",
              fontFamily: "JetBrains Mono, monospace",
              marginBottom: 10,
            }}
          >
            {s.label}
          </div>
          <div
            className="serif"
            style={{ fontSize: 38, lineHeight: 1, color: "var(--fg)", marginBottom: 6 }}
          >
            {s.value}
          </div>
          <div style={{ fontSize: 11.5, color: "var(--fg-3)" }}>{s.sub}</div>
        </div>
      ))}
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "Bot sends GET",
      body: "A crawler, LLM trainer, or research agent fetches /api/articles/arc-primer. No API key. No login. Just HTTP.",
    },
    {
      num: "02",
      title: "Server returns 402",
      body: "The middleware responds with payment required — a signed quote carrying a nonce, price, and publisher wallet address. All per x402 spec.",
    },
    {
      num: "03",
      title: "Agent pays USDC",
      body: "The bot authorizes a Circle Transfer for the quoted amount. Settlement lands on Base Sepolia in seconds. The server verifies the tx hash.",
    },
    {
      num: "04",
      title: "Content served",
      body: "A 5-minute HMAC receipt is attached. Subsequent reads from this agent skip the facilitator entirely — one onchain tx covers 50 cached hits.",
    },
  ];
  return (
    <section id="how" style={{ marginBottom: 80 }}>
      <SectionLabel>How it works</SectionLabel>
      <h2
        className="serif"
        style={{ fontSize: 42, lineHeight: 1.1, margin: "0 0 40px", maxWidth: 680 }}
      >
        Four steps between a bot's request and a publisher's payment.
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 18 }}>
        {steps.map((s) => (
          <div
            key={s.num}
            style={{
              padding: 22,
              border: "1px solid var(--border)",
              borderRadius: 12,
              background: "rgba(255,255,255,0.015)",
            }}
          >
            <div
              className="serif"
              style={{ fontSize: 32, color: "var(--pink)", marginBottom: 10 }}
            >
              {s.num}
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--fg)", marginBottom: 8 }}>
              {s.title}
            </div>
            <p style={{ fontSize: 13, color: "var(--fg-2)", lineHeight: 1.55, margin: 0 }}>
              {s.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function LatestSection({ rest }: { rest: typeof ARTICLES }) {
  return (
    <section id="latest" style={{ marginBottom: 80 }}>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          marginBottom: 28,
          paddingBottom: 18,
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div>
          <SectionLabel>Latest stories</SectionLabel>
          <h2 className="serif" style={{ fontSize: 36, margin: "6px 0 0" }}>
            Dispatches from the machine internet
          </h2>
        </div>
        <span
          style={{
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 12,
            color: "var(--fg-3)",
          }}
        >
          {rest.length} more
        </span>
      </div>
      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 1,
          background: "var(--border-s)",
          border: "1px solid var(--border-s)",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        {rest.map((a) => (
          <li key={a.slug} style={{ background: "var(--bg)" }}>
            <Link
              href={`/read/${a.slug}`}
              style={{
                display: "block",
                padding: "22px 24px",
                height: "100%",
              }}
            >
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                {a.tags.slice(0, 2).map((t) => (
                  <span key={t} className="tag">
                    {t}
                  </span>
                ))}
              </div>
              <div
                className="serif"
                style={{ fontSize: 22, lineHeight: 1.2, color: "var(--fg)", marginBottom: 10 }}
              >
                {a.title}
              </div>
              <p
                style={{
                  color: "var(--fg-2)",
                  fontSize: 13,
                  margin: "0 0 14px",
                  lineHeight: 1.5,
                }}
              >
                {a.dek}
              </p>
              <div
                style={{
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: 11,
                  color: "var(--fg-3)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingTop: 12,
                  borderTop: "1px solid var(--border-s)",
                }}
              >
                <span>
                  {a.author} · {a.readingTimeMin} min
                </span>
                <span style={{ color: "var(--pink)" }}>$0.001</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function PublishSection() {
  return (
    <section
      id="publish"
      style={{
        marginBottom: 64,
        padding: "44px 40px",
        border: "1px solid var(--border)",
        borderRadius: 18,
        background:
          "linear-gradient(160deg, rgba(39,117,202,0.08), rgba(255,60,192,0.04) 60%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -80,
          left: -80,
          width: 300,
          height: 300,
          background:
            "radial-gradient(circle, rgba(6,167,125,0.12), transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div style={{ position: "relative" }}>
        <SectionLabel tone="green">For publishers</SectionLabel>
        <h2
          className="serif"
          style={{
            fontSize: 40,
            lineHeight: 1.1,
            margin: "8px 0 18px",
            maxWidth: 680,
          }}
        >
          Stop blocking bots. Start charging them.
        </h2>
        <p
          style={{
            color: "var(--fg-2)",
            fontSize: 15,
            maxWidth: 640,
            marginBottom: 24,
            lineHeight: 1.6,
          }}
        >
          Tollgate is an HTTP 402 middleware + publisher dashboard built on Circle
          infrastructure. Install the SDK, provision a Circle Wallet, and every
          scraped URL becomes revenue &mdash; not extraction. No account management, no
          card-on-file, no OAuth dance. The agent economy finally pays.
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <a
            href="https://tollgate.brianmwai.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 22px",
              fontSize: 14,
              fontWeight: 600,
              color: "#fff",
              background: "linear-gradient(155deg, #FF3CC0 0%, #E60098 100%)",
              border: "1px solid #B3007D",
              borderRadius: 8,
            }}
          >
            Open the dashboard →
          </a>
          <a
            href="https://github.com/brn-mwai/tollgate"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 22px",
              fontSize: 14,
              fontWeight: 500,
              color: "var(--fg)",
              background: "transparent",
              border: "1px solid var(--border)",
              borderRadius: 8,
            }}
          >
            View source
          </a>
        </div>

        <div
          style={{
            marginTop: 36,
            paddingTop: 28,
            borderTop: "1px solid var(--border-s)",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 28,
          }}
        >
          <MiniStat label="Install time" value="Under 5 min" />
          <MiniStat label="Settlement" value="Onchain USDC" />
          <MiniStat label="Agent side" value="No API keys needed" />
          <MiniStat label="Wallet custody" value="Circle Wallets" />
        </div>
      </div>
    </section>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div
        style={{
          fontSize: 10.5,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "var(--fg-3)",
          fontFamily: "JetBrains Mono, monospace",
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      <div className="serif" style={{ fontSize: 22, color: "var(--fg)" }}>
        {value}
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer
      style={{
        marginTop: 72,
        paddingTop: 32,
        borderTop: "1px solid var(--border)",
        display: "grid",
        gridTemplateColumns: "minmax(0, 1.4fr) repeat(3, minmax(0, 1fr))",
        gap: 36,
        alignItems: "flex-start",
      }}
    >
      <div>
        <div
          className="serif"
          style={{ fontSize: 22, letterSpacing: "-0.01em", marginBottom: 10 }}
        >
          The Nanopayer Times
        </div>
        <p
          style={{
            color: "var(--fg-3)",
            fontSize: 12.5,
            lineHeight: 1.6,
            margin: 0,
            maxWidth: 360,
          }}
        >
          A demo publisher for Tollgate, built for the Agentic Economy on Arc
          hackathon. Every transaction here is real; every wallet, real; every
          tx hash, verifiable on basescan.
        </p>
      </div>
      <FooterCol
        title="Rail"
        links={[
          { label: "Tollgate dashboard", href: "https://tollgate.brianmwai.com" },
          { label: "GitHub repo", href: "https://github.com/brn-mwai/tollgate" },
          { label: "Hackathon", href: "https://lablab.ai/ai-hackathons/nano-payments-arc" },
        ]}
      />
      <FooterCol
        title="Circle"
        links={[
          { label: "Arc", href: "https://docs.arc.network" },
          { label: "Circle Wallets", href: "https://developers.circle.com/w3s" },
          { label: "Nanopayments", href: "https://developers.circle.com" },
        ]}
      />
      <FooterCol
        title="Bot integration"
        links={[
          { label: "x402 spec", href: "https://github.com/coinbase/x402" },
          { label: "Gemini Function Calling", href: "https://ai.google.dev/gemini-api/docs/function-calling" },
          { label: "ERC-8004", href: "https://eips.ethereum.org/EIPS/eip-8004" },
        ]}
      />
      <div
        style={{
          gridColumn: "1 / -1",
          paddingTop: 20,
          marginTop: 10,
          borderTop: "1px solid var(--border-s)",
          fontSize: 11,
          color: "var(--fg-3)",
          fontFamily: "JetBrains Mono, monospace",
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <span>© 2026 The Nanopayer Times · Built by Brian Mwai</span>
        <span>
          MIT licensed · demo-news.brianmwai.com
        </span>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: Array<{ label: string; href: string }>;
}) {
  return (
    <div>
      <div
        style={{
          fontSize: 10.5,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          color: "var(--fg-3)",
          fontFamily: "JetBrains Mono, monospace",
          marginBottom: 14,
        }}
      >
        {title}
      </div>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
        {links.map((l) => (
          <li key={l.href}>
            <a
              href={l.href}
              target={l.href.startsWith("http") ? "_blank" : undefined}
              rel="noopener noreferrer"
              style={{ fontSize: 13, color: "var(--fg)" }}
            >
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SectionLabel({
  children,
  tone = "pink",
}: {
  children: React.ReactNode;
  tone?: "pink" | "green";
}) {
  const color = tone === "green" ? "var(--green)" : "var(--pink)";
  return (
    <div
      style={{
        fontFamily: "JetBrains Mono, monospace",
        fontSize: 11,
        letterSpacing: "0.15em",
        textTransform: "uppercase",
        color,
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      <span style={{ width: 20, height: 1, background: color }} />
      {children}
    </div>
  );
}

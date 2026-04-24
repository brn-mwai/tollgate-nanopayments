import Link from "next/link";
import { ARTICLES } from "../lib/articles-data";

export default function Home() {
  return (
    <main style={{ maxWidth: 880, margin: "0 auto", padding: "56px 28px 120px" }}>
      <Masthead />
      <Intro />
      <Stories />
      <BotFooter />
    </main>
  );
}

function Masthead() {
  return (
    <header
      style={{
        textAlign: "center",
        paddingBottom: 30,
        marginBottom: 40,
        borderBottom: "2px solid var(--fg)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontFamily: "JetBrains Mono, monospace",
          fontSize: 10.5,
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          color: "var(--fg-3)",
          marginBottom: 26,
        }}
      >
        <span>Vol. 1 · No. 10</span>
        <span>Friday · April 24, 2026</span>
        <span className="pill green">Paywalled to bots · free to you</span>
      </div>
      <h1
        className="serif"
        style={{
          fontSize: "clamp(54px, 9vw, 110px)",
          lineHeight: 1,
          margin: 0,
          letterSpacing: "-0.03em",
        }}
      >
        The Nanopayer Times
      </h1>
      <div
        style={{
          marginTop: 16,
          fontFamily: "JetBrains Mono, monospace",
          fontSize: 11.5,
          color: "var(--fg-3)",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        "All the news that's fit to be billed per request"
      </div>
    </header>
  );
}

function Intro() {
  return (
    <section
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1.6fr) minmax(0, 1fr)",
        gap: 40,
        paddingBottom: 40,
        marginBottom: 48,
        borderBottom: "1px solid var(--border)",
      }}
    >
      <p
        className="serif"
        style={{
          fontSize: 19,
          lineHeight: 1.55,
          color: "var(--fg)",
          margin: 0,
          fontStyle: "italic",
        }}
      >
        A demonstration publication for the age of autonomous agents. Every article below
        is available two ways &mdash; free for human readers on this page, and paywalled to
        machines at one tenth of one cent per API call. The rail clears in seconds,
        settles onchain in USDC, and caches receipts so fifty repeat reads collapse into
        a single transaction.
      </p>
      <aside
        style={{
          fontSize: 12.5,
          color: "var(--fg-2)",
          lineHeight: 1.6,
          padding: 18,
          border: "1px solid var(--border-s)",
          borderRadius: 8,
          background: "rgba(255,255,255,0.01)",
        }}
      >
        <div
          style={{
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 10.5,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "var(--pink)",
            marginBottom: 10,
          }}
        >
          For engineers
        </div>
        <p style={{ margin: 0 }}>
          Fetch any article programmatically &mdash; you&rsquo;ll receive an HTTP 402 with
          a signed USDC quote. Sign, retry with{" "}
          <code style={{ fontSize: 11 }}>X-PAYMENT</code>, and the article body arrives
          with a 5-minute HMAC receipt for cache-fast repeat reads.
        </p>
        <pre
          style={{
            marginTop: 10,
            fontSize: 11,
            padding: "10px 12px",
            background: "rgba(0,0,0,0.3)",
            border: "1px solid var(--border-s)",
          }}
        >
          curl -i demo-news.brianmwai.com/api/articles/arc-primer
        </pre>
        <a
          href="https://tollgate.brianmwai.com"
          style={{ color: "var(--pink)", fontSize: 12 }}
        >
          Powered by Tollgate →
        </a>
      </aside>
    </section>
  );
}

function Stories() {
  const [featured, ...rest] = ARTICLES;
  return (
    <section style={{ marginBottom: 64 }}>
      <Link
        href={`/read/${featured!.slug}`}
        style={{
          display: "block",
          paddingBottom: 40,
          marginBottom: 40,
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div
          style={{
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 10.5,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            color: "var(--pink)",
            marginBottom: 12,
          }}
        >
          · Lead story ·
        </div>
        <h2
          className="serif"
          style={{
            fontSize: "clamp(32px, 5vw, 52px)",
            lineHeight: 1.08,
            margin: "0 0 18px",
            letterSpacing: "-0.02em",
          }}
        >
          {featured!.title}
        </h2>
        <p
          className="serif"
          style={{
            fontSize: 20,
            lineHeight: 1.45,
            color: "var(--fg-2)",
            fontStyle: "italic",
            margin: "0 0 20px",
            maxWidth: 720,
          }}
        >
          {featured!.dek}
        </p>
        <div
          style={{
            display: "flex",
            gap: 16,
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 11.5,
            color: "var(--fg-3)",
            flexWrap: "wrap",
          }}
        >
          <span>
            By <strong style={{ color: "var(--fg)" }}>{featured!.author}</strong>
          </span>
          <span>{featured!.published}</span>
          <span>{featured!.readingTimeMin} min read</span>
          <span style={{ color: "var(--pink)" }}>$0.001 / bot read</span>
        </div>
      </Link>

      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 28,
        }}
      >
        {rest.map((a, i) => (
          <li
            key={a.slug}
            style={{
              paddingTop: i >= 3 ? 26 : 0,
              borderTop: i >= 3 ? "1px solid var(--border-s)" : undefined,
            }}
          >
            <Link href={`/read/${a.slug}`} style={{ display: "block" }}>
              <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
                {a.tags.slice(0, 2).map((t) => (
                  <span key={t} className="tag">
                    {t}
                  </span>
                ))}
              </div>
              <h3
                className="serif"
                style={{
                  fontSize: 22,
                  lineHeight: 1.2,
                  margin: "0 0 10px",
                  color: "var(--fg)",
                }}
              >
                {a.title}
              </h3>
              <p style={{ color: "var(--fg-2)", fontSize: 13, margin: "0 0 12px", lineHeight: 1.5 }}>
                {a.dek}
              </p>
              <div
                style={{
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: 11,
                  color: "var(--fg-3)",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>{a.author}</span>
                <span>{a.readingTimeMin} min · $0.001</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function BotFooter() {
  return (
    <footer
      style={{
        paddingTop: 32,
        borderTop: "2px solid var(--fg)",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontFamily: "JetBrains Mono, monospace",
          fontSize: 11,
          color: "var(--fg-3)",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          marginBottom: 8,
        }}
      >
        Demo publisher · all content fictional except the tx hashes
      </div>
      <div
        style={{
          fontSize: 12,
          color: "var(--fg-3)",
          display: "flex",
          gap: 16,
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <a href="https://tollgate.brianmwai.com" style={{ color: "var(--pink)" }}>
          tollgate.brianmwai.com
        </a>
        <span>·</span>
        <a href="https://github.com/brn-mwai/tollgate" style={{ color: "var(--fg-2)" }}>
          github.com/brn-mwai/tollgate
        </a>
        <span>·</span>
        <a
          href="https://lablab.ai/ai-hackathons/nano-payments-arc"
          style={{ color: "var(--fg-2)" }}
        >
          agentic economy on arc
        </a>
      </div>
    </footer>
  );
}

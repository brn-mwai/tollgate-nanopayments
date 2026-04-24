import Link from "next/link";
import { ARTICLES } from "../lib/articles-data";

export default function Home() {
  return (
    <main style={{ maxWidth: 820, margin: "0 auto", padding: "48px 24px 96px" }}>
      <header style={{ borderBottom: "1px solid var(--border)", paddingBottom: 22, marginBottom: 32 }}>
        <h1 className="serif" style={{ fontSize: 52, margin: 0, letterSpacing: "-0.02em" }}>
          The Nanopayer Times
        </h1>
        <div
          style={{
            color: "var(--fg-3)",
            fontSize: 13,
            marginTop: 8,
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <span>AI-era journalism · priced per read</span>
          <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--fg-3)" }} />
          <span className="pill green">Live on Base Sepolia</span>
          <span className="pill">Powered by Tollgate</span>
        </div>
      </header>

      <p style={{ color: "var(--fg-2)", fontSize: 15, marginBottom: 40, maxWidth: 560 }}>
        Every article below is HTTP 402-gated. Humans read for free on the{" "}
        <code>/read</code> URLs. Bots, LLM trainers, and research agents pay{" "}
        <strong>$0.001</strong> per API call in USDC, settled onchain by Circle, priced live by
        Google Gemini, and cached for 5 minutes so 50 repeat reads collapse into 1 transaction.
        This page is the first publisher to run on the rail.
      </p>

      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {ARTICLES.map((a) => (
          <li
            key={a.slug}
            style={{
              padding: "22px 0",
              borderBottom: "1px solid var(--border-s)",
              display: "flex",
              gap: 24,
              alignItems: "flex-start",
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
                {a.tags.map((t) => (
                  <span key={t} className="tag">
                    {t}
                  </span>
                ))}
              </div>
              <Link
                href={`/read/${a.slug}`}
                className="serif"
                style={{
                  fontSize: 26,
                  lineHeight: 1.2,
                  display: "block",
                  marginBottom: 8,
                  color: "var(--fg)",
                }}
              >
                {a.title}
              </Link>
              <p style={{ color: "var(--fg-2)", fontSize: 14, margin: "0 0 10px", lineHeight: 1.55 }}>
                {a.dek}
              </p>
              <div style={{ color: "var(--fg-3)", fontSize: 12, fontFamily: "JetBrains Mono, monospace" }}>
                By <strong>{a.author}</strong> · {a.published} · {a.readingTimeMin} min read
              </div>
            </div>
            <div style={{ textAlign: "right", minWidth: 100 }}>
              <span className="serif" style={{ display: "block", fontSize: 24, color: "var(--pink)" }}>
                $0.001
              </span>
              <span
                className="mono"
                style={{
                  display: "block",
                  fontSize: 10.5,
                  color: "var(--fg-3)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                per bot read
              </span>
            </div>
          </li>
        ))}
      </ul>

      <div
        style={{
          marginTop: 56,
          paddingTop: 24,
          borderTop: "1px solid var(--border)",
          fontSize: 12,
          color: "var(--fg-3)",
          lineHeight: 1.7,
        }}
      >
        <p>
          <strong>For engineers</strong> &mdash; fetch any article programmatically:
        </p>
        <pre>curl -i /api/articles/arc-primer</pre>
        <p>
          You will get a 402 with a quote (nonce, price, payTo). Sign the payment payload and
          retry with the <code>X-PAYMENT</code> header. The response includes{" "}
          <code>X-Tollgate-Receipt-Set</code> &mdash; present that on subsequent reads within 5
          minutes to skip onchain settlement entirely.
        </p>
        <p style={{ marginTop: 20 }}>
          Want to gate your own site?{" "}
          <a href="https://github.com/brn-mwai/tollgate" style={{ color: "var(--pink)" }}>
            brn-mwai/tollgate
          </a>{" "}
          on GitHub. Built for the{" "}
          <a
            href="https://lablab.ai/ai-hackathons/nano-payments-arc"
            style={{ color: "var(--pink)" }}
          >
            Agentic Economy on Arc
          </a>{" "}
          hackathon.
        </p>
      </div>
    </main>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { ARTICLES } from "../../../lib/articles-data";

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

type PageProps = { params: Promise<{ slug: string }> };

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = ARTICLES.find((a) => a.slug === slug);
  if (!article) return notFound();
  const paragraphs = article.body.split("\n\n");

  return (
    <main style={{ maxWidth: 680, margin: "0 auto", padding: "48px 24px 96px", lineHeight: 1.75 }}>
      <Link
        href="/"
        className="mono"
        style={{ color: "var(--fg-3)", fontSize: 12, marginBottom: 28, display: "inline-block" }}
      >
        ← The Nanopayer Times
      </Link>

      <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
        {article.tags.map((t) => (
          <span key={t} className="tag">
            {t}
          </span>
        ))}
      </div>

      <h1 className="serif" style={{ fontSize: 48, margin: "0 0 16px", lineHeight: 1.15 }}>
        {article.title}
      </h1>

      <p
        className="serif"
        style={{
          color: "var(--fg-2)",
          fontSize: 19,
          fontStyle: "italic",
          margin: "0 0 28px",
          lineHeight: 1.45,
        }}
      >
        {article.dek}
      </p>

      <div
        className="mono"
        style={{
          color: "var(--fg-3)",
          fontSize: 13,
          paddingBottom: 28,
          borderBottom: "1px solid var(--border)",
          marginBottom: 32,
        }}
      >
        By <strong>{article.author}</strong> · {article.published} · {article.readingTimeMin} min read
      </div>

      {paragraphs.map((p, i) => (
        <p key={i} style={{ color: "var(--fg)", fontSize: 16, margin: "0 0 22px" }}>
          {p}
        </p>
      ))}

      <aside
        style={{
          marginTop: 56,
          padding: "24px 26px",
          border: "1px solid rgba(255,60,192,0.3)",
          background: "rgba(255,60,192,0.05)",
          borderRadius: 10,
          fontSize: 13.5,
          color: "var(--fg-2)",
          lineHeight: 1.6,
        }}
      >
        <strong style={{ color: "var(--pink)" }}>For bots:</strong> the JSON version of this article
        is paywalled at $0.001 per read via HTTP 402 &amp; Circle Nanopayments on Base Sepolia. Humans
        read free on this URL. Try: <code>curl -i /api/articles/{article.slug}</code>
      </aside>
    </main>
  );
}

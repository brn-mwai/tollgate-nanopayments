import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { LiveTicker } from "./_landing/live-ticker";

export const dynamic = "force-dynamic";

export default function Landing() {
  return (
    <>
      <style>{styles}</style>
      <main className="lp-root">
        <TopNav />
        <Hero />
        <section className="lp-section lp-section-tight">
          <LiveTicker />
        </section>
        <ValueProp />
        <HowItWorks />
        <WhyArc />
        <Stack />
        <Testimonial />
        <FinalCTA />
        <SiteFooter />
      </main>
    </>
  );
}

function TopNav() {
  return (
    <nav className="lp-nav">
      <div className="lp-nav-inner">
        <Link href="/" className="lp-brand">
          <svg width="22" height="26" viewBox="0 0 129 155" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M15.5 21.5L0 38V116.5L15.5 133.5V21.5Z" fill="#FF00AA" />
            <path d="M63.5 21.5L32 38V116.5L63.5 133.5V21.5Z" fill="#FF00AA" />
            <path d="M129 21.5L80 38V116.5L129 133.5V21.5Z" fill="#FF00AA" />
          </svg>
          <span>Tollgate</span>
        </Link>
        <div className="lp-nav-links">
          <Link href="#how">How it works</Link>
          <Link href="#economics">Economics</Link>
          <Link href="#stack">Stack</Link>
          <a href="https://demo-news.brianmwai.com" target="_blank" rel="noopener noreferrer">
            Live demo
          </a>
          <a href="https://github.com/brn-mwai/tollgate" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
        </div>
        <div className="lp-nav-cta">
          <SignedOut>
            <Link href="/sign-in" className="lp-btn lp-btn-ghost lp-btn-sm">Sign in</Link>
            <Link href="/sign-up" className="lp-btn lp-btn-primary lp-btn-sm">Start free</Link>
          </SignedOut>
          <SignedIn>
            <Link href="/app" className="lp-btn lp-btn-primary lp-btn-sm">Open dashboard</Link>
          </SignedIn>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="lp-hero">
      <div className="lp-hero-bg" aria-hidden />
      <div className="lp-hero-inner">
        <div className="lp-badge">
          <span className="lp-badge-dot" aria-hidden />
          <span>180+ real onchain settlements · Base Sepolia · April 2026</span>
        </div>

        <h1 className="lp-hero-title">
          <span className="lp-hero-line">Charge AI bots</span>
          <span className="lp-hero-line">
            <em>per request</em> in USDC.
          </span>
        </h1>

        <p className="lp-hero-sub">
          A dashboard and middleware library for publishers. Install the package, connect
          a Circle Wallet, and every protected URL starts billing bots in USDC via the
          open x402 standard. Priced live by Gemini. Settled onchain on Arc.
        </p>

        <div className="lp-hero-cta">
          <SignedOut>
            <Link href="/sign-up" className="lp-btn lp-btn-primary lp-btn-lg">
              <span>Start charging bots</span>
              <Arrow />
            </Link>
          </SignedOut>
          <SignedIn>
            <Link href="/app" className="lp-btn lp-btn-primary lp-btn-lg">
              <span>Open dashboard</span>
              <Arrow />
            </Link>
          </SignedIn>
          <a
            href="https://demo-news.brianmwai.com"
            target="_blank"
            rel="noopener noreferrer"
            className="lp-btn lp-btn-ghost lp-btn-lg"
          >
            <span>See a live publisher</span>
          </a>
        </div>

        <div className="lp-hero-tech">
          <span>x402</span>
          <span className="lp-hero-tech-sep" aria-hidden />
          <span>Circle Wallets</span>
          <span className="lp-hero-tech-sep" aria-hidden />
          <span>Arc</span>
          <span className="lp-hero-tech-sep" aria-hidden />
          <span>Gemini Function Calling</span>
          <span className="lp-hero-tech-sep" aria-hidden />
          <span>Convex</span>
        </div>
      </div>
    </section>
  );
}

function ValueProp() {
  const bullets = [
    {
      title: "Sue or license — both broken",
      body: "The NYT has been in court with OpenAI since December 2023. News Corp got $250M over five years. For the 99% of publishers who can't afford either, there is no option today.",
    },
    {
      title: "The standard already exists",
      body: "HTTP 402 has been reserved since 1999. Coinbase + the Linux Foundation shipped x402 in 2024. Circle shipped Arc with USDC-native gas. The rail is built. The publisher-facing product wasn't.",
    },
    {
      title: "Tollgate is the publisher product",
      body: "Middleware for Express, Hono, and Next.js. Dashboard with Circle Wallet provisioning, dynamic Gemini-priced quotes, receipt caching, audit trail, multi-chain off-ramp. MIT licensed. Running today.",
    },
  ];
  return (
    <section className="lp-section">
      <SectionKicker>The problem</SectionKicker>
      <h2 className="lp-section-title">
        AI scraping,<br />
        no payment recourse.
      </h2>
      <p className="lp-section-lede">
        AI labs extract billions of dollars of content annually. Publishers have two
        options today: sue (years in court), or license (reserved for the top 0.01%).
        Every lawsuit from{" "}
        <a href="https://github.com/brn-mwai/tollgate/blob/main/docs/PROBLEM.md" target="_blank" rel="noopener noreferrer">NYT vs OpenAI</a>{" "}
        to Thomson Reuters vs Ross to Reddit vs Anthropic proves the model is broken.
      </p>
      <div className="lp-grid-3">
        {bullets.map((b) => (
          <div key={b.title} className="lp-value-card">
            <div className="lp-value-title">{b.title}</div>
            <p className="lp-value-body">{b.body}</p>
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
      title: "Bot sends GET",
      body: "A crawler fetches any protected URL. No API key, no OAuth, no prior signup — agents are first-class citizens.",
      code: "GET /api/articles/arc-primer",
    },
    {
      num: "02",
      title: "Server returns 402",
      body: "Middleware emits a signed x402 quote: price, nonce, publisher wallet. Gemini prices the quote dynamically.",
      code: 'HTTP/1.1 402 Payment Required\n{"accepts":[{"amount":"1000","payTo":"0x7f3f..."}]}',
    },
    {
      num: "03",
      title: "Agent pays USDC",
      body: "The bot authorizes a transfer. Circle Wallets settles onchain on Base Sepolia. Confirmation in seconds.",
      code: "POST /api/articles/arc-primer\nX-PAYMENT: eyJ4NDAyVmVyc2lvbi...",
    },
    {
      num: "04",
      title: "Content + receipt",
      body: "200 OK with the article JSON plus an HMAC receipt. Next 50 reads from this agent skip onchain settlement entirely.",
      code: "HTTP/1.1 200 OK\nX-Tollgate-Receipt-Set: v1.eyJzaXRlIj...",
    },
  ];
  return (
    <section id="how" className="lp-section-dark">
      <div className="lp-section-inner">
        <SectionKicker>How it works</SectionKicker>
        <h2 className="lp-section-title">
          Four HTTP exchanges,<br />
          one economic atom.
        </h2>
        <div className="lp-steps">
          {steps.map((s) => (
            <div key={s.num} className="lp-step">
              <div className="lp-step-num">{s.num}</div>
              <div className="lp-step-body">
                <div className="lp-step-title">{s.title}</div>
                <p className="lp-step-copy">{s.body}</p>
                <pre className="lp-step-code">{s.code}</pre>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhyArc() {
  return (
    <section id="economics" className="lp-section">
      <SectionKicker>Economics</SectionKicker>
      <h2 className="lp-section-title">
        Only Arc makes<br />
        the spreadsheet green.
      </h2>
      <p className="lp-section-lede">
        A single $0.001 API call, settled onchain, across four chains. Arc is the only L1
        where per-request pricing is mathematically profitable &mdash; by a factor of 125 over
        Base, 500 over Polygon, and 25,000 over Ethereum.
      </p>
      <div className="lp-econ">
        <table className="lp-econ-table">
          <colgroup>
            <col />
            <col />
            <col />
            <col />
          </colgroup>
          <thead>
            <tr>
              <th>Chain</th>
              <th>Gas / tx</th>
              <th>Net / request</th>
              <th>Margin</th>
            </tr>
          </thead>
          <tbody>
            <tr className="good">
              <td><strong>Arc (USDC native)</strong></td>
              <td>$0.00002</td>
              <td>+$0.00098</td>
              <td>99.2%</td>
            </tr>
            <tr>
              <td>Solana</td>
              <td>$0.00025</td>
              <td>+$0.00075</td>
              <td>75%</td>
            </tr>
            <tr className="warn">
              <td>Base</td>
              <td>$0.0002</td>
              <td>+$0.0008</td>
              <td>80%</td>
            </tr>
            <tr className="bad">
              <td>Polygon PoS</td>
              <td>$0.0016</td>
              <td>−$0.0006</td>
              <td>−60%</td>
            </tr>
            <tr className="bad">
              <td>Ethereum L1</td>
              <td>$0.50</td>
              <td>−$0.499</td>
              <td>−49,900%</td>
            </tr>
          </tbody>
        </table>
        <p className="lp-footnote">
          Base estimates per-request gas at 20 gwei × 65k gas units, USDC-denominated.
          Full derivation in{" "}
          <a
            href="https://github.com/brn-mwai/tollgate/blob/main/docs/MARGIN.md"
            target="_blank"
            rel="noopener noreferrer"
          >
            docs/MARGIN.md
          </a>.
        </p>
      </div>
    </section>
  );
}

function Stack() {
  const products = [
    { name: "x402 (Coinbase + Linux Foundation)", line: "Open standard · we conform", body: "HTTP 402 response body, X-PAYMENT header, EIP-3009 signing scheme. Facilitators at x402.org + Coinbase CDP." },
    { name: "Arc L1 (Circle)", line: "Settlement · USDC-native gas", body: "The only L1 where per-request pricing is mathematically profitable. Sub-cent per-action clearing." },
    { name: "Circle Wallets", line: "Publisher treasury", body: "Developer-controlled custodial wallets provisioned from the Tollgate dashboard in one click." },
    { name: "Circle Nanopayments", line: "Transfer API", body: "Every settled x402 quote fires a real Circle Transfer onchain. Idempotent, retry-safe, basescan-verifiable." },
    { name: "Circle CCTP", line: "Multi-chain off-ramp", body: "Publishers withdraw to Base, Ethereum, or Solana using Circle's existing infrastructure." },
    { name: "Gemini 3 Flash", line: "Per-quote pricing · Function Calling", body: "Three callable tools: agent reputation, site rules, recent activity. Reasoning trace persisted per quote." },
    { name: "ERC-8004 (draft)", line: "Agent reputation", body: "Onchain reputation scores. Trusted agents get discounts, flagged ones pay premiums." },
    { name: "Convex", line: "Reactive backend", body: "13 tables, 60+ functions. Live dashboard queries without manual WebSocket plumbing." },
  ];
  return (
    <section id="stack" className="lp-section">
      <SectionKicker>Stack</SectionKicker>
      <h2 className="lp-section-title">
        Built on what Circle,<br />
        Coinbase &amp; Google shipped.
      </h2>
      <p className="lp-section-lede">
        We did not invent the rail. The x402 standard, Circle's settlement stack, and
        Gemini's Function Calling were already there. Tollgate is the publisher layer on
        top: middleware, dashboard, receipt caching, reputation routing.
      </p>
      <div className="lp-stack-grid">
        {products.map((p) => (
          <div key={p.name} className="lp-stack-card">
            <div className="lp-stack-name">{p.name}</div>
            <div className="lp-stack-line">{p.line}</div>
            <p className="lp-stack-body">{p.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Testimonial() {
  return (
    <section className="lp-section-dark">
      <div className="lp-section-inner">
        <div className="lp-quote">
          <blockquote>
            We didn&rsquo;t build the rail.<br />
            We built the building at the end of it.
          </blockquote>
          <cite>
            Tollgate thesis<br />
            <small>
              x402 is the standard. Circle is the settlement layer. Tollgate is the
              publisher product that makes them usable on day one.
            </small>
          </cite>
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="lp-section">
      <div className="lp-cta">
        <h2 className="lp-cta-title">
          Stop blocking bots.<br />
          Start charging them.
        </h2>
        <p className="lp-cta-sub">
          Install the middleware, provision a Circle Wallet, watch your first settlement land
          on basescan within 60 seconds. MIT licensed. No waitlist.
        </p>
        <div className="lp-cta-actions">
          <SignedOut>
            <Link href="/sign-up" className="lp-btn lp-btn-primary lp-btn-lg">
              Create free account <Arrow />
            </Link>
          </SignedOut>
          <SignedIn>
            <Link href="/app" className="lp-btn lp-btn-primary lp-btn-lg">
              Open dashboard <Arrow />
            </Link>
          </SignedIn>
          <a
            href="https://github.com/brn-mwai/tollgate"
            target="_blank"
            rel="noopener noreferrer"
            className="lp-btn lp-btn-ghost lp-btn-lg"
          >
            View source
          </a>
        </div>
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="lp-footer">
      <div className="lp-footer-inner">
        <div className="lp-footer-brand">
          <Link href="/" className="lp-brand">
            <svg width="20" height="24" viewBox="0 0 129 155" xmlns="http://www.w3.org/2000/svg">
              <path d="M15.5 21.5L0 38V116.5L15.5 133.5V21.5Z" fill="#FF00AA" />
              <path d="M63.5 21.5L32 38V116.5L63.5 133.5V21.5Z" fill="#FF00AA" />
              <path d="M129 21.5L80 38V116.5L129 133.5V21.5Z" fill="#FF00AA" />
            </svg>
            <span>Tollgate</span>
          </Link>
          <p>
            HTTP 402 payment rail for the agent economy. Built by Brian Mwai for the Agentic
            Economy on Arc hackathon.
          </p>
        </div>
        <FooterCol title="Product" links={[
          { label: "Sign up", href: "/sign-up" },
          { label: "Dashboard", href: "/app" },
          { label: "Install SDK", href: "/app/install" },
        ]} />
        <FooterCol title="Live" links={[
          { label: "Realtime stream", href: "/app/realtime" },
          { label: "Demo publisher", href: "https://demo-news.brianmwai.com" },
          { label: "GitHub", href: "https://github.com/brn-mwai/tollgate" },
        ]} />
        <FooterCol title="Stack" links={[
          { label: "Arc", href: "https://docs.arc.network" },
          { label: "Circle Wallets", href: "https://developers.circle.com/w3s" },
          { label: "x402", href: "https://github.com/coinbase/x402" },
          { label: "Gemini", href: "https://ai.google.dev" },
        ]} />
      </div>
      <div className="lp-footer-bar">
        <span>© 2026 Brian Mwai · MIT licensed</span>
        <span>tollgate.brianmwai.com</span>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: Array<{ label: string; href: string }> }) {
  return (
    <div className="lp-footer-col">
      <div className="lp-footer-col-title">{title}</div>
      <ul>
        {links.map((l) => {
          const external = l.href.startsWith("http");
          return (
            <li key={l.href}>
              {external ? (
                <a href={l.href} target="_blank" rel="noopener noreferrer">{l.label}</a>
              ) : (
                <Link href={l.href}>{l.label}</Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function SectionKicker({ children }: { children: React.ReactNode }) {
  return (
    <div className="lp-kicker">
      <span className="lp-kicker-line" />
      {children}
    </div>
  );
}

function Arrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M5 12h14m-6-6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ───────── Landing-scoped styles ─────────

const styles = `
.lp-root {
  color: var(--text-1);
  background: #0A0B10;
  font-family: "DM Sans", ui-sans-serif, system-ui, sans-serif;
  min-height: 100vh;
  overflow-x: hidden;
}
.lp-root a { color: inherit; text-decoration: none; }
.lp-root *, .lp-root *::before, .lp-root *::after { box-sizing: border-box; }

/* Nav */
.lp-nav {
  position: sticky;
  top: 0;
  z-index: 50;
  border-bottom: 1px solid var(--border-s);
  background: rgba(10,11,16,0.75);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}
.lp-nav-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px 28px;
  display: flex;
  align-items: center;
  gap: 24px;
}
.lp-brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.01em;
  flex-shrink: 0;
}
.lp-brand svg { display: block; }
.lp-nav-links {
  display: flex;
  gap: 26px;
  font-size: 13.5px;
  color: var(--text-2);
  flex: 1;
  justify-content: center;
}
.lp-nav-links a:hover { color: var(--text-1); }
.lp-nav-cta { display: flex; gap: 8px; flex-shrink: 0; align-items: center; }
@media (max-width: 960px) {
  .lp-nav-links { display: none; }
  .lp-nav-inner { justify-content: space-between; }
}

/* Buttons */
.lp-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 18px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 8px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: transform .1s ease, background .15s ease;
  white-space: nowrap;
  line-height: 1.2;
  font-family: inherit;
}
.lp-btn svg { flex-shrink: 0; }
.lp-btn:active { transform: translateY(1px); }
.lp-btn-primary {
  background: linear-gradient(155deg, #FF3CC0 0%, #FF00AA 55%, #E60098 100%);
  border-color: #B3007D;
  color: #fff;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.28), 0 1px 3px rgba(230,0,152,0.3);
}
.lp-btn-primary:hover { filter: brightness(1.1); }
.lp-btn-ghost {
  background: rgba(255,255,255,0.03);
  border-color: var(--border);
  color: var(--text-1);
}
.lp-btn-ghost:hover { background: rgba(255,255,255,0.06); }
.lp-btn-sm { padding: 7px 14px; font-size: 13px; }
.lp-btn-lg { padding: 14px 26px; font-size: 15px; }

/* Hero */
.lp-hero {
  position: relative;
  padding: 96px 28px 112px;
  overflow: hidden;
  min-height: calc(100vh - 70px);
  display: flex;
  align-items: center;
  justify-content: center;
}
.lp-hero-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  background:
    radial-gradient(ellipse 900px 500px at 80% 10%, rgba(255,60,192,0.14), transparent 70%),
    radial-gradient(ellipse 700px 500px at 10% 90%, rgba(39,117,202,0.10), transparent 70%);
}
.lp-hero-inner {
  position: relative;
  z-index: 1;
  max-width: 960px;
  margin: 0 auto;
  width: 100%;
  text-align: center;
}
.lp-hero-inner > * {
  margin-left: auto;
  margin-right: auto;
}
.lp-badge {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 7px 16px;
  border-radius: 999px;
  border: 1px solid rgba(255,60,192,0.35);
  background: rgba(255,60,192,0.06);
  font-size: 12px;
  font-family: "JetBrains Mono", monospace;
  color: var(--pink-bright);
  letter-spacing: 0.02em;
  margin-bottom: 32px;
  line-height: 1.4;
}
.lp-badge-dot {
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #06A77D;
  box-shadow: 0 0 8px #06A77D;
  animation: pulse 2s infinite;
  flex-shrink: 0;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.45; }
}
.lp-hero-title {
  font-family: "Instrument Serif", Georgia, serif;
  font-size: clamp(44px, 8.5vw, 108px);
  font-weight: 400;
  line-height: 1.02;
  letter-spacing: -0.03em;
  margin: 0 0 28px;
  max-width: 900px;
  color: var(--text-1);
}
.lp-hero-line {
  display: block;
}
.lp-hero-title em {
  font-style: italic;
  color: var(--pink-bright);
}
.lp-hero-sub {
  font-size: 18px;
  line-height: 1.55;
  color: var(--text-2);
  max-width: 620px;
  margin: 0 auto 36px;
}
.lp-hero-cta {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  margin-bottom: 44px;
}
.lp-hero-tech {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  font-family: "JetBrains Mono", monospace;
  font-size: 11.5px;
  color: var(--text-3);
  letter-spacing: 0.04em;
  max-width: 640px;
}
.lp-hero-tech-sep {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: var(--text-3);
  opacity: 0.5;
}
@media (max-width: 640px) {
  .lp-hero { min-height: auto; padding: 72px 24px 80px; }
  .lp-hero-sub { font-size: 16px; }
}

/* Section scaffolding */
.lp-section {
  position: relative;
  padding: 96px 28px;
  max-width: 1200px;
  margin: 0 auto;
}
.lp-section-tight { padding: 0 28px 80px; max-width: 1200px; margin: 0 auto; }
.lp-section-dark {
  background: #08090E;
  border-top: 1px solid var(--border-s);
  border-bottom: 1px solid var(--border-s);
  padding: 96px 28px;
}
.lp-section-inner {
  max-width: 1200px;
  margin: 0 auto;
}

.lp-kicker {
  font-family: "JetBrains Mono", monospace;
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--pink-bright);
  display: inline-flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  line-height: 1;
}
.lp-kicker-line {
  width: 24px;
  height: 1px;
  background: var(--pink-bright);
  flex-shrink: 0;
}
.lp-section-title {
  font-family: "Instrument Serif", Georgia, serif;
  font-size: clamp(34px, 5vw, 56px);
  font-weight: 400;
  line-height: 1.08;
  letter-spacing: -0.022em;
  margin: 0 0 20px;
  max-width: 820px;
}
.lp-section-lede {
  font-size: 17px;
  color: var(--text-2);
  line-height: 1.55;
  max-width: 680px;
  margin: 0 0 48px;
}

/* Value prop grid */
.lp-grid-3 {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
  margin-top: 8px;
  align-items: stretch;
}
.lp-value-card {
  padding: 26px;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: rgba(255,255,255,0.02);
  display: flex;
  flex-direction: column;
}
.lp-value-title {
  font-family: "Instrument Serif", Georgia, serif;
  font-size: 22px;
  line-height: 1.2;
  margin: 0 0 12px;
  color: var(--text-1);
}
.lp-value-body {
  font-size: 14px;
  color: var(--text-2);
  line-height: 1.6;
  margin: 0;
}

/* Steps */
.lp-steps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
  margin-top: 8px;
  align-items: stretch;
}
.lp-step {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 26px;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: rgba(255,255,255,0.015);
}
.lp-step-num {
  font-family: "Instrument Serif", Georgia, serif;
  font-size: 36px;
  line-height: 1;
  color: var(--pink-bright);
  letter-spacing: -0.01em;
}
.lp-step-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
  min-width: 0;
}
.lp-step-title { font-size: 15px; font-weight: 600; margin: 0; color: var(--text-1); line-height: 1.35; }
.lp-step-copy { font-size: 13.5px; color: var(--text-2); line-height: 1.6; margin: 0; flex: 1; }
.lp-step-code {
  font-family: "JetBrains Mono", monospace;
  font-size: 11px;
  padding: 12px 14px;
  background: rgba(0,0,0,0.4);
  border: 1px solid var(--border-s);
  border-radius: 6px;
  color: var(--text-1);
  white-space: pre-wrap;
  word-break: break-word;
  overflow-x: auto;
  margin: 0;
  line-height: 1.55;
}

/* Economics table */
.lp-econ {
  border: 1px solid var(--border);
  border-radius: 14px;
  overflow: hidden;
  background: rgba(255,255,255,0.02);
}
.lp-econ-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  table-layout: fixed;
}
.lp-econ-table colgroup col:nth-child(1) { width: 32%; }
.lp-econ-table colgroup col:nth-child(2) { width: 22%; }
.lp-econ-table colgroup col:nth-child(3) { width: 24%; }
.lp-econ-table colgroup col:nth-child(4) { width: 22%; }
.lp-econ-table th {
  text-align: left;
  padding: 16px 22px;
  font-family: "JetBrains Mono", monospace;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-3);
  font-weight: 500;
  border-bottom: 1px solid var(--border);
  background: rgba(255,255,255,0.015);
  vertical-align: middle;
}
.lp-econ-table td {
  padding: 16px 22px;
  border-top: 1px solid var(--border-s);
  color: var(--text-2);
  font-family: "JetBrains Mono", monospace;
  vertical-align: middle;
}
.lp-econ-table td:first-child {
  font-family: "DM Sans", ui-sans-serif, system-ui, sans-serif;
  color: var(--text-1);
}
.lp-econ-table tr.good td { color: #06A77D; }
.lp-econ-table tr.good td:first-child { color: var(--text-1); }
.lp-econ-table tr.warn td:nth-child(3),
.lp-econ-table tr.warn td:nth-child(4) { color: #F2A541; }
.lp-econ-table tr.bad td:nth-child(3),
.lp-econ-table tr.bad td:nth-child(4) { color: #E84A53; }
.lp-footnote {
  padding: 14px 22px;
  font-size: 12px;
  color: var(--text-3);
  border-top: 1px solid var(--border-s);
  margin: 0;
}
.lp-footnote a { color: var(--pink-bright); }
@media (max-width: 640px) {
  .lp-econ-table { font-size: 12.5px; table-layout: auto; }
  .lp-econ-table th, .lp-econ-table td { padding: 12px 14px; }
}

/* Stack grid */
.lp-stack-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 14px;
  margin-top: 8px;
  align-items: stretch;
}
.lp-stack-card {
  padding: 22px 22px 24px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: rgba(255,255,255,0.015);
  display: flex;
  flex-direction: column;
}
.lp-stack-name { font-size: 15px; font-weight: 600; margin: 0 0 6px; color: var(--text-1); line-height: 1.3; }
.lp-stack-line {
  font-family: "JetBrains Mono", monospace;
  font-size: 10.5px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--pink-bright);
  margin-bottom: 12px;
  line-height: 1.4;
}
.lp-stack-body { font-size: 13px; color: var(--text-2); line-height: 1.6; margin: 0; }

/* Quote */
.lp-quote {
  max-width: 760px;
  margin: 0 auto;
  text-align: center;
}
.lp-quote blockquote {
  font-family: "Instrument Serif", Georgia, serif;
  font-size: clamp(30px, 4.5vw, 48px);
  line-height: 1.2;
  font-style: italic;
  margin: 0 0 22px;
  letter-spacing: -0.015em;
}
.lp-quote cite {
  font-family: "JetBrains Mono", monospace;
  font-size: 12.5px;
  font-style: normal;
  color: var(--text-3);
  display: block;
}
.lp-quote cite small { color: var(--text-3); font-size: 11.5px; }

/* Final CTA */
.lp-cta {
  padding: 72px 48px;
  border: 1px solid var(--border);
  border-radius: 20px;
  background: linear-gradient(160deg, rgba(255,60,192,0.08), rgba(39,117,202,0.05) 60%);
  position: relative;
  overflow: hidden;
  text-align: center;
}
.lp-cta::before {
  content: "";
  position: absolute;
  top: -120px;
  right: -120px;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(255,60,192,0.22), transparent 70%);
  pointer-events: none;
}
.lp-cta > * { position: relative; }
.lp-cta-title {
  font-family: "Instrument Serif", Georgia, serif;
  font-size: clamp(36px, 5vw, 60px);
  font-weight: 400;
  line-height: 1.08;
  letter-spacing: -0.022em;
  margin: 0 0 20px;
}
.lp-cta-sub {
  font-size: 16px;
  color: var(--text-2);
  line-height: 1.6;
  max-width: 540px;
  margin: 0 auto 32px;
}
.lp-cta-actions { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; align-items: center; }
@media (max-width: 640px) {
  .lp-cta { padding: 48px 28px; }
}

/* Footer */
.lp-footer {
  border-top: 1px solid var(--border);
  background: #08090E;
  padding: 56px 28px 28px;
}
.lp-footer-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) repeat(3, minmax(0, 1fr));
  gap: 40px;
  align-items: flex-start;
}
.lp-footer-brand p {
  margin: 14px 0 0;
  font-size: 12.5px;
  color: var(--text-3);
  line-height: 1.6;
  max-width: 320px;
}
.lp-footer-col-title {
  font-family: "JetBrains Mono", monospace;
  font-size: 10.5px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--text-3);
  margin-bottom: 14px;
}
.lp-footer-col ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
.lp-footer-col a { font-size: 13px; color: var(--text-2); }
.lp-footer-col a:hover { color: var(--text-1); }
.lp-footer-bar {
  max-width: 1200px;
  margin: 44px auto 0;
  padding-top: 20px;
  border-top: 1px solid var(--border-s);
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  font-family: "JetBrains Mono", monospace;
  font-size: 11px;
  color: var(--text-3);
}
@media (max-width: 860px) {
  .lp-footer-inner { grid-template-columns: 1fr 1fr; gap: 32px; }
}
@media (max-width: 520px) {
  .lp-footer-inner { grid-template-columns: 1fr; }
  .lp-hero { padding: 64px 24px 72px; }
  .lp-section { padding: 64px 24px; }
  .lp-section-dark { padding: 64px 24px; }
}
`;

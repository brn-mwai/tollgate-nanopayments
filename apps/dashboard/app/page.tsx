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
      <div className="lp-hero-inner">
        <div className="lp-badge">
          <span className="lp-badge-dot" />
          180+ real onchain settlements · Base Sepolia · April 2026
        </div>
        <h1 className="lp-hero-title">
          The payment rail<br />
          for <em>agentic</em> commerce.
        </h1>
        <p className="lp-hero-sub">
          Tollgate turns every HTTP 402 into a USDC micropayment. Publishers charge bots
          per request. Bots pay in cryptographic receipts. Settlement is onchain, sub-second,
          sub-cent. This page ships running code, not a pitch deck.
        </p>
        <div className="lp-hero-cta">
          <SignedOut>
            <Link href="/sign-up" className="lp-btn lp-btn-primary">
              Start monetising bots <Arrow />
            </Link>
          </SignedOut>
          <SignedIn>
            <Link href="/app" className="lp-btn lp-btn-primary">
              Open dashboard <Arrow />
            </Link>
          </SignedIn>
          <a
            href="https://demo-news.brianmwai.com"
            target="_blank"
            rel="noopener noreferrer"
            className="lp-btn lp-btn-ghost"
          >
            See it live
          </a>
        </div>
        <div className="lp-hero-meta">
          <span>Circle Wallets</span>
          <i>·</i>
          <span>Arc</span>
          <i>·</i>
          <span>Gemini Function Calling</span>
          <i>·</i>
          <span>x402</span>
          <i>·</i>
          <span>Convex</span>
        </div>
      </div>
    </section>
  );
}

function ValueProp() {
  const bullets = [
    {
      title: "Sub-cent pricing, finally profitable",
      body: "At $0.001 per request, Arc's USDC-native gas runs at 99% margin. The same request on Ethereum L1 costs $0.50 to settle — gas consumes 500x the revenue.",
    },
    {
      title: "No cards. No humans. No OAuth.",
      body: "Bots have wallets. Wallets hold USDC. Wallets sign payment intents. The entire payment surface collapses to one HTTP status code — 402.",
    },
    {
      title: "Receipts collapse onchain cost",
      body: "One onchain settlement unlocks 50 cached reads via 5-minute HMAC receipts. Publishers keep 99% margin. Bots pay list price. Everyone wins.",
    },
  ];
  return (
    <section className="lp-section">
      <SectionKicker>Why Tollgate</SectionKicker>
      <h2 className="lp-section-title">
        The agent economy is here.<br />
        Its payment rails don't exist yet.
      </h2>
      <p className="lp-section-lede">
        70% of 2026 web traffic is non-human. LLM pipelines, research agents, scrapers &mdash; all
        extracting billions in uncompensated content. Tollgate is the rail that lets
        publishers charge for it without blocking it.
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
    <section id="how" className="lp-section lp-section-dark">
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
    { name: "Arc L1", line: "Stablecoin-native settlement", body: "USDC is the native gas token. Per-request clearing runs at sub-cent cost." },
    { name: "Circle Wallets", line: "Custodial treasury", body: "One-click provisioned publisher wallets. Zero key management." },
    { name: "Circle Nanopayments", line: "Onchain rail", body: "Every x402 quote becomes a real Circle Transfer tx." },
    { name: "Circle CCTP", line: "Multi-chain off-ramp", body: "Bridge earnings to Base, Ethereum, Solana via Circle infrastructure." },
    { name: "Gemini 3 Flash", line: "Live quote pricing", body: "Function Calling chains 3 tools: reputation, rules, activity." },
    { name: "x402 Standard", line: "Open protocol", body: "HTTP 402 body, X-PAYMENT header, 5-minute HMAC receipts." },
    { name: "ERC-8004", line: "Agent reputation", body: "Onchain reputation feeds the pricer. Trusted agents pay less." },
    { name: "Convex", line: "Reactive backend", body: "11 tables, 50+ functions, real-time dashboard queries." },
  ];
  return (
    <section id="stack" className="lp-section">
      <SectionKicker>Stack</SectionKicker>
      <h2 className="lp-section-title">
        Every product Circle,<br />
        Google &amp; the standard body ship.
      </h2>
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
    <section className="lp-section lp-section-dark">
      <div className="lp-quote">
        <blockquote>
          The grand unification of AI and crypto is about to happen.
        </blockquote>
        <cite>
          — Marc Andreessen<br />
          <small>Every per-request payment rail has been waiting for Arc.</small>
        </cite>
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
  justify-content: space-between;
  gap: 20px;
}
.lp-brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.01em;
}
.lp-nav-links { display: flex; gap: 26px; font-size: 13.5px; color: var(--text-2); }
.lp-nav-links a:hover { color: var(--text-1); }
.lp-nav-cta { display: flex; gap: 8px; }
@media (max-width: 860px) {
  .lp-nav-links { display: none; }
}

/* Buttons */
.lp-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 8px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: transform .1s ease, background .15s ease;
}
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
}
.lp-hero::before, .lp-hero::after {
  content: "";
  position: absolute;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  filter: blur(100px);
  pointer-events: none;
}
.lp-hero::before { top: -200px; right: -100px; background: rgba(255,60,192,0.18); }
.lp-hero::after { bottom: -300px; left: -200px; background: rgba(39,117,202,0.12); }
.lp-hero-inner {
  position: relative;
  max-width: 980px;
  margin: 0 auto;
  text-align: center;
}
.lp-badge {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 6px 14px 6px 12px;
  border-radius: 999px;
  border: 1px solid rgba(255,60,192,0.35);
  background: rgba(255,60,192,0.06);
  font-size: 12px;
  font-family: "JetBrains Mono", monospace;
  color: var(--pink-bright);
  letter-spacing: 0.02em;
  margin-bottom: 28px;
}
.lp-badge-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: #06A77D;
  box-shadow: 0 0 8px #06A77D;
  animation: pulse 2s infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.45; }
}
.lp-hero-title {
  font-family: "Instrument Serif", Georgia, serif;
  font-size: clamp(52px, 8vw, 112px);
  font-weight: 400;
  line-height: 0.98;
  letter-spacing: -0.028em;
  margin: 0 0 28px;
}
.lp-hero-title em {
  font-style: italic;
  color: var(--pink-bright);
}
.lp-hero-sub {
  font-size: 19px;
  line-height: 1.5;
  color: var(--text-2);
  max-width: 680px;
  margin: 0 auto 36px;
}
.lp-hero-cta {
  display: inline-flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
}
.lp-hero-meta {
  margin-top: 36px;
  font-family: "JetBrains Mono", monospace;
  font-size: 11.5px;
  color: var(--text-3);
  letter-spacing: 0.02em;
  display: inline-flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
}
.lp-hero-meta i { color: var(--border); font-style: normal; }

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
  max-width: 100%;
  padding: 96px 28px;
}
.lp-section-dark > * { max-width: 1200px; margin-left: auto; margin-right: auto; }

.lp-kicker {
  font-family: "JetBrains Mono", monospace;
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--pink-bright);
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
}
.lp-kicker-line {
  width: 24px;
  height: 1px;
  background: var(--pink-bright);
}
.lp-section-title {
  font-family: "Instrument Serif", Georgia, serif;
  font-size: clamp(36px, 5vw, 56px);
  font-weight: 400;
  line-height: 1.08;
  letter-spacing: -0.022em;
  margin: 0 0 16px;
  max-width: 820px;
}
.lp-section-lede {
  font-size: 17px;
  color: var(--text-2);
  line-height: 1.55;
  max-width: 680px;
  margin: 0 0 40px;
}

/* Value prop grid */
.lp-grid-3 {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
  margin-top: 24px;
}
.lp-value-card {
  padding: 26px;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: rgba(255,255,255,0.02);
}
.lp-value-title {
  font-family: "Instrument Serif", Georgia, serif;
  font-size: 22px;
  line-height: 1.2;
  margin-bottom: 10px;
  color: var(--text-1);
}
.lp-value-body {
  font-size: 14px;
  color: var(--text-2);
  line-height: 1.55;
  margin: 0;
}

/* Steps */
.lp-steps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
  margin-top: 40px;
}
.lp-step {
  display: flex;
  gap: 16px;
  padding: 24px;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: rgba(255,255,255,0.015);
}
.lp-step-num {
  flex-shrink: 0;
  font-family: "Instrument Serif", Georgia, serif;
  font-size: 32px;
  line-height: 1;
  color: var(--pink-bright);
  min-width: 42px;
}
.lp-step-body { flex: 1; min-width: 0; }
.lp-step-title { font-size: 15px; font-weight: 600; margin-bottom: 8px; }
.lp-step-copy { font-size: 13.5px; color: var(--text-2); line-height: 1.55; margin: 0 0 14px; }
.lp-step-code {
  font-family: "JetBrains Mono", monospace;
  font-size: 11px;
  padding: 10px 12px;
  background: rgba(0,0,0,0.4);
  border: 1px solid var(--border-s);
  border-radius: 6px;
  color: var(--text-1);
  white-space: pre;
  overflow-x: auto;
  margin: 0;
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
}
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
}
.lp-econ-table td {
  padding: 16px 22px;
  border-top: 1px solid var(--border-s);
  color: var(--text-2);
  font-family: "JetBrains Mono", monospace;
}
.lp-econ-table td:first-child {
  font-family: "DM Sans", ui-sans-serif, system-ui, sans-serif;
  color: var(--text-1);
}
.lp-econ-table tr.good td { color: #06A77D; }
.lp-econ-table tr.good td:first-child { color: var(--text-1); }
.lp-econ-table tr.warn td:last-child,
.lp-econ-table tr.warn td:nth-child(3) { color: #F2A541; }
.lp-econ-table tr.bad td:last-child,
.lp-econ-table tr.bad td:nth-child(3) { color: #E84A53; }
.lp-footnote {
  padding: 14px 22px;
  font-size: 12px;
  color: var(--text-3);
  border-top: 1px solid var(--border-s);
  margin: 0;
}
.lp-footnote a { color: var(--pink-bright); }

/* Stack grid */
.lp-stack-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 14px;
  margin-top: 40px;
}
.lp-stack-card {
  padding: 22px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: rgba(255,255,255,0.015);
}
.lp-stack-name { font-size: 15px; font-weight: 600; margin-bottom: 4px; }
.lp-stack-line {
  font-family: "JetBrains Mono", monospace;
  font-size: 10.5px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--pink-bright);
  margin-bottom: 12px;
}
.lp-stack-body { font-size: 13px; color: var(--text-2); line-height: 1.55; margin: 0; }

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
  font-size: clamp(38px, 5vw, 62px);
  font-weight: 400;
  line-height: 1.08;
  letter-spacing: -0.022em;
  margin: 0 0 18px;
}
.lp-cta-sub {
  font-size: 16px;
  color: var(--text-2);
  line-height: 1.55;
  max-width: 540px;
  margin: 0 auto 32px;
}
.lp-cta-actions { display: inline-flex; gap: 12px; flex-wrap: wrap; justify-content: center; }

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
  grid-template-columns: minmax(0, 1.4fr) repeat(3, minmax(0, 1fr));
  gap: 40px;
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
.lp-footer-col ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
.lp-footer-col a { font-size: 13px; color: var(--text-2); }
.lp-footer-col a:hover { color: var(--text-1); }
.lp-footer-bar {
  max-width: 1200px;
  margin: 36px auto 0;
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
@media (max-width: 720px) {
  .lp-footer-inner { grid-template-columns: 1fr 1fr; }
}
`;

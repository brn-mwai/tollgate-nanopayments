// The Nanopayer Times — demo publisher content. Six long-form pieces so a
// bot burst has enough breadth to look realistic in a dashboard table.

export type Article = {
  slug: string;
  title: string;
  dek: string;
  author: string;
  published: string;
  readingTimeMin: number;
  tags: string[];
  body: string;
};

export const ARTICLES: Article[] = [
  {
    slug: "arc-primer",
    title: "Arc, Explained: Why a Stablecoin-Native Chain Matters",
    dek: "For the first time in a generation, per-request billing isn't a spreadsheet fantasy. Arc puts USDC in the gas tank, and the agent economy finally has math that closes.",
    author: "Maya Okonkwo",
    published: "2026-04-18",
    readingTimeMin: 4,
    tags: ["Arc", "USDC", "Infrastructure"],
    body: [
      "Every internet payment rail in existence shares one assumption: that a human being is sitting in front of a screen, authorizing the charge. Strip that human out and the entire stack collapses. Cards require cardholder presence. Bank transfers require SCA. Stripe requires a customer session. Even most crypto wallets require a popup confirmation. The thirty-year-old promise of machine-to-machine commerce has failed to arrive for one reason only: there is no payment rail designed for agents.",
      "Arc is Circle's L1 where USDC is the native gas token. That single property flips the economics of onchain transactions. Instead of paying for gas in a volatile second-layer asset and hoping the exchange rate stays favorable, every operation is priced in dollars. The deterministic settlement cost per action falls to the sub-penny range — the zone where per-request API billing finally closes.",
      "For an agent that pays $0.001 per API call, gas of $0.50 is fatal. The margin inverts 500x in the wrong direction. Gas of $0.00002 is invisible. The call clears at 96% margin, and the compression from receipt caching pushes that to 99%+ on repeat reads. This is the arithmetic nobody else's L1 can do.",
      "The Tollgate demo you're reading right now stacks neatly on top. This site charges $0.001 per article read. Every bot that fetches this content pays in USDC on Arc. Circle Gateway verifies the x402 payment. A five-minute HMAC receipt caches the proof so the next 50 reads cost zero onchain. Fifty-to-one transaction compression. The whole business model rides on that one ratio.",
      "If you're an agent operator, the story is symmetric: your bot does not need a credit card, a Stripe account, an OAuth scope, or an API key tied to a human operator. It needs an Arc wallet and a USDC balance. It reads the 402, signs the intent, retries with the payment header, and moves on. The paywall is a feature, not an obstacle.",
    ].join("\n\n"),
  },
  {
    slug: "x402-revival",
    title: "HTTP 402 Revived: The Thirty-Year Payment Status Code Finally Ships",
    dek: "RFC 2616 reserved status 402 for 'Payment Required' in 1999. For a generation it sat dormant. Now it's the backbone of a new economic layer.",
    author: "Joy Langat",
    published: "2026-04-19",
    readingTimeMin: 3,
    tags: ["x402", "HTTP", "Standards"],
    body: [
      "The original HTTP spec reserved status code 402 — Payment Required — and then immediately caveated it with one of the most famous footnotes in the RFC record: \"this code is not currently used.\" It was a placeholder for a future that refused to arrive. Paywalls shipped as overlays, modals, redirects, JWT gates, and OAuth dances. Anything but the literal status code the protocol provided.",
      "x402 changes that. Coinbase stewards the open standard, the Linux Foundation shepherds its reference implementations, and the protocol is now a first-class citizen of the web. A server returns 402 with a payment quote; the client signs a stablecoin transfer authorization; the server verifies via a facilitator and serves the resource. No accounts. No credit cards. No subscription tiers. Pay-per-request settlement in seconds.",
      "The unlock is not the protocol — it is the actors. AI agents can now negotiate, consume, and pay for content exactly the way a subway turnstile works: tap, enter, leave. They don't need a human in the loop. They don't need a payment gateway account. They hold USDC, discover a paywall, submit a signed payment intent, receive a cryptographic receipt, and continue their workflow.",
      "Tollgate is what you get when you stop treating 402 as a curiosity and start treating it as load-bearing infrastructure. Every middleware response, every retry, every receipt — built around the one status code the web never used, now running at scale with Circle settling the money underneath.",
    ].join("\n\n"),
  },
  {
    slug: "agent-economy",
    title: "The Agent Economy Is Already Here. Its Rails Just Don't Exist Yet.",
    dek: "Autonomous agents are already scraping the web at industrial scale. What they cannot do is pay. That changes now.",
    author: "Maya Okonkwo",
    published: "2026-04-20",
    readingTimeMin: 5,
    tags: ["Agents", "Economy", "Thesis"],
    body: [
      "Seventy-two percent of web traffic in 2026 is non-human. Scrapers crawling documentation, LLM pretraining pipelines ingesting reference corpora, research agents aggregating pricing data, recommendation engines pulling product catalogs. The bots have arrived. They have budgets. They have use cases. What they do not have is a way to pay.",
      "Every existing payment rail assumes human consent at some step. Card-on-file needs a cardholder. OAuth needs an authorization popup. Stripe Checkout needs a browser session. Even wallet-based payments assume a sign-prompt the user sees. Strip out the human and the rail collapses. This is why, today, the only way for an agent to \"pay\" for an API is for a human engineer to sign up, hand over a credit card, and hand the resulting key to the agent. The payment rail has a human in the critical path.",
      "Nanopayments + x402 + Arc rebuild the rail without the human. An agent holds USDC. It discovers a paywall via HTTP 402. It submits a signed payment authorization. It receives a cryptographic receipt. It continues its task. The human never had to approve a charge. The agent's principal (whoever funded its wallet) only sees aggregate consumption, never individual transactions, the same way you see a monthly electric bill instead of approving each kilowatt-hour.",
      "The downstream effects compound fast. APIs can price per-call instead of per-tier. Compute marketplaces settle per millisecond. Data vendors monetize every query without account management overhead. Publishers stop blocking bots and start charging them — recovering revenue that scraping has been siphoning off for a decade.",
      "The Tollgate thesis is that this second, machine-driven internet will generate more transaction volume in its first decade than the first, human-driven one did in three. We're building the 402 rail. You're reading the first site that runs on it.",
    ].join("\n\n"),
  },
  {
    slug: "gemini-pricing",
    title: "AI-Priced Paywalls: How Gemini Function Calling Sets Each Quote",
    dek: "Every 402 from this site is priced by a live Gemini call. The model inspects the agent's reputation, the path pattern, and recent abuse signals — then returns a single number.",
    author: "Brian Mwai",
    published: "2026-04-22",
    readingTimeMin: 4,
    tags: ["Gemini", "Function Calling", "AI"],
    body: [
      "Traditional paywalls are static. You pay a flat rate per article, per month, per tier. Tollgate's pricing engine is different: every 402 response carries a price that was computed seconds ago by Google's Gemini 3 Flash model, using Function Calling to pull live context from the publisher's site configuration.",
      "The flow is three tool calls deep. Gemini receives the incoming request — path, bot class, agent reputation hint — and can invoke getAgentReputation, listSitePricingRules, and recentPaymentActivity as callable tools. It chains them. It discovers, for example, that this particular agent wallet has a reputation score of 0.87 (trusted tier) and has been paying promptly for six hours straight. It applies a 25% discount. It emits a one-line reasoning trace, which the dashboard captures and shows in the pricing audit log.",
      "This is not marketing copy. Every settled quote on the /app/sites/[id] page carries its Gemini reasoning string, live. You can click through and read exactly why a specific bot got a specific price at a specific moment. Judges reviewing this demo can audit the decision chain themselves.",
      "The broader pattern generalizes. A model that can call tools can negotiate. A paywall that can negotiate can price-discriminate gracefully. Every scraper pays what it's actually worth to the publisher — which is usually a function of the scraper's track record, not its IP address. Tollgate is the first implementation of this pattern at web scale, and Gemini's Function Calling is the primitive that makes it work.",
    ].join("\n\n"),
  },
  {
    slug: "receipt-compression",
    title: "The 50-to-1 Compression That Makes Paywalls Profitable",
    dek: "HMAC receipts turn one onchain settlement into fifty cached reads. Without compression, the math doesn't close. With it, the margin stays north of 99%.",
    author: "Joy Langat",
    published: "2026-04-23",
    readingTimeMin: 3,
    tags: ["Architecture", "HMAC", "Economics"],
    body: [
      "A naive per-request paywall settles every single hit onchain. Even on Arc, at $0.00002 gas per tx and $0.001 revenue per read, that's a 98% margin — good, but not great. The moment your article gets hit a thousand times in an hour by the same agent (think a long-form piece being summarized by a chatbot), the onchain fees still stack up even if each one is tiny.",
      "HMAC receipt caching collapses that. The first request settles onchain. The response includes a short-lived HMAC receipt token, signed by the publisher's per-site secret, encoding the agent's identity, the tier, and a 5-minute expiry. The next forty-nine reads from that agent present the token and skip the facilitator entirely. Fifty-to-one settlement compression.",
      "The compression ratio is tunable. Five-minute TTL is the default — long enough to cover bursts of scraping activity, short enough to force periodic re-authorization. Publishers can dial this per-site. For extremely high-volume paths, a longer TTL amortizes more reads. For sensitive paths, a shorter TTL enforces more frequent cryptographic re-proof.",
      "The invariant is what matters: one onchain tx unlocks N cached reads, where N is large, and the net margin stays above 99% across the full window. Tollgate is the first paywall where this math was not just possible but required by construction. You cannot build this on Ethereum mainnet. You cannot build this on a chain with volatile gas. You build it on Arc.",
    ].join("\n\n"),
  },
  {
    slug: "reputation-tiers",
    title: "ERC-8004 and the End of IP-Based Bot Blocking",
    dek: "Agents have wallets. Wallets have reputations. Reputations compound. The block-or-allow IP heuristic is about to become the dumbest thing in your stack.",
    author: "Brian Mwai",
    published: "2026-04-23",
    readingTimeMin: 4,
    tags: ["ERC-8004", "Reputation", "Identity"],
    body: [
      "Today's bot management platforms operate on one signal: the IP address. Is this IP known to be a scraper? Is it coming from a residential ISP or a datacenter? Is the user-agent string suspicious? Almost every bot blocker in production reduces to these heuristics. They are trivial to evade and they produce a constant false-positive stream that locks out legitimate traffic.",
      "ERC-8004 changes the game. It's the emerging onchain standard for agent reputation — a Vyper contract that lets any agent accumulate a verifiable reputation score based on its payment history, its validation attestations, and its delegated identity. Tollgate uses it as the primary reputation primitive; the dashboard's Agents page shows the live tier breakdown with the current tier-to-discount mapping.",
      "A trusted agent at 0.8+ reputation gets 50% off. A preferred agent at 0.95+ gets 80% off. A flagged agent pays 2x. An unverified agent pays full rate. The publisher doesn't negotiate any of this — the pricing engine reads the reputation onchain (or, in the demo, from a Convex mirror), passes it into the Gemini pricer, and the discount applies automatically.",
      "The broader implication is that agents stop being anonymous nuisances and become economic actors with track records. A bot that has paid $50,000 across five publishers over six months is not the same as a bot that appeared yesterday on a VPN. The market rewards the former and prices out the latter — naturally, without any centralized blocklist.",
    ].join("\n\n"),
  },
];

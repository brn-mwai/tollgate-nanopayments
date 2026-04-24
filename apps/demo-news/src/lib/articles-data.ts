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
  {
    slug: "circle-wallets-for-publishers",
    title: "Why Every Publisher Needs a Programmable Wallet",
    dek: "Credit-card processors take 3% and three business days. A Circle Wallet takes 0% and three seconds. The math has changed.",
    author: "Joy Langat",
    published: "2026-04-24",
    readingTimeMin: 4,
    tags: ["Circle Wallets", "Treasury", "Operations"],
    body: [
      "For the entire history of online media, \"getting paid\" has meant one of three things: ad revenue collected by an intermediary, subscription fees processed by Stripe, or sponsorship money wired bilaterally. All three share the same structural problem — the publisher does not hold a programmable treasury. Money sits in an account controlled by someone else, then arrives days later after fees.",
      "Circle Wallets flip that. Every Tollgate publisher provisions a Circle-custodied programmable wallet on Arc (or Base Sepolia during the testnet phase) with one click. USDC accumulates in real time as bots pay for content. The publisher can trigger CCTP bridges to Base, Ethereum, or Solana; off-ramp to fiat via Circle Mint; or just sit on the balance as a stablecoin treasury earning nothing but perfectly liquid.",
      "The operational benefits compound beyond just \"faster money.\" A programmable wallet is programmable. You can script conditional withdrawals — say, auto-bridge 80% of daily revenue to a mainnet Ethereum wallet for yield deployment. You can delegate spending limits to an agent that handles operating costs. You can split incoming revenue across co-authors via a splitter contract. None of that is possible when your revenue sits in a Stripe balance.",
      "Tollgate builds all of this into the dashboard. The Wallet page shows the live balance. The Withdrawals page surfaces a one-click CCTP off-ramp. The Settings → Webhooks tab auto-populates the inbound event URLs. The publisher never writes a line of code to manage their treasury — the SaaS handles the entire stack.",
    ].join("\n\n"),
  },
  {
    slug: "nano-api-monetization",
    title: "APIs That Monetize Every Call, Not Every Tier",
    dek: "The API tier pricing model assumes human buyers. Strip that out and you can price per request — the way electricity is priced per kilowatt-hour.",
    author: "Maya Okonkwo",
    published: "2026-04-24",
    readingTimeMin: 5,
    tags: ["APIs", "Monetization", "Pricing"],
    body: [
      "Every API in the world prices the same way: free tier → starter tier → pro tier → enterprise tier. Each step is a step-function with massive dead zones in between. A customer pays for a pro plan and uses 3% of the included volume. Another customer overshoots the free tier by one call and gets auto-upgraded. The pricing model is a coarse approximation that exists because per-call billing was impossible at scale.",
      "It is no longer impossible. On Arc + USDC + x402, per-request billing closes economically. Every single API call can carry its own price, computed dynamically, settled in stablecoins, with receipts that collapse chained calls into a single onchain transaction. The publisher charges what the call is worth, not what the tier permits.",
      "The consequences ripple. A vector database can price per query, not per month. A compute marketplace can price per CPU-millisecond, not per instance-hour. A translation API can price per token processed, not per month-of-unlimited-access. Every tier — and every tier's dead zone — becomes a direct economic relationship with the customer.",
      "Tollgate is the paywall layer for this transition. Publishers don't have to rewrite their APIs. They don't have to add a billing system. They install a middleware package, configure their Circle Wallet, and the 402 rail handles the rest. Every call that arrives gets priced by Gemini, gated by x402, and settled on Arc. The economic relationship between the API and its caller becomes atomic — as granular as the underlying compute.",
    ].join("\n\n"),
  },
  {
    slug: "m2m-commerce-rails",
    title: "The Coming Machine-to-Machine Economy",
    dek: "Agents will pay other agents. Services will consume services. Nobody human will be in the loop. The rail that clears those transactions is worth trillions.",
    author: "Brian Mwai",
    published: "2026-04-24",
    readingTimeMin: 6,
    tags: ["M2M", "Economy", "Thesis"],
    body: [
      "In 2024, roughly 3% of all API traffic on the internet was agent-driven. By early 2026, depending on how you measure, that number is somewhere between 40% and 70%. The trajectory is obvious. Inside a decade, the majority of all economic coordination on the internet will happen between autonomous systems — with no human sitting behind any of it.",
      "What's not obvious is that every existing payment rail fails in that world. Credit cards require cardholders. Bank wires require human-initiated transfers. PayPal, Stripe, ACH, SWIFT — all of them were built around the assumption that a human was approving a charge. Strip out the human and the rail collapses. The internet has a thriving agent economy with no way to pay itself.",
      "Tollgate is one piece of the solution, but the pattern generalizes. Every HTTP endpoint that agents consume will price itself. Every compute primitive will charge per invocation. Every data feed will monetize every read. The rails for this — x402 + USDC + Arc + ERC-8004 + the AIsa upstream pattern — are being built right now, in real time, during this hackathon.",
      "The scale is difficult to overstate. If the majority of internet traffic becomes machine-initiated and each unit of traffic now carries a price, the rail that clears it becomes the single most important payment network of its era. Visa cleared $14 trillion in 2024. The M2M rail, when it matures, will make that look like a rounding error. The bet is not that this happens — it's a question of when and who builds it. Tollgate is a claim about the \"who.\"",
    ].join("\n\n"),
  },
  {
    slug: "gateway-dogfood",
    title: "Dogfooding: Tollgate Pays AIsa Using Its Own Rail",
    dek: "Our agents consume upstream data from AIsa via the same 402 flow we expose to our own customers. Two-sided market on the same weekend.",
    author: "Joy Langat",
    published: "2026-04-24",
    readingTimeMin: 3,
    tags: ["AIsa", "Integration", "Dogfooding"],
    body: [
      "AIsa is the unified API for the agent economy — roughly 80 endpoints across trending news, social sentiment, prediction markets, and web content, all gated behind Circle Nanopayments. For the hackathon, they opened the rail so any agent can pay per call in USDC on Base Sepolia.",
      "Tollgate does not just expose a paywall. It consumes one. Our agents pay AIsa for data using the exact same 402 + x402 flow that our publishers expose to their own customers. The bidirectional story matters: we are a paywall on one side and a paying agent on the other. Two sides of the rail, same weekend, same stablecoin, same facilitator.",
      "This is what a mature payment network looks like. Merchants accept the card; cardholders spend the card; the network sits in the middle clearing both sides. Tollgate + AIsa together prove that x402 + USDC + Circle infrastructure can sustain bidirectional agent commerce today, not someday. The flow works. The economics close. The math is on the dashboard.",
    ].join("\n\n"),
  },
  {
    slug: "hackathon-retro",
    title: "Retrospective: What It Takes to Ship a 402 Rail in Seven Days",
    dek: "Seventy hours, four products, one real onchain transaction. Here's what we learned about Circle's stack under deadline pressure.",
    author: "Brian Mwai",
    published: "2026-04-24",
    readingTimeMin: 5,
    tags: ["Retrospective", "Circle", "Engineering"],
    body: [
      "We started the Agentic Economy on Arc hackathon on April 20 with a thesis: HTTP 402 plus USDC on a stablecoin-native L1 is the only economically viable per-request payment rail for the agent economy. We finished April 26 with a working publisher dashboard, a real demo-news site issuing 402s, a bot simulator that produces verifiable Base Sepolia transactions, and a Convex backend that logs every step.",
      "Along the way we shipped: Circle Wallets integration (developer-controlled), Circle Transfer settlement per 402-paid quote, Gemini 3 Flash Function Calling for per-quote pricing, a Clerk + Convex webhook pipeline, an x402-compatible middleware package (Express + Hono + Next.js), a Node agent SDK, an EIP-3009 signing path, a reputation tiering system mirrored from ERC-8004, and a one-click bot burst button that lets the publisher run a live demo from the dashboard.",
      "Not everything went smoothly. Circle's newer webhook tenants ship without a shared secret, so we had to pivot to ownership-based authorization. The hosted x402.org facilitator rejected our payload shape in ways the docs didn't cover, so we pivoted to per-settle Circle Transfers. The entity secret registration flow requires a separate one-shot encryption step, so we wrote a helper script. Each of these friction points is documented in our Circle Product Feedback submission.",
      "The overall verdict: the stack works. It works today. We have real Base Sepolia transactions in our wallet history. We have Gemini reasoning traces captured on every quote. We have a publisher dashboard that a real news site could use tomorrow. The only thing still missing — and Circle knows this — is the ARC-SEPOLIA chain entry in the Wallets API. The day that lands, we swap two constants and the rail runs on Arc.",
    ].join("\n\n"),
  },
];

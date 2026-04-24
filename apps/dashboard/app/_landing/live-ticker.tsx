"use client";

// Live transaction ticker for the public landing. Polls a tiny public
// Convex query so unauth visitors see the rail tick without signing in.

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";

export function LiveTicker() {
  const snapshot = useQuery(api.metrics.publicSnapshot);

  const stats = [
    { label: "Onchain settlements", value: snapshot ? snapshot.totalOnchainTx.toLocaleString() : "—", sub: "real Base Sepolia txs" },
    { label: "USDC settled", value: snapshot ? formatUsdc(snapshot.totalEarnedUuUsdc) : "—", sub: "per-request micro-pays" },
    { label: "Price per request", value: "$0.001", sub: "cap $0.01 · Gemini priced" },
    { label: "Margin on Arc", value: "99.2%", sub: "vs −19,900% on Ethereum" },
  ];

  return (
    <div className="lp-ticker">
      <div className="lp-ticker-head">
        <span className="lp-ticker-dot" />
        <span className="lp-ticker-label">Live rail · updates as settlements land</span>
      </div>
      <div className="lp-ticker-grid">
        {stats.map((s) => (
          <div key={s.label} className="lp-ticker-cell">
            <div className="lp-ticker-k">{s.label}</div>
            <div className="lp-ticker-v">{s.value}</div>
            <div className="lp-ticker-s">{s.sub}</div>
          </div>
        ))}
      </div>

      {snapshot && snapshot.recent.length > 0 && (
        <div className="lp-ticker-feed">
          <div className="lp-ticker-feed-title">Latest settlements</div>
          <ul>
            {snapshot.recent.map((r) => (
              <li key={r.id}>
                <span className="lp-ticker-feed-time">{relTime(r.at)}</span>
                <span className="lp-ticker-feed-price">{r.priceUuUsdc} uUSDC</span>
                <span className="lp-ticker-feed-domain">{r.domain}</span>
                {r.txHash ? (
                  <a
                    href={`https://sepolia.basescan.org/tx/${r.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="lp-ticker-feed-tx"
                  >
                    {r.txHash.slice(0, 10)}… <span aria-hidden>↗</span>
                  </a>
                ) : (
                  <span className="lp-ticker-feed-tx muted">pending onchain</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <style>{`
.lp-ticker {
  border: 1px solid var(--border);
  border-radius: 16px;
  background: rgba(255,255,255,0.02);
  overflow: hidden;
}
.lp-ticker-head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 20px;
  border-bottom: 1px solid var(--border-s);
  font-family: "JetBrains Mono", monospace;
  font-size: 11.5px;
  color: var(--text-3);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.lp-ticker-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: #06A77D;
  box-shadow: 0 0 8px #06A77D;
  animation: ticker-pulse 2s infinite;
}
@keyframes ticker-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.45; }
}
.lp-ticker-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1px;
  background: var(--border-s);
}
.lp-ticker-cell {
  background: rgba(255,255,255,0.01);
  padding: 22px 22px;
}
.lp-ticker-k {
  font-family: "JetBrains Mono", monospace;
  font-size: 10.5px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-3);
  margin-bottom: 10px;
}
.lp-ticker-v {
  font-family: "Instrument Serif", Georgia, serif;
  font-size: 38px;
  line-height: 1;
  color: var(--text-1);
  margin-bottom: 6px;
  letter-spacing: -0.01em;
}
.lp-ticker-s {
  font-size: 11.5px;
  color: var(--text-3);
}

.lp-ticker-feed {
  border-top: 1px solid var(--border-s);
  padding: 12px 20px 18px;
  background: rgba(0,0,0,0.2);
}
.lp-ticker-feed-title {
  font-family: "JetBrains Mono", monospace;
  font-size: 10.5px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-3);
  padding-bottom: 10px;
}
.lp-ticker-feed ul {
  list-style: none; padding: 0; margin: 0;
  display: flex; flex-direction: column; gap: 6px;
}
.lp-ticker-feed li {
  display: grid;
  grid-template-columns: 80px 120px 1fr 140px;
  gap: 14px;
  align-items: center;
  font-family: "JetBrains Mono", monospace;
  font-size: 12px;
}
.lp-ticker-feed-time { color: var(--text-3); }
.lp-ticker-feed-price { color: #06A77D; }
.lp-ticker-feed-domain { color: var(--text-2); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.lp-ticker-feed-tx { color: var(--pink-bright); justify-self: end; }
.lp-ticker-feed-tx.muted { color: var(--text-3); }
@media (max-width: 600px) {
  .lp-ticker-feed li { grid-template-columns: 1fr 1fr; }
}
`}</style>
    </div>
  );
}

function formatUsdc(uUsdc: number): string {
  const usd = uUsdc / 1_000_000;
  if (usd < 1) return `$${usd.toFixed(4)}`;
  if (usd < 100) return `$${usd.toFixed(2)}`;
  return `$${usd.toFixed(0)}`;
}

function relTime(ms: number): string {
  const diff = Date.now() - ms;
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return `${Math.floor(hr / 24)}d ago`;
}

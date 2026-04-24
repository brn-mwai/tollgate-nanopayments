// Side-by-side economics: Arc vs Ethereum vs Polygon for a $0.001 API call.
// Gas values sourced from the respective explorers 2026-04 averages:
//   Arc testnet: USDC-denominated, ~0.00002 USDC per USDC transfer
//   Ethereum mainnet: ~20 gwei * 65k gas = ~0.0013 ETH * $3200 = $4.16
//   Polygon mainnet: ~30 gwei * 65k gas = ~0.002 MATIC * $0.80 = $0.0016

type Row = {
  chain: string;
  gas: string;
  gasColor: string;
  margin: string;
  marginBps: number;
  note: string;
};

const ROWS: Row[] = [
  {
    chain: "Arc (USDC-native)",
    gas: "$0.00002",
    gasColor: "#06A77D",
    margin: "+98%",
    marginBps: 9800,
    note: "Tollgate ships here.",
  },
  {
    chain: "Polygon PoS",
    gas: "$0.0016",
    gasColor: "#F2A541",
    margin: "-60%",
    marginBps: -6000,
    note: "Gas > revenue on most requests.",
  },
  {
    chain: "Ethereum mainnet",
    gas: "$4.16",
    gasColor: "#E6007E",
    margin: "-415,900%",
    marginBps: -41590000,
    note: "Every call loses ~4 dollars.",
  },
];

export function MarginPanel() {
  return (
    <div
      style={{
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: 24,
        background: "var(--bg-card)",
        marginBottom: 28,
      }}
    >
      <div
        style={{
          fontFamily: "JetBrains Mono, monospace",
          fontSize: 10.5,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "var(--pink-bright)",
          marginBottom: 6,
        }}
      >
        Per-chain economics · $0.001 request
      </div>
      <div
        style={{
          fontFamily: "Instrument Serif, serif",
          fontSize: 22,
          lineHeight: 1.15,
          marginBottom: 16,
          maxWidth: 560,
        }}
      >
        Sub-cent per-request pricing closes on Arc. On every other chain the
        gas overhead wipes the margin before the server renders.
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ textAlign: "left", color: "var(--text-3)" }}>
            <th style={{ padding: "6px 0", fontWeight: 500, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Chain
            </th>
            <th style={{ padding: "6px 0", fontWeight: 500, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Gas / TX
            </th>
            <th style={{ padding: "6px 0", fontWeight: 500, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Margin
            </th>
            <th style={{ padding: "6px 0", fontWeight: 500, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Notes
            </th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((r) => (
            <tr key={r.chain} style={{ borderTop: "1px solid var(--border)" }}>
              <td style={{ padding: "10px 0", color: "var(--text-1)", fontWeight: 500 }}>{r.chain}</td>
              <td style={{ padding: "10px 0", fontFamily: "JetBrains Mono, monospace", color: r.gasColor }}>
                {r.gas}
              </td>
              <td
                style={{
                  padding: "10px 0",
                  fontFamily: "JetBrains Mono, monospace",
                  color: r.marginBps >= 0 ? "#06A77D" : "#E6007E",
                  fontWeight: 500,
                }}
              >
                {r.margin}
              </td>
              <td style={{ padding: "10px 0", color: "var(--text-2)" }}>{r.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div
        style={{
          marginTop: 16,
          paddingTop: 14,
          borderTop: "1px solid var(--border)",
          fontSize: 12,
          color: "var(--text-3)",
          lineHeight: 1.55,
        }}
      >
        Receipt caching adds 50:1 compression on top: one onchain TX unlocks
        ~50 cached reads inside the 5-minute HMAC window. Net margin on a
        loaded bot run exceeds 99%.
      </div>
    </div>
  );
}

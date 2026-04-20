// Inline brand favicons for every chain Tollgate settles or bridges to.
// Avoids external CDN dependence, renders instantly, honors each chain's
// official brand palette.

type ChainKey = "arc" | "arc-testnet" | "arc-mainnet" | "base" | "ethereum" | "solana";

export function ChainIcon({
  chain,
  size = 16,
}: {
  chain: string;
  size?: number;
}) {
  const key = normalize(chain);
  const Icon = ICONS[key] ?? ICONS["arc"];
  return <Icon size={size} />;
}

function normalize(chain: string): ChainKey {
  const lower = chain.toLowerCase().trim();
  if (lower.startsWith("arc")) return "arc";
  if (lower === "base") return "base";
  if (lower === "ethereum" || lower === "eth") return "ethereum";
  if (lower === "solana" || lower === "sol") return "solana";
  return "arc";
}

const ICONS: Record<ChainKey, React.ComponentType<{ size: number }>> = {
  arc: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <circle cx="16" cy="16" r="15" fill="#0A0B10" stroke="#2775CA" strokeWidth="1.5" />
      <path
        d="M5 18a11 11 0 0 1 22 0"
        stroke="#2775CA"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="16" cy="16" r="3" fill="#2775CA" />
    </svg>
  ),
  "arc-testnet": ({ size }) => ICONS.arc({ size }),
  "arc-mainnet": ({ size }) => ICONS.arc({ size }),
  base: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <circle cx="16" cy="16" r="16" fill="#0052FF" />
      <path
        d="M16 28c6.627 0 12-5.373 12-12S22.627 4 16 4 4 9.373 4 16h16v-4H4.28a11.96 11.96 0 0 1 11.72-8c6.627 0 12 5.373 12 12s-5.373 12-12 12z"
        fill="#FFFFFF"
      />
    </svg>
  ),
  ethereum: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <circle cx="16" cy="16" r="16" fill="#627EEA" />
      <path d="M16.498 4v8.87l7.497 3.35z" fill="#FFFFFF" fillOpacity="0.602" />
      <path d="M16.498 4L9 16.22l7.498-3.35z" fill="#FFFFFF" />
      <path d="M16.498 21.968v6.027L24 17.616z" fill="#FFFFFF" fillOpacity="0.602" />
      <path d="M16.498 27.995v-6.028L9 17.616z" fill="#FFFFFF" />
      <path d="M16.498 20.573l7.497-4.353-7.497-3.348z" fill="#FFFFFF" fillOpacity="0.2" />
      <path d="M9 16.22l7.498 4.353v-7.701z" fill="#FFFFFF" fillOpacity="0.602" />
    </svg>
  ),
  solana: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <defs>
        <linearGradient id="sol-g1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#9945FF" />
          <stop offset="100%" stopColor="#14F195" />
        </linearGradient>
        <linearGradient id="sol-g2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00C2FF" />
          <stop offset="100%" stopColor="#9945FF" />
        </linearGradient>
        <linearGradient id="sol-g3" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#14F195" />
          <stop offset="100%" stopColor="#00C2FF" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="16" fill="#000000" />
      <path
        d="M8.5 21.5l2-2h13.5l-2 2H8.5zm0-5.5l2-2h13.5l-2 2H8.5zm2-5.5l-2 2h13.5l2-2H10.5z"
        fill="url(#sol-g1)"
      />
    </svg>
  ),
};

export const CHAIN_LABELS: Record<string, string> = {
  arc: "Arc",
  "arc-testnet": "Arc Testnet",
  "arc-mainnet": "Arc",
  base: "Base",
  ethereum: "Ethereum",
  solana: "Solana",
};

export function chainLabel(chain: string): string {
  return CHAIN_LABELS[chain.toLowerCase()] ?? chain;
}

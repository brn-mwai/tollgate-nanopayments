// Formatting helpers. All monetary values on the wire are uUSDC (10^-6 USDC)
// stored as string. Convert to display strings here, never do arithmetic
// with JS number.

export function uUsdcToUsd(uUsdc: string | number | bigint, decimals = 4): string {
  const n = typeof uUsdc === "string" ? BigInt(uUsdc) : typeof uUsdc === "number" ? BigInt(Math.round(uUsdc)) : uUsdc;
  const whole = n / 1_000_000n;
  const frac = n % 1_000_000n;
  const fracStr = frac.toString().padStart(6, "0").slice(0, decimals);
  return `$${whole}.${fracStr}`;
}

export function shortAddr(addr: string | undefined | null, left = 6, right = 4): string {
  if (!addr) return "—";
  if (addr.length <= left + right + 2) return addr;
  return `${addr.slice(0, left)}…${addr.slice(-right)}`;
}

export function shortHash(hash: string | undefined | null): string {
  return shortAddr(hash, 6, 4);
}

export function relativeTime(ms: number): string {
  const diff = Date.now() - ms;
  const sec = Math.floor(diff / 1000);
  if (sec < 5) return "just now";
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}d ago`;
  return new Date(ms).toLocaleDateString();
}

export function cn(...classes: Array<string | undefined | null | false>): string {
  return classes.filter(Boolean).join(" ");
}

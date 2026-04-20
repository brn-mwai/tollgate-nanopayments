// Delta computation for KPI cards. Compares current-period vs prior-
// period metrics and returns a %-change plus direction. Guards against
// division-by-zero when the prior period has no signal.

export type Delta = {
  current: number;
  previous: number;
  absolute: number;
  pct: number;
  direction: "up" | "down" | "flat";
};

export function delta(current: number, previous: number): Delta {
  const absolute = current - previous;
  let pct = 0;
  if (previous > 0) pct = (absolute / previous) * 100;
  else if (current > 0) pct = 100; // going from 0 to something is +100%
  const direction: Delta["direction"] =
    absolute > 0 ? "up" : absolute < 0 ? "down" : "flat";
  return { current, previous, absolute, pct, direction };
}

// Format as "+12.4%" or "-8.1%" or "0%". Always 1 decimal, with sign.
export function fmtDelta(d: Delta): string {
  const sign = d.direction === "up" ? "+" : d.direction === "down" ? "-" : "";
  return `${sign}${Math.abs(d.pct).toFixed(1)}%`;
}

// Bucket a list of timestamped events into N equal-width buckets ending
// at `now`. Returns [oldest, ..., newest].
export function bucketByTime<T>(
  items: T[],
  getTime: (t: T) => number,
  buckets: number,
  windowMs: number,
  now = Date.now(),
): number[] {
  const bucketSize = windowMs / buckets;
  const windowStart = now - windowMs;
  const counts = new Array(buckets).fill(0);
  for (const item of items) {
    const t = getTime(item);
    if (t < windowStart || t > now) continue;
    const idx = Math.min(buckets - 1, Math.floor((t - windowStart) / bucketSize));
    counts[idx]++;
  }
  return counts;
}

// Same as bucketByTime but sums a numeric field per bucket instead of counting.
export function bucketSumByTime<T>(
  items: T[],
  getTime: (t: T) => number,
  getValue: (t: T) => number,
  buckets: number,
  windowMs: number,
  now = Date.now(),
): number[] {
  const bucketSize = windowMs / buckets;
  const windowStart = now - windowMs;
  const sums = new Array(buckets).fill(0);
  for (const item of items) {
    const t = getTime(item);
    if (t < windowStart || t > now) continue;
    const idx = Math.min(buckets - 1, Math.floor((t - windowStart) / bucketSize));
    sums[idx] += getValue(item);
  }
  return sums;
}

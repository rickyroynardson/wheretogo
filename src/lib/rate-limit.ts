const LIMIT = 5;
const WINDOW_MS = 10 * 60 * 1000;
const hits = new Map<string, { count: number; resetAt: number }>();

// NOTE: in-memory, per server instance; on Vercel each instance has its own
// map, so this only slows abuse. Add a Vercel Firewall rate-limit rule (or
// Upstash Redis) if spam gets through.
export function isRateLimited(key: string, now = Date.now()) {
  if (hits.size > 10_000) hits.clear();

  const entry = hits.get(key);
  if (!entry || now >= entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > LIMIT;
}

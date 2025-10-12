const WINDOW_MS_DEFAULT = 60_000;
const MAX_REQUESTS_DEFAULT = 30;

type RateLimitEntry = {
  count: number;
  expiresAt: number;
};

const buckets = new Map<string, RateLimitEntry>();

export function getRateLimitIdentifier(ip: string | null | undefined, extraKey?: string) {
  const base = ip?.trim() || 'unknown';
  return extraKey ? `${base}:${extraKey}` : base;
}

export function checkRateLimit(
  identifier: string,
  limit: number = MAX_REQUESTS_DEFAULT,
  windowMs: number = WINDOW_MS_DEFAULT,
): { allowed: boolean; remaining: number; retryAfter?: number } {
  const now = Date.now();
  const current = buckets.get(identifier);

  if (!current || current.expiresAt <= now) {
    buckets.set(identifier, { count: 1, expiresAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (current.count >= limit) {
    const retryAfter = Math.max(0, current.expiresAt - now);
    return { allowed: false, remaining: 0, retryAfter };
  }

  current.count += 1;
  buckets.set(identifier, current);
  return { allowed: true, remaining: Math.max(0, limit - current.count) };
}

/**
 * Simple sliding-window rate limiter (in-memory).
 * Good for single-node / soft protection. On multi-instance serverless each
 * instance has its own map — still slows casual abuse; use Redis/Upstash later
 * for hard global limits.
 */

type Bucket = {
  timestamps: number[];
};

const store = new Map<string, Bucket>();

export type RateLimitResult =
  | { ok: true; remaining: number; resetAt: number }
  | { ok: false; remaining: 0; resetAt: number; retryAfterSec: number };

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const bucket = store.get(key) ?? { timestamps: [] };
  bucket.timestamps = bucket.timestamps.filter((t) => now - t < windowMs);

  if (bucket.timestamps.length >= limit) {
    const oldest = bucket.timestamps[0] ?? now;
    const resetAt = oldest + windowMs;
    store.set(key, bucket);
    return {
      ok: false,
      remaining: 0,
      resetAt,
      retryAfterSec: Math.max(1, Math.ceil((resetAt - now) / 1000)),
    };
  }

  bucket.timestamps.push(now);
  store.set(key, bucket);

  // Occasional cleanup so the map does not grow forever
  if (store.size > 5_000) {
    for (const [k, b] of store) {
      b.timestamps = b.timestamps.filter((t) => now - t < windowMs);
      if (b.timestamps.length === 0) store.delete(k);
    }
  }

  return {
    ok: true,
    remaining: Math.max(0, limit - bucket.timestamps.length),
    resetAt: now + windowMs,
  };
}

export function rateLimitHeaders(result: RateLimitResult, limit: number) {
  return {
    "X-RateLimit-Limit": String(limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
    ...(result.ok
      ? {}
      : { "Retry-After": String(result.retryAfterSec) }),
  };
}

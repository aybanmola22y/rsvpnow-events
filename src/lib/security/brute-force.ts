/**
 * Failed-login lockout tracker (in-memory).
 * Locks an identity (usually ip:email) after too many failures.
 */

type FailureRecord = {
  count: number;
  firstAt: number;
  lockedUntil: number;
};

const failures = new Map<string, FailureRecord>();

const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

export function getLoginLockout(key: string): { locked: boolean; retryAfterSec: number } {
  const now = Date.now();
  const record = failures.get(key);
  if (!record) return { locked: false, retryAfterSec: 0 };

  if (record.lockedUntil > now) {
    return {
      locked: true,
      retryAfterSec: Math.max(1, Math.ceil((record.lockedUntil - now) / 1000)),
    };
  }

  if (now - record.firstAt > WINDOW_MS) {
    failures.delete(key);
    return { locked: false, retryAfterSec: 0 };
  }

  return { locked: false, retryAfterSec: 0 };
}

export function recordLoginFailure(key: string): { locked: boolean; retryAfterSec: number; attemptsLeft: number } {
  const now = Date.now();
  let record = failures.get(key);

  if (!record || now - record.firstAt > WINDOW_MS) {
    record = { count: 0, firstAt: now, lockedUntil: 0 };
  }

  if (record.lockedUntil > now) {
    return {
      locked: true,
      retryAfterSec: Math.max(1, Math.ceil((record.lockedUntil - now) / 1000)),
      attemptsLeft: 0,
    };
  }

  record.count += 1;

  if (record.count >= MAX_FAILURES) {
    record.lockedUntil = now + LOCKOUT_MS;
    failures.set(key, record);
    return { locked: true, retryAfterSec: Math.ceil(LOCKOUT_MS / 1000), attemptsLeft: 0 };
  }

  failures.set(key, record);
  return {
    locked: false,
    retryAfterSec: 0,
    attemptsLeft: Math.max(0, MAX_FAILURES - record.count),
  };
}

export function clearLoginFailures(key: string) {
  failures.delete(key);
}

export const BRUTE_FORCE = {
  maxFailures: MAX_FAILURES,
  windowMs: WINDOW_MS,
  lockoutMs: LOCKOUT_MS,
} as const;

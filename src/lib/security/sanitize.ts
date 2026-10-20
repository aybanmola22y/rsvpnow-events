/**
 * Defense-in-depth for user text before it hits Supabase.
 * Supabase/PostgREST already uses parameterized queries (no classic SQLi),
 * but we still reject control abuse and cap length.
 */

const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

/** Patterns that look like SQL injection probes in free text. */
const SQL_PROBE =
  /(\b(union\s+select|select\s+.+\s+from|insert\s+into|drop\s+table|delete\s+from|update\s+\w+\s+set|alter\s+table|exec\s*\(|execute\s*\(|xp_cmdshell)\b)|(--\s)|(\/\*[\s\S]*?\*\/)|(;\s*(drop|delete|update|insert)\b)/i;

export function sanitizeText(value: string, maxLength: number): string {
  return value.replace(CONTROL_CHARS, "").trim().slice(0, maxLength);
}

export function looksLikeSqlInjection(value: string): boolean {
  if (!value) return false;
  return SQL_PROBE.test(value);
}

export function assertSafeText(value: string, fieldLabel: string): string {
  const cleaned = sanitizeText(value, 5000);
  if (looksLikeSqlInjection(cleaned)) {
    throw new Error(`Invalid characters in ${fieldLabel}.`);
  }
  return cleaned;
}

export const safeString = (max: number) =>
  (value: string) => sanitizeText(value, max);

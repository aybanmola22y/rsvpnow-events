import { getTurnstileSecretKey, shouldVerifyTurnstile } from "@/lib/turnstile/env";

type SiteverifyResponse = {
  success: boolean;
  "error-codes"?: string[];
  challenge_ts?: string;
  hostname?: string;
  action?: string;
  cdata?: string;
};

/**
 * Validates a Turnstile token with Cloudflare Siteverify.
 * Returns { ok: true } when Turnstile secret is not configured (opt-in).
 */
export async function verifyTurnstileToken(
  token: string | undefined | null,
  remoteIp?: string | null,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!shouldVerifyTurnstile()) {
    return { ok: true };
  }

  if (!token?.trim()) {
    return { ok: false, error: "Please complete the security check." };
  }

  const body = new URLSearchParams();
  body.set("secret", getTurnstileSecretKey());
  body.set("response", token.trim());
  if (remoteIp) body.set("remoteip", remoteIp);

  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    const result = (await response.json()) as SiteverifyResponse;
    if (!result.success) {
      const codes = result["error-codes"]?.join(", ") || "verification failed";
      return { ok: false, error: `Security check failed (${codes}). Please try again.` };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not verify the security check. Please try again." };
  }
}

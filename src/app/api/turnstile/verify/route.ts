import { NextResponse } from "next/server";
import { z } from "zod";
import { getClientIp } from "@/lib/security/request-ip";
import { rateLimit, rateLimitHeaders } from "@/lib/security/rate-limit";
import { sanitizeText } from "@/lib/security/sanitize";
import { shouldVerifyTurnstile } from "@/lib/turnstile/env";
import { verifyTurnstileToken } from "@/lib/turnstile/verify";

const LIMIT = 20;
const WINDOW_MS = 15 * 60 * 1000;

const bodySchema = z.object({
  token: z.string().min(1).max(2048),
});

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limited = rateLimit(`turnstile:${ip}`, LIMIT, WINDOW_MS);
  const limitHeaders = rateLimitHeaders(limited, LIMIT);

  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many security checks. Please wait and try again." },
      { status: 429, headers: limitHeaders },
    );
  }

  if (!shouldVerifyTurnstile()) {
    return NextResponse.json({ ok: true, skipped: true }, { headers: limitHeaders });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400, headers: limitHeaders });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Missing Turnstile token." }, { status: 400, headers: limitHeaders });
  }

  const token = sanitizeText(parsed.data.token, 2048);
  const check = await verifyTurnstileToken(token, ip);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: 403, headers: limitHeaders });
  }

  return NextResponse.json({ ok: true }, { headers: limitHeaders });
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { shouldVerifyTurnstile } from "@/lib/turnstile/env";
import { verifyTurnstileToken } from "@/lib/turnstile/verify";

const bodySchema = z.object({
  token: z.string().min(1, "Missing Turnstile token"),
});

export async function POST(request: Request) {
  if (!shouldVerifyTurnstile()) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Missing Turnstile token." }, { status: 400 });
  }

  const ip =
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    null;

  const check = await verifyTurnstileToken(parsed.data.token, ip);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: 403 });
  }

  return NextResponse.json({ ok: true });
}

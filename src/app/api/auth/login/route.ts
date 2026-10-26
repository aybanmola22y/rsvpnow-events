import { NextResponse } from "next/server";
import { z } from "zod";
import { getStaffCredentials, verifyDemoStaff } from "@/lib/auth/demo-credentials";
import { STAFF_AUTH_COOKIE } from "@/lib/auth/constants";
import {
  clearLoginFailures,
  getLoginLockout,
  recordLoginFailure,
} from "@/lib/security/brute-force";
import { getClientIp } from "@/lib/security/request-ip";
import { rateLimit, rateLimitHeaders } from "@/lib/security/rate-limit";
import { sanitizeText } from "@/lib/security/sanitize";

const IP_LIMIT = 20;
const IP_WINDOW_MS = 15 * 60 * 1000;

const bodySchema = z.object({
  email: z.email().max(254),
  password: z.string().min(1).max(200),
});

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limited = rateLimit(`login-ip:${ip}`, IP_LIMIT, IP_WINDOW_MS);
  const limitHeaders = rateLimitHeaders(limited, IP_LIMIT);

  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many sign-in attempts from this network. Try again later." },
      { status: 429, headers: limitHeaders },
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400, headers: limitHeaders });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email and password." }, { status: 400, headers: limitHeaders });
  }

  const email = sanitizeText(parsed.data.email, 254).toLowerCase();
  const password = parsed.data.password;
  const lockKey = `login:${ip}:${email}`;

  const lock = getLoginLockout(lockKey);
  if (lock.locked) {
    return NextResponse.json(
      {
        error: `Account temporarily locked after too many failed attempts. Try again in ${lock.retryAfterSec}s.`,
      },
      {
        status: 429,
        headers: { ...limitHeaders, "Retry-After": String(lock.retryAfterSec) },
      },
    );
  }

  // Constant-ish response timing to reduce password-oracle timing leaks
  const started = Date.now();
  const ok = verifyDemoStaff(email, password);
  const elapsed = Date.now() - started;
  if (elapsed < 400) await delay(400 - elapsed);

  if (!ok) {
    const failure = recordLoginFailure(lockKey);
    if (failure.locked) {
      return NextResponse.json(
        {
          error: `Too many failed sign-ins. Locked for ${failure.retryAfterSec} seconds.`,
        },
        {
          status: 429,
          headers: { ...limitHeaders, "Retry-After": String(failure.retryAfterSec) },
        },
      );
    }
    return NextResponse.json(
      {
        error: "Invalid email or password.",
        attemptsLeft: failure.attemptsLeft,
      },
      { status: 401, headers: limitHeaders },
    );
  }

  clearLoginFailures(lockKey);

  const staff = getStaffCredentials();
  if (!staff.password) {
    return NextResponse.json(
      { error: "Staff login is not configured. Set STAFF_PASSWORD in the server environment." },
      { status: 503, headers: limitHeaders },
    );
  }

  const session = {
    email: staff.email,
    name: staff.name,
    role: staff.role,
  };

  const response = NextResponse.json({ ok: true, session }, { status: 200, headers: limitHeaders });
  response.cookies.set(STAFF_AUTH_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}

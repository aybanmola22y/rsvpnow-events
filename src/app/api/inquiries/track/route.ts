import { NextResponse } from "next/server";
import { z } from "zod";
import { getClientIp } from "@/lib/security/request-ip";
import { rateLimit, rateLimitHeaders } from "@/lib/security/rate-limit";
import { sanitizeText } from "@/lib/security/sanitize";
import { getSupabaseServiceRoleKey, isSupabaseEnabled } from "@/lib/supabase/env";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { trackStatusLabel } from "@/lib/inquiry-track";

const LIMIT = 20;
const WINDOW_MS = 15 * 60 * 1000;

const bodySchema = z.object({
  number: z.string().min(3).max(40),
  email: z.email().max(254),
});

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limited = rateLimit(`track:${ip}`, LIMIT, WINDOW_MS);
  const limitHeaders = rateLimitHeaders(limited, LIMIT);

  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many lookups. Please try again later." },
      { status: 429, headers: limitHeaders },
    );
  }

  if (!isSupabaseEnabled() || !getSupabaseServiceRoleKey()) {
    return NextResponse.json(
      { error: "Tracking is not available right now." },
      { status: 503, headers: limitHeaders },
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
    return NextResponse.json(
      { error: "Enter a valid reference number and email." },
      { status: 400, headers: limitHeaders },
    );
  }

  const number = sanitizeText(parsed.data.number, 40).toUpperCase();
  const email = sanitizeText(parsed.data.email, 254).toLowerCase();

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("inquiries")
    .select(
      "id, number, full_name, email, event_type, event_date, guest_count, status, created_at",
    )
    .eq("number", number)
    .ilike("email", email)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: "Could not look up this request." },
      { status: 500, headers: limitHeaders },
    );
  }

  if (!data) {
    return NextResponse.json(
      { error: "No request found for that reference and email." },
      { status: 404, headers: limitHeaders },
    );
  }

  return NextResponse.json(
    {
      id: data.id,
      number: data.number,
      fullName: data.full_name,
      email: data.email,
      eventType: data.event_type,
      eventDate: data.event_date ?? "",
      guestCount: data.guest_count,
      status: data.status,
      statusLabel: trackStatusLabel(data.status),
      createdAt: data.created_at,
    },
    { status: 200, headers: limitHeaders },
  );
}

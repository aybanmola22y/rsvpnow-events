import { NextResponse } from "next/server";
import { z } from "zod";
import { getClientIp } from "@/lib/security/request-ip";
import { rateLimit, rateLimitHeaders } from "@/lib/security/rate-limit";
import { assertSafeText, sanitizeText } from "@/lib/security/sanitize";
import { getSupabaseServiceRoleKey, isSupabaseEnabled } from "@/lib/supabase/env";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";

const LIMIT = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

const bodySchema = z.object({
  fullName: z.string().min(2).max(120),
  company: z.string().min(1).max(160),
  email: z.email().max(254),
  phone: z.string().min(7).max(40),
  eventType: z.string().min(1).max(120),
  eventDate: z.string().min(1).max(32),
  startTime: z.string().min(1).max(16),
  endTime: z.string().min(1).max(16),
  guestCount: z.number().int().positive().max(100_000),
  venuePreference: z.string().min(1).max(120),
  venueName: z.string().max(200),
  venueAddress: z.string().max(400),
  packageId: z.string().max(80),
  serviceIds: z.array(z.string().max(80)).max(50),
  budget: z.number().positive().max(100_000_000),
  theme: z.string().max(200),
  specialRequests: z.string().max(4000),
  source: z.enum(["website", "builder", "admin"]),
});

export async function POST(request: Request) {
  if (!isSupabaseEnabled()) {
    return NextResponse.json(
      { error: "Supabase is not enabled. Set NEXT_PUBLIC_USE_SUPABASE=true after running the schema." },
      { status: 503 },
    );
  }

  const ip = getClientIp(request);
  const limited = rateLimit(`inquiries:${ip}`, LIMIT, WINDOW_MS);
  const limitHeaders = rateLimitHeaders(limited, LIMIT);

  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
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
    return NextResponse.json(
      { error: "Invalid inquiry payload.", details: parsed.error.flatten() },
      { status: 400, headers: limitHeaders },
    );
  }

  let input: z.infer<typeof bodySchema>;
  try {
    const raw = parsed.data;
    input = {
      ...raw,
      fullName: assertSafeText(raw.fullName, "full name"),
      company: assertSafeText(raw.company, "company"),
      email: sanitizeText(raw.email, 254),
      phone: sanitizeText(raw.phone, 40),
      eventType: assertSafeText(raw.eventType, "event type"),
      eventDate: sanitizeText(raw.eventDate, 32),
      startTime: sanitizeText(raw.startTime, 16),
      endTime: sanitizeText(raw.endTime, 16),
      venuePreference: sanitizeText(raw.venuePreference, 120),
      venueName: assertSafeText(raw.venueName || "", "venue name"),
      venueAddress: assertSafeText(raw.venueAddress || "", "venue address"),
      packageId: sanitizeText(raw.packageId || "", 80),
      serviceIds: raw.serviceIds.map((id) => sanitizeText(id, 80)),
      theme: assertSafeText(raw.theme || "", "theme"),
      specialRequests: assertSafeText(raw.specialRequests || "", "special requests"),
      guestCount: raw.guestCount,
      budget: raw.budget,
      source: raw.source,
    };
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid input." },
      { status: 400, headers: limitHeaders },
    );
  }

  const supabase = getSupabaseServiceRoleKey()
    ? createSupabaseAdminClient()
    : await createSupabaseServerClient();

  // Parameterized insert via Supabase client — never concatenate SQL strings.
  const { data, error } = await supabase
    .from("inquiries")
    .insert({
      full_name: input.fullName,
      company: input.company,
      email: input.email,
      phone: input.phone,
      event_type: input.eventType,
      event_date: input.eventDate || null,
      start_time: input.startTime || null,
      end_time: input.endTime || null,
      guest_count: input.guestCount,
      venue_preference: input.venuePreference,
      venue_name: input.venueName,
      venue_address: input.venueAddress,
      package_id: input.packageId || null,
      service_ids: input.serviceIds,
      budget: input.budget,
      theme: input.theme,
      special_requests: input.specialRequests,
      source: input.source,
      status: "NEW",
    })
    .select("id, number")
    .single();

  if (error) {
    return NextResponse.json({ error: "Could not save the inquiry." }, { status: 500, headers: limitHeaders });
  }

  return NextResponse.json({ id: data.id, number: data.number }, { status: 201, headers: limitHeaders });
}

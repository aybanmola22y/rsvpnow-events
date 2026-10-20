import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServiceRoleKey, isSupabaseEnabled } from "@/lib/supabase/env";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";

const bodySchema = z.object({
  fullName: z.string().min(2),
  company: z.string().min(1),
  email: z.email(),
  phone: z.string().min(7),
  eventType: z.string().min(1),
  eventDate: z.string().min(1),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  guestCount: z.number().int().positive(),
  venuePreference: z.string().min(1),
  venueName: z.string(),
  venueAddress: z.string(),
  packageId: z.string(),
  serviceIds: z.array(z.string()),
  budget: z.number().positive(),
  theme: z.string(),
  specialRequests: z.string(),
  source: z.enum(["website", "builder", "admin"]),
});

export async function POST(request: Request) {
  if (!isSupabaseEnabled()) {
    return NextResponse.json(
      { error: "Supabase is not enabled. Set NEXT_PUBLIC_USE_SUPABASE=true after running the schema." },
      { status: 503 },
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid inquiry payload.", details: parsed.error.flatten() }, { status: 400 });
  }

  const input = parsed.data;
  // Prefer service role on the server so public form posts are not blocked by anon RLS.
  const supabase = getSupabaseServiceRoleKey()
    ? createSupabaseAdminClient()
    : await createSupabaseServerClient();

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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: data.id, number: data.number }, { status: 201 });
}

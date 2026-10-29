import type { Inquiry, InquiryInput } from "@/lib/types";
import { isSupabaseEnabled } from "@/lib/supabase/env";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export type RemoteInquiryResult = {
  id: string;
  number: string;
};

export function mapInquiryRow(row: {
  id: string;
  number: string;
  full_name: string;
  company: string;
  email: string;
  phone: string;
  event_type: string;
  event_date: string | null;
  start_time: string | null;
  end_time: string | null;
  guest_count: number;
  venue_preference: string;
  venue_name: string;
  venue_address: string;
  package_id: string | null;
  service_ids: string[];
  budget: number;
  theme: string;
  special_requests: string;
  status: string;
  assigned_staff: string;
  source: string;
  created_at: string;
}): Inquiry {
  return {
    id: row.id,
    number: row.number,
    fullName: row.full_name,
    company: row.company,
    email: row.email,
    phone: row.phone,
    eventType: row.event_type,
    eventDate: row.event_date ?? "",
    startTime: row.start_time ?? "",
    endTime: row.end_time ?? "",
    guestCount: row.guest_count,
    venuePreference: row.venue_preference,
    venueName: row.venue_name,
    venueAddress: row.venue_address,
    packageId: row.package_id ?? "",
    serviceIds: row.service_ids ?? [],
    budget: Number(row.budget),
    theme: row.theme,
    specialRequests: row.special_requests,
    status: row.status as Inquiry["status"],
    assignedStaff: row.assigned_staff,
    source: row.source as Inquiry["source"],
    createdAt: row.created_at,
  };
}

/** Insert an inquiry into Supabase (browser / anon). Returns null if Supabase is off. */
export async function submitInquiryRemote(input: InquiryInput): Promise<RemoteInquiryResult | null> {
  if (!isSupabaseEnabled()) return null;

  const supabase = createSupabaseBrowserClient();
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
    throw new Error(error.message);
  }

  return { id: data.id, number: data.number };
}

export async function listInquiriesRemote(): Promise<Inquiry[] | null> {
  if (!isSupabaseEnabled()) return null;

  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("inquiries")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapInquiryRow);
}

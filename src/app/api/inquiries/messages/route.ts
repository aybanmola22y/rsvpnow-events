import { NextResponse } from "next/server";
import { z } from "zod";
import { requireStaffApi } from "@/lib/auth/staff-api";
import {
  notifyCustomerOfStaffReply,
  notifyStaffOfCustomerReply,
} from "@/lib/email/chat-emails";
import { getClientIp } from "@/lib/security/request-ip";
import { rateLimit, rateLimitHeaders } from "@/lib/security/rate-limit";
import { assertSafeText, sanitizeText } from "@/lib/security/sanitize";
import { getSupabaseServiceRoleKey, isSupabaseEnabled } from "@/lib/supabase/env";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

const GET_LIMIT = 120;
const POST_LIMIT = 40;
const WINDOW_MS = 15 * 60 * 1000;

type MessageRow = {
  id: string;
  inquiry_id: string;
  sender: "customer" | "staff";
  sender_name: string;
  body: string;
  created_at: string;
};

function mapMessage(row: MessageRow) {
  return {
    id: row.id,
    inquiryId: row.inquiry_id,
    sender: row.sender,
    senderName: row.sender_name,
    body: row.body,
    createdAt: row.created_at,
  };
}

async function resolveInquiryByCustomer(number: string, email: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("inquiries")
    .select("id, number, full_name, email")
    .eq("number", number)
    .ilike("email", email)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

async function resolveInquiryById(id: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("inquiries")
    .select("id, number, full_name, email")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function GET(request: Request) {
  const ip = getClientIp(request);
  const limited = rateLimit(`chat-get:${ip}`, GET_LIMIT, WINDOW_MS);
  const limitHeaders = rateLimitHeaders(limited, GET_LIMIT);
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429, headers: limitHeaders });
  }

  if (!isSupabaseEnabled() || !getSupabaseServiceRoleKey()) {
    return NextResponse.json({ error: "Chat is not available." }, { status: 503, headers: limitHeaders });
  }

  const url = new URL(request.url);
  const inquiryId = url.searchParams.get("inquiryId")?.trim() ?? "";
  const number = sanitizeText(url.searchParams.get("number") ?? "", 40).toUpperCase();
  const email = sanitizeText(url.searchParams.get("email") ?? "", 254).toLowerCase();

  let inquiry: Awaited<ReturnType<typeof resolveInquiryById>> = null;

  try {
    if (inquiryId) {
      if (!(await requireStaffApi())) {
        return NextResponse.json({ error: "Unauthorized." }, { status: 401, headers: limitHeaders });
      }
      inquiry = await resolveInquiryById(inquiryId);
    } else if (number && email) {
      inquiry = await resolveInquiryByCustomer(number, email);
    } else {
      return NextResponse.json(
        { error: "Provide inquiryId (staff) or number + email (customer)." },
        { status: 400, headers: limitHeaders },
      );
    }
  } catch {
    return NextResponse.json({ error: "Could not load messages." }, { status: 500, headers: limitHeaders });
  }

  if (!inquiry) {
    return NextResponse.json({ error: "Inquiry not found." }, { status: 404, headers: limitHeaders });
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("inquiry_messages")
    .select("id, inquiry_id, sender, sender_name, body, created_at")
    .eq("inquiry_id", inquiry.id)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: "Could not load messages." }, { status: 500, headers: limitHeaders });
  }

  return NextResponse.json(
    { messages: (data ?? []).map((row) => mapMessage(row as MessageRow)) },
    { status: 200, headers: limitHeaders },
  );
}

const postSchema = z.discriminatedUnion("as", [
  z.object({
    as: z.literal("customer"),
    number: z.string().min(3).max(40),
    email: z.email().max(254),
    body: z.string().min(1).max(4000),
  }),
  z.object({
    as: z.literal("staff"),
    inquiryId: z.string().uuid(),
    body: z.string().min(1).max(4000),
    senderName: z.string().max(120).optional(),
  }),
]);

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limited = rateLimit(`chat-post:${ip}`, POST_LIMIT, WINDOW_MS);
  const limitHeaders = rateLimitHeaders(limited, POST_LIMIT);
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many messages. Try again later." }, { status: 429, headers: limitHeaders });
  }

  if (!isSupabaseEnabled() || !getSupabaseServiceRoleKey()) {
    return NextResponse.json({ error: "Chat is not available." }, { status: 503, headers: limitHeaders });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400, headers: limitHeaders });
  }

  const parsed = postSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid message." }, { status: 400, headers: limitHeaders });
  }

  let inquiry: Awaited<ReturnType<typeof resolveInquiryById>> = null;
  let sender: "customer" | "staff" = "customer";
  let senderName = "";
  let body = "";

  try {
    if (parsed.data.as === "staff") {
      if (!(await requireStaffApi())) {
        return NextResponse.json({ error: "Unauthorized." }, { status: 401, headers: limitHeaders });
      }
      inquiry = await resolveInquiryById(parsed.data.inquiryId);
      sender = "staff";
      senderName = sanitizeText(parsed.data.senderName || "RSVPNow", 120);
      body = assertSafeText(parsed.data.body, "message");
    } else {
      const number = sanitizeText(parsed.data.number, 40).toUpperCase();
      const email = sanitizeText(parsed.data.email, 254).toLowerCase();
      inquiry = await resolveInquiryByCustomer(number, email);
      sender = "customer";
      senderName = inquiry?.full_name || "Customer";
      body = assertSafeText(parsed.data.body, "message");
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not send message." },
      { status: 400, headers: limitHeaders },
    );
  }

  if (!inquiry) {
    return NextResponse.json({ error: "Inquiry not found." }, { status: 404, headers: limitHeaders });
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("inquiry_messages")
    .insert({
      inquiry_id: inquiry.id,
      sender,
      sender_name: senderName,
      body,
    })
    .select("id, inquiry_id, sender, sender_name, body, created_at")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Could not save the message. Run supabase/inquiry-messages.sql if the table is missing." },
      { status: 500, headers: limitHeaders },
    );
  }

  if (sender === "staff") {
    void notifyCustomerOfStaffReply({
      number: inquiry.number,
      fullName: inquiry.full_name,
      email: inquiry.email,
      preview: body,
    }).catch(() => undefined);
  } else {
    void notifyStaffOfCustomerReply({
      number: inquiry.number,
      fullName: inquiry.full_name,
      preview: body,
      inquiryId: inquiry.id,
    }).catch(() => undefined);
  }

  return NextResponse.json({ message: mapMessage(data as MessageRow) }, { status: 201, headers: limitHeaders });
}

import { getStaffNotifyEmail } from "@/lib/email/env";
import { sendEmail } from "@/lib/email/resend";
import { absoluteUrl } from "@/lib/seo";

export type InquiryEmailPayload = {
  number: string;
  fullName: string;
  email: string;
  phone: string;
  company: string;
  eventType: string;
  eventDate: string;
  guestCount: number;
  status?: string;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function trackUrl(number: string, email: string) {
  const url = new URL(absoluteUrl("/track"));
  url.searchParams.set("ref", number);
  url.searchParams.set("email", email);
  return url.toString();
}

export async function sendInquiryReceivedEmails(payload: InquiryEmailPayload) {
  const track = trackUrl(payload.number, payload.email);
  const safeName = escapeHtml(payload.fullName);
  const safeNumber = escapeHtml(payload.number);

  const customerHtml = `
    <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#1a1a1a">
      <p style="letter-spacing:0.16em;text-transform:uppercase;font-size:11px;color:#888">RSVPNow</p>
      <h1 style="font-size:28px;line-height:1.2;margin:12px 0 16px">We received your quotation request</h1>
      <p style="font-size:16px;line-height:1.6">Hi ${safeName},</p>
      <p style="font-size:16px;line-height:1.6">
        Thank you for contacting RSVPNow. Your request is with our team.
        Your reference number is <strong>${safeNumber}</strong>.
      </p>
      <p style="font-size:16px;line-height:1.6">
        Track progress any time:<br/>
        <a href="${track}" style="color:#111">${track}</a>
      </p>
      <p style="font-size:14px;line-height:1.6;color:#666">
        Event: ${escapeHtml(payload.eventType || "—")}<br/>
        Date: ${escapeHtml(payload.eventDate || "TBC")}<br/>
        Guests: ${payload.guestCount || "—"}
      </p>
      <p style="font-size:16px;line-height:1.6">— RSVPNow Events</p>
    </div>
  `;

  const customerText = [
    `Hi ${payload.fullName},`,
    ``,
    `We received your quotation request. Reference: ${payload.number}`,
    `Track progress: ${track}`,
    ``,
    `Event: ${payload.eventType || "—"}`,
    `Date: ${payload.eventDate || "TBC"}`,
    `Guests: ${payload.guestCount || "—"}`,
    ``,
    `— RSVPNow Events`,
  ].join("\n");

  const staffHtml = `
    <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a">
      <h1 style="font-size:22px">New quotation request · ${safeNumber}</h1>
      <p><strong>${safeName}</strong> (${escapeHtml(payload.company || "—")})</p>
      <p>
        ${escapeHtml(payload.email)} · ${escapeHtml(payload.phone || "—")}<br/>
        ${escapeHtml(payload.eventType || "—")} · ${escapeHtml(payload.eventDate || "TBC")} · ${payload.guestCount} guests
      </p>
      <p><a href="${absoluteUrl("/admin/inquiries")}">Open inquiries in studio</a></p>
    </div>
  `;

  const staffText = [
    `New quotation request ${payload.number}`,
    `${payload.fullName} (${payload.company || "—"})`,
    `${payload.email} · ${payload.phone || "—"}`,
    `${payload.eventType || "—"} · ${payload.eventDate || "TBC"} · ${payload.guestCount} guests`,
  ].join("\n");

  const [customer, staff] = await Promise.all([
    sendEmail({
      to: payload.email,
      subject: `We received your request · ${payload.number}`,
      html: customerHtml,
      text: customerText,
    }),
    sendEmail({
      to: getStaffNotifyEmail(),
      subject: `New inquiry ${payload.number} · ${payload.fullName}`,
      html: staffHtml,
      text: staffText,
    }),
  ]);

  return { customer, staff };
}

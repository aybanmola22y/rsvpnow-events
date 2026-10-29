import { getStaffNotifyEmail } from "@/lib/email/env";
import { sendEmail } from "@/lib/email/resend";
import { absoluteUrl } from "@/lib/seo";

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

export async function notifyCustomerOfStaffReply(input: {
  number: string;
  fullName: string;
  email: string;
  preview: string;
}) {
  const track = trackUrl(input.number, input.email);
  const preview = escapeHtml(input.preview.slice(0, 280));
  return sendEmail({
    to: input.email,
    subject: `New reply on ${input.number}`,
    html: `
      <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#1a1a1a">
        <p style="letter-spacing:0.16em;text-transform:uppercase;font-size:11px;color:#888">RSVPNow</p>
        <h1 style="font-size:24px;margin:12px 0 16px">RSVPNow replied to your quotation</h1>
        <p>Hi ${escapeHtml(input.fullName)},</p>
        <p style="padding:12px 14px;background:#f5f5f5;border-left:3px solid #111">${preview}</p>
        <p><a href="${track}">Open the conversation</a></p>
      </div>
    `,
    text: [
      `Hi ${input.fullName},`,
      ``,
      `RSVPNow replied on ${input.number}:`,
      input.preview.slice(0, 280),
      ``,
      `Open: ${track}`,
    ].join("\n"),
  });
}

export async function notifyStaffOfCustomerReply(input: {
  number: string;
  fullName: string;
  preview: string;
  inquiryId: string;
}) {
  const preview = escapeHtml(input.preview.slice(0, 280));
  const adminUrl = absoluteUrl(`/admin/inquiries/${input.inquiryId}`);
  return sendEmail({
    to: getStaffNotifyEmail(),
    subject: `Customer message on ${input.number}`,
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a">
        <h1 style="font-size:20px">${escapeHtml(input.fullName)} replied · ${escapeHtml(input.number)}</h1>
        <p style="padding:12px 14px;background:#f5f5f5;border-left:3px solid #111">${preview}</p>
        <p><a href="${adminUrl}">Open inquiry in studio</a></p>
      </div>
    `,
    text: [
      `${input.fullName} replied on ${input.number}:`,
      input.preview.slice(0, 280),
      ``,
      adminUrl,
    ].join("\n"),
  });
}

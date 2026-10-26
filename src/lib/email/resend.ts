import { Resend } from "resend";
import { getEmailFrom, getResendApiKey, isEmailConfigured } from "@/lib/email/env";

export type SendEmailInput = {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
};

/**
 * Sends email via Resend when RESEND_API_KEY is set.
 * Returns { skipped: true } in local/demo without a key so submits still succeed.
 */
export async function sendEmail(input: SendEmailInput): Promise<
  | { ok: true; id?: string; skipped?: boolean }
  | { ok: false; error: string }
> {
  if (!isEmailConfigured()) {
    console.info("[email] Skipped (RESEND_API_KEY not set):", input.subject, "→", input.to);
    return { ok: true, skipped: true };
  }

  try {
    const resend = new Resend(getResendApiKey());
    const { data, error } = await resend.emails.send({
      from: getEmailFrom(),
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
    });
    if (error) {
      console.error("[email] Resend error:", error);
      return { ok: false, error: error.message };
    }
    return { ok: true, id: data?.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Email failed";
    console.error("[email] Send failed:", message);
    return { ok: false, error: message };
  }
}

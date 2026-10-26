export function getResendApiKey() {
  return process.env.RESEND_API_KEY?.trim() ?? "";
}

export function getEmailFrom() {
  return (
    process.env.EMAIL_FROM?.trim() ||
    "RSVPNow <onboarding@resend.dev>"
  );
}

export function getStaffNotifyEmail() {
  return (
    process.env.STAFF_NOTIFY_EMAIL?.trim() ||
    process.env.STAFF_EMAIL?.trim() ||
    "rsvpnowevents@novanorthsg.com"
  );
}

export function isEmailConfigured() {
  return Boolean(getResendApiKey());
}

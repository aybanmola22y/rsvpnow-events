/**
 * Staff login credentials (server-only).
 * Set STAFF_EMAIL / STAFF_PASSWORD / STAFF_NAME in .env (and Vercel).
 */
export function getStaffCredentials() {
  const email = (
    process.env.STAFF_EMAIL?.trim() || "rsvpnowevents@novanorthsg.com"
  ).toLowerCase();
  const password = process.env.STAFF_PASSWORD?.trim() || "";
  const name = process.env.STAFF_NAME?.trim() || "RSVPNow Admin";
  const role = "Administrator";
  return { email, password, name, role };
}

export function verifyDemoStaff(email: string, password: string) {
  const staff = getStaffCredentials();
  if (!staff.password) return false;
  const normalized = email.trim().toLowerCase();
  return normalized === staff.email && password === staff.password;
}

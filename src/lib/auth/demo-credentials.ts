/** Server-side demo staff credentials. Do not import password into new client UI. */
export const DEMO_STAFF = {
  email: "admin@eventdemo.com",
  password: "admin123",
  name: "Ava Mendoza",
  role: "Administrator",
} as const;

export function verifyDemoStaff(email: string, password: string) {
  const normalized = email.trim().toLowerCase();
  return (
    normalized === DEMO_STAFF.email &&
    password === DEMO_STAFF.password
  );
}

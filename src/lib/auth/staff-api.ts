import { cookies } from "next/headers";
import { STAFF_AUTH_COOKIE } from "@/lib/auth/constants";

/** Demo staff gate used by admin API routes (httpOnly cookie from /api/auth/login). */
export async function requireStaffApi() {
  const jar = await cookies();
  return jar.get(STAFF_AUTH_COOKIE)?.value === "1";
}

"use client";

import { STAFF_AUTH_COOKIE } from "@/lib/auth/constants";

const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

export function setStaffAuthCookie() {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${STAFF_AUTH_COOKIE}=1; Path=/; Max-Age=${MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
}

export function clearStaffAuthCookie() {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${STAFF_AUTH_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax${secure}`;
}

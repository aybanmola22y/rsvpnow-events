"use client";

import { create } from "zustand";
import { clearStaffAuthCookie, setStaffAuthCookie } from "@/lib/auth/cookie";

const SESSION_KEY = "aurelia-demo-session";

export type DemoSession = {
  email: string;
  name: string;
  role: string;
};

type SessionState = {
  ready: boolean;
  session: DemoSession | null;
  hydrate: () => void;
  /** Apply a session returned from /api/auth/login */
  applySession: (session: DemoSession) => void;
  /** @deprecated Prefer server /api/auth/login — kept for compatibility */
  login: (email: string, password: string) => boolean;
  /** Clears local session + httpOnly cookie. Await before navigating to login. */
  logout: () => Promise<void>;
};

function readSession(): DemoSession | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as DemoSession;
    if (!parsed.email || !parsed.name) return null;
    return parsed;
  } catch {
    return null;
  }
}

function persistSession(session: DemoSession) {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  setStaffAuthCookie();
}

/**
 * Demo session. Password checks go through /api/auth/login (anti-brute-force).
 * Cookie is also set httpOnly by the login API for middleware protection.
 */
export const useSessionStore = create<SessionState>((set) => ({
  ready: false,
  session: null,
  hydrate: () => {
    const session = readSession();
    if (session) setStaffAuthCookie();
    else clearStaffAuthCookie();
    set({ session, ready: true });
  },
  applySession: (session) => {
    persistSession(session);
    set({ session, ready: true });
  },
  login: (email, password) => {
    // Client-side path disabled for brute-force safety — always use API.
    void email;
    void password;
    return false;
  },
  logout: async () => {
    // Clear httpOnly cookie first while UI still has a session, so middleware
    // won't bounce /admin/login → /admin (which hung on "Checking access…").
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
    } catch {
      // Best-effort; still clear local state below.
    }
    window.localStorage.removeItem(SESSION_KEY);
    clearStaffAuthCookie();
    set({ session: null, ready: true });
  },
}));

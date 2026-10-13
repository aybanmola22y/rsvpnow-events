"use client";

import { create } from "zustand";

const SESSION_KEY = "aurelia-demo-session";

export const DEMO_ADMIN = {
  email: "admin@eventdemo.com",
  password: "admin123",
  name: "Ava Mendoza",
  role: "Administrator",
};

export type DemoSession = {
  email: string;
  name: string;
  role: string;
};

type SessionState = {
  ready: boolean;
  session: DemoSession | null;
  hydrate: () => void;
  login: (email: string, password: string) => boolean;
  logout: () => void;
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

/**
 * Demo-only session. Replace this module with a real auth client later.
 * The admin shell reads `session` and does not talk to localStorage itself.
 */
export const useSessionStore = create<SessionState>((set) => ({
  ready: false,
  session: null,
  hydrate: () => set({ session: readSession(), ready: true }),
  login: (email, password) => {
    const matches =
      email.trim().toLowerCase() === DEMO_ADMIN.email && password === DEMO_ADMIN.password;
    if (!matches) return false;
    const session: DemoSession = {
      email: DEMO_ADMIN.email,
      name: DEMO_ADMIN.name,
      role: DEMO_ADMIN.role,
    };
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    set({ session, ready: true });
    return true;
  },
  logout: () => {
    window.localStorage.removeItem(SESSION_KEY);
    set({ session: null, ready: true });
  },
}));

import type { ActivityLog, DemoData } from "@/lib/types";
import { seedSettings, seedUsers } from "@/lib/mock-data/clients";

/** Kept for migrate helpers that still reference activity ids (empty by default). */
export const seedActivity: ActivityLog[] = [];

/**
 * Fresh workspace data — no sample inquiries, bookings, venues, etc.
 * Keeps real company settings and the staff login user.
 */
export function createSeedData(): DemoData {
  return structuredClone({
    venues: [],
    packages: [],
    services: [],
    inquiries: [],
    proposals: [],
    bookings: [],
    payments: [],
    clients: [],
    testimonials: [],
    gallery: [],
    settings: seedSettings,
    users: seedUsers.filter((user) => user.role === "Administrator"),
    activity: [],
    messages: [],
  });
}

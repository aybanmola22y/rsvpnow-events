import type { ActivityLog, DemoData } from "@/lib/types";
import { seedSettings, seedUsers } from "@/lib/mock-data/clients";
import { seedServices } from "@/lib/mock-data/services";

/** Kept for migrate helpers that still reference activity ids (empty by default). */
export const seedActivity: ActivityLog[] = [];

/**
 * Fresh workspace data — no sample inquiries, bookings, venues, etc.
 * Keeps catalogue services, real company settings, and the staff login user.
 */
export function createSeedData(): DemoData {
  return structuredClone({
    venues: [],
    packages: [],
    services: seedServices,
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

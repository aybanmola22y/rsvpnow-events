import type { ActivityLog, DemoData, PaymentStatus } from "@/lib/types";
import { seedBookings, seedPayments } from "@/lib/mock-data/bookings";
import { seedClients, seedSettings, seedTestimonials, seedUsers } from "@/lib/mock-data/clients";
import { seedGallery } from "@/lib/mock-data/gallery";
import { seedInquiries } from "@/lib/mock-data/inquiries";
import { seedPackages } from "@/lib/mock-data/packages";
import { seedProposals } from "@/lib/mock-data/proposals";
import { seedServices } from "@/lib/mock-data/services";
import { seedVenues } from "@/lib/mock-data/venues";

export const seedActivity: ActivityLog[] = [
  { id: "log-1", action: "Recorded the Reyes wedding deposit.", actor: "Liza Cruz", createdAt: "2026-06-02T03:00:00.000Z", entityType: "booking", entityId: "bk-1" },
  { id: "log-2", action: "Sent the Tan Holdings proposal.", actor: "Liza Cruz", createdAt: "2026-09-14T04:00:00.000Z", entityType: "proposal", entityId: "pro-2" },
  { id: "log-3", action: "Approved the Northwind conference quotation.", actor: "Ava Mendoza", createdAt: "2026-10-01T02:30:00.000Z", entityType: "proposal", entityId: "pro-4" },
  { id: "log-4", action: "Archived the Harbor Seminars inquiry.", actor: "Marco Santos", createdAt: "2026-08-09T06:00:00.000Z", entityType: "inquiry", entityId: "inq-14" },
  { id: "log-5", action: "Marked the Lim Atelier seminar completed.", actor: "Marco Santos", createdAt: "2026-09-18T09:00:00.000Z", entityType: "booking", entityId: "bk-7" },
  { id: "log-6", action: "Revised the Dizon Group launch quotation.", actor: "Ava Mendoza", createdAt: "2026-10-03T05:10:00.000Z", entityType: "proposal", entityId: "pro-8" },
  { id: "log-7", action: "Published a new garden reception photograph.", actor: "Ava Mendoza", createdAt: "2026-09-22T01:00:00.000Z", entityType: "gallery", entityId: "gal-2" },
  { id: "log-8", action: "Received a new wedding inquiry from Hannah Co.", actor: "Website", createdAt: "2026-10-08T10:12:00.000Z", entityType: "inquiry", entityId: "inq-11" },
];

function paymentStatusFor(paid: number, total: number): PaymentStatus {
  if (paid <= 0) return "Unpaid";
  if (paid >= total) return "Paid";
  return "Partial";
}

export function createSeedData(): DemoData {
  const bookings = seedBookings.map((booking) => {
    const paid = seedPayments
      .filter((payment) => payment.bookingId === booking.id && payment.status === "Completed")
      .reduce((sum, payment) => sum + payment.amount, 0);
    return {
      ...booking,
      paid,
      paymentStatus: paymentStatusFor(paid, booking.total),
    };
  });

  return structuredClone({
    venues: seedVenues,
    packages: seedPackages,
    services: seedServices,
    inquiries: seedInquiries,
    proposals: seedProposals,
    bookings,
    payments: seedPayments,
    clients: seedClients,
    testimonials: seedTestimonials,
    gallery: seedGallery,
    settings: seedSettings,
    users: seedUsers,
    activity: seedActivity,
    messages: [],
  });
}

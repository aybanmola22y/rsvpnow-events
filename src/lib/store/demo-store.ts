"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { hoursBetween, nextCode, packagePrice, uid, uniqueSlug } from "@/lib/format";
import { quoteTotals } from "@/lib/pricing";
import { createSeedData } from "@/lib/mock-data/seed";
import type {
  ActivityLog,
  Booking,
  BookingStatus,
  Client,
  ContactMessage,
  DemoData,
  EventPackage,
  GalleryItem,
  Inquiry,
  InquiryInput,
  InquiryStatus,
  Payment,
  PaymentInput,
  PaymentStatus,
  Proposal,
  ProposalStatus,
  QuotationLine,
  Service,
  StaffUser,
  Testimonial,
  Venue,
  WebsiteSettings,
} from "@/lib/types";

const seed = createSeedData();

type DemoStore = DemoData & {
  hydrated: boolean;
  resetDemo: () => void;
  addVenue: (input: Omit<Venue, "id" | "slug"> & { slug?: string }) => Venue;
  updateVenue: (id: string, patch: Partial<Venue>) => void;
  deleteVenue: (id: string) => void;
  duplicateVenue: (id: string) => Venue | null;
  addPackage: (input: Omit<EventPackage, "id" | "slug"> & { slug?: string }) => EventPackage;
  updatePackage: (id: string, patch: Partial<EventPackage>) => void;
  deletePackage: (id: string) => void;
  duplicatePackage: (id: string) => EventPackage | null;
  addService: (input: Omit<Service, "id" | "slug"> & { slug?: string }) => Service;
  updateService: (id: string, patch: Partial<Service>) => void;
  deleteService: (id: string) => void;
  duplicateService: (id: string) => Service | null;
  submitInquiry: (input: InquiryInput) => Inquiry;
  updateInquiry: (id: string, patch: Partial<Inquiry>) => void;
  setInquiryStatus: (id: string, status: InquiryStatus) => void;
  assignInquiry: (id: string, staff: string) => void;
  createProposalFromInquiry: (inquiryId: string) => { proposal: Proposal; created: boolean } | null;
  updateProposal: (id: string, patch: Partial<Proposal>) => void;
  setProposalStatus: (id: string, status: ProposalStatus) => Proposal | null;
  convertProposalToBooking: (proposalId: string) => { booking: Booking; created: boolean } | null;
  updateBooking: (id: string, patch: Partial<Booking>) => void;
  setBookingStatus: (id: string, status: BookingStatus) => void;
  recordPayment: (input: PaymentInput) => Payment | null;
  addClient: (input: Omit<Client, "id" | "createdAt">) => Client;
  updateClient: (id: string, patch: Partial<Client>) => void;
  addGalleryItem: (input: Omit<GalleryItem, "id">) => GalleryItem;
  updateGalleryItem: (id: string, patch: Partial<GalleryItem>) => void;
  deleteGalleryItem: (id: string) => void;
  addTestimonial: (input: Omit<Testimonial, "id">) => Testimonial;
  updateTestimonial: (id: string, patch: Partial<Testimonial>) => void;
  deleteTestimonial: (id: string) => void;
  updateSettings: (patch: Partial<WebsiteSettings>) => void;
  inviteUser: (input: Omit<StaffUser, "id" | "status"> & { status?: StaffUser["status"] }) => StaffUser;
  setUserStatus: (id: string, status: StaffUser["status"]) => void;
  addMessage: (input: Omit<ContactMessage, "id" | "createdAt">) => ContactMessage;
};

function paymentStatusFor(paid: number, total: number): PaymentStatus {
  if (paid <= 0) return "Unpaid";
  if (paid >= total) return "Paid";
  return "Partial";
}

function log(
  action: string,
  actor = "Ava Mendoza",
  entityType?: string,
  entityId?: string,
): ActivityLog {
  return {
    id: uid("log"),
    action,
    actor,
    createdAt: new Date().toISOString(),
    entityType,
    entityId,
  };
}

function withLog(activity: ActivityLog[], entry: ActivityLog) {
  return [entry, ...activity].slice(0, 200);
}

function upsertClient(clients: Client[], input: Pick<Client, "name" | "company" | "email" | "phone">) {
  const email = input.email.trim().toLowerCase();
  const found = clients.find((client) => client.email.toLowerCase() === email);
  if (found) {
    const client: Client = {
      ...found,
      name: input.name || found.name,
      company: input.company || found.company,
      phone: input.phone || found.phone,
    };
    return {
      client,
      clients: clients.map((item) => (item.id === found.id ? client : item)),
    };
  }
  const client: Client = {
    id: uid("cli"),
    name: input.name,
    company: input.company,
    email: input.email.trim(),
    phone: input.phone,
    status: "Lead",
    createdAt: new Date().toISOString(),
  };
  return { client, clients: [client, ...clients] };
}

function quoteLinesFromInquiry(data: DemoData, inquiry: Inquiry): QuotationLine[] {
  const lines: QuotationLine[] = [];
  const venue = data.venues.find((item) => item.id === inquiry.venuePreference);
  if (venue) {
    lines.push({
      id: uid("ql"),
      item: venue.name,
      description: "Venue rental",
      quantity: 1,
      unitPrice: venue.startingPrice,
      discountPercent: 0,
    });
  }
  const eventPackage = data.packages.find((item) => item.id === inquiry.packageId);
  if (eventPackage) {
    lines.push({
      id: uid("ql"),
      item: eventPackage.name,
      description: "Selected package",
      quantity: 1,
      unitPrice: packagePrice(eventPackage.price, eventPackage.salePrice),
      discountPercent: 0,
    });
  }
  const hours = Math.max(hoursBetween(inquiry.startTime, inquiry.endTime), 1);
  for (const serviceId of inquiry.serviceIds) {
    const service = data.services.find((item) => item.id === serviceId);
    if (!service) continue;
    const quantity =
      service.pricingType === "Per Person"
        ? inquiry.guestCount
        : service.pricingType === "Per Hour"
          ? hours
          : 1;
    lines.push({
      id: uid("ql"),
      item: service.name,
      description: service.pricingType,
      quantity,
      unitPrice: service.price,
      discountPercent: 0,
    });
  }
  if (lines.length === 0) {
    lines.push({
      id: uid("ql"),
      item: inquiry.eventType || "Custom event",
      description: "Custom quotation",
      quantity: 1,
      unitPrice: 0,
      discountPercent: 0,
    });
  }
  return lines;
}

/**
 * Frontend store for the demo. UI should call these actions instead of
 * reading localStorage. When NEXT_PUBLIC_USE_SUPABASE=true, public writes
 * (e.g. inquiries) go through /api/inquiries → Supabase instead.
 */
export const useDemoStore = create<DemoStore>()(
  persist(
    (set, get) => ({
      ...seed,
      hydrated: false,
      resetDemo: () => set({ ...createSeedData(), hydrated: true }),
      addVenue: (input) => {
        const venue: Venue = {
          ...input,
          id: uid("ven"),
          slug: uniqueSlug(input.slug || input.name, get().venues.map((item) => item.slug)),
        };
        set((state) => ({
          venues: [venue, ...state.venues],
          activity: withLog(state.activity, log(`Created venue ${venue.name}.`, "Ava Mendoza", "venue", venue.id)),
        }));
        return venue;
      },
      updateVenue: (id, patch) =>
        set((state) => ({
          venues: state.venues.map((venue) => (venue.id === id ? { ...venue, ...patch, id } : venue)),
          activity: withLog(state.activity, log("Updated a venue.", "Ava Mendoza", "venue", id)),
        })),
      deleteVenue: (id) =>
        set((state) => ({
          venues: state.venues.filter((venue) => venue.id !== id),
          packages: state.packages.map((item) => ({
            ...item,
            venueIds: item.venueIds.filter((venueId) => venueId !== id),
          })),
          activity: withLog(state.activity, log("Deleted a venue.", "Ava Mendoza", "venue", id)),
        })),
      duplicateVenue: (id) => {
        const source = get().venues.find((venue) => venue.id === id);
        if (!source) return null;
        return get().addVenue({
          ...source,
          name: `${source.name} Copy`,
          slug: undefined,
          published: false,
        });
      },
      addPackage: (input) => {
        const eventPackage: EventPackage = {
          ...input,
          id: uid("pkg"),
          slug: uniqueSlug(input.slug || input.name, get().packages.map((item) => item.slug)),
        };
        set((state) => ({
          packages: [eventPackage, ...state.packages],
          activity: withLog(
            state.activity,
            log(`Created package ${eventPackage.name}.`, "Ava Mendoza", "package", eventPackage.id),
          ),
        }));
        return eventPackage;
      },
      updatePackage: (id, patch) =>
        set((state) => ({
          packages: state.packages.map((item) => (item.id === id ? { ...item, ...patch, id } : item)),
          activity: withLog(state.activity, log("Updated a package.", "Ava Mendoza", "package", id)),
        })),
      deletePackage: (id) =>
        set((state) => ({
          packages: state.packages.filter((item) => item.id !== id),
          activity: withLog(state.activity, log("Deleted a package.", "Ava Mendoza", "package", id)),
        })),
      duplicatePackage: (id) => {
        const source = get().packages.find((item) => item.id === id);
        if (!source) return null;
        return get().addPackage({
          ...source,
          name: `${source.name} Copy`,
          slug: undefined,
          published: false,
          archived: false,
        });
      },
      addService: (input) => {
        const service: Service = {
          ...input,
          id: uid("svc"),
          slug: uniqueSlug(input.slug || input.name, get().services.map((item) => item.slug)),
        };
        set((state) => ({
          services: [service, ...state.services],
          activity: withLog(state.activity, log(`Created service ${service.name}.`, "Ava Mendoza", "service", service.id)),
        }));
        return service;
      },
      updateService: (id, patch) =>
        set((state) => ({
          services: state.services.map((item) => (item.id === id ? { ...item, ...patch, id } : item)),
          activity: withLog(state.activity, log("Updated a service.", "Ava Mendoza", "service", id)),
        })),
      deleteService: (id) =>
        set((state) => ({
          services: state.services.filter((item) => item.id !== id),
          activity: withLog(state.activity, log("Deleted a service.", "Ava Mendoza", "service", id)),
        })),
      duplicateService: (id) => {
        const source = get().services.find((item) => item.id === id);
        if (!source) return null;
        return get().addService({ ...source, name: `${source.name} Copy`, slug: undefined, active: false });
      },
      submitInquiry: (input) => {
        const linked = upsertClient(get().clients, {
          name: input.fullName,
          company: input.company,
          email: input.email,
          phone: input.phone,
        });
        const inquiry: Inquiry = {
          ...input,
          id: uid("inq"),
          number: nextCode("INQ", get().inquiries.map((item) => item.number)),
          status: "NEW",
          assignedStaff: "",
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          clients: linked.clients,
          inquiries: [inquiry, ...state.inquiries],
          activity: withLog(
            state.activity,
            log(`Received inquiry ${inquiry.number} from ${inquiry.fullName}.`, "Website", "inquiry", inquiry.id),
          ),
        }));
        return inquiry;
      },
      updateInquiry: (id, patch) =>
        set((state) => ({
          inquiries: state.inquiries.map((item) => (item.id === id ? { ...item, ...patch, id } : item)),
        })),
      setInquiryStatus: (id, status) =>
        set((state) => ({
          inquiries: state.inquiries.map((item) => (item.id === id ? { ...item, status } : item)),
          activity: withLog(state.activity, log(`Inquiry status set to ${status}.`, "Ava Mendoza", "inquiry", id)),
        })),
      assignInquiry: (id, staff) =>
        set((state) => ({
          inquiries: state.inquiries.map((item) => (item.id === id ? { ...item, assignedStaff: staff } : item)),
          activity: withLog(state.activity, log(`Assigned ${staff} to an inquiry.`, "Ava Mendoza", "inquiry", id)),
        })),
      createProposalFromInquiry: (inquiryId) => {
        const existing = get().proposals.find((item) => item.inquiryId === inquiryId);
        if (existing) return { proposal: existing, created: false };
        const inquiry = get().inquiries.find((item) => item.id === inquiryId);
        if (!inquiry) return null;
        const linked = upsertClient(get().clients, {
        name: inquiry.fullName,
        company: inquiry.company,
        email: inquiry.email,
        phone: inquiry.phone,
      });
        const proposal: Proposal = {
          id: uid("pro"),
          number: nextCode("PRO", get().proposals.map((item) => item.number)),
          inquiryId,
          clientId: linked.client.id,
          status: "DRAFT",
          items: quoteLinesFromInquiry(get(), inquiry),
          notes: inquiry.specialRequests,
          validUntil: inquiry.eventDate,
          depositPercent: 50,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          clients: linked.clients,
          proposals: [proposal, ...state.proposals],
          inquiries: state.inquiries.map((item) =>
            item.id === inquiryId && (item.status === "NEW" || item.status === "CONTACTED" || item.status === "FOR REVIEW")
              ? { ...item, status: "PROPOSAL PREPARATION" }
              : item,
          ),
          activity: withLog(
            state.activity,
            log(`Created proposal ${proposal.number}.`, "Ava Mendoza", "proposal", proposal.id),
          ),
        }));
        return { proposal, created: true };
      },
      updateProposal: (id, patch) =>
        set((state) => ({
          proposals: state.proposals.map((item) =>
            item.id === id ? { ...item, ...patch, id, updatedAt: new Date().toISOString() } : item,
          ),
          activity: withLog(state.activity, log("Saved a proposal.", "Ava Mendoza", "proposal", id)),
        })),
      setProposalStatus: (id, status) => {
        const current = get().proposals.find((item) => item.id === id);
        if (!current) return null;
        const inquiryStatus =
          status === "SENT"
            ? "PROPOSAL SENT"
            : status === "ACCEPTED"
              ? "ACCEPTED"
              : status === "DECLINED"
                ? "DECLINED"
                : status === "DRAFT" || status === "FOR APPROVAL" || status === "APPROVED" || status === "REVISED"
                  ? "PROPOSAL PREPARATION"
                  : null;
        const next: Proposal = { ...current, status, updatedAt: new Date().toISOString() };
        set((state) => ({
          proposals: state.proposals.map((item) => (item.id === id ? next : item)),
          inquiries: inquiryStatus
            ? state.inquiries.map((item) =>
                item.id === current.inquiryId ? { ...item, status: inquiryStatus } : item,
              )
            : state.inquiries,
          activity: withLog(state.activity, log(`Proposal marked ${status}.`, "Ava Mendoza", "proposal", id)),
        }));
        return next;
      },
      convertProposalToBooking: (proposalId) => {
        const proposal = get().proposals.find((item) => item.id === proposalId);
        if (!proposal) return null;
        const existing = get().bookings.find((item) => item.proposalId === proposalId);
        if (existing) return { booking: existing, created: false };
        const inquiry = get().inquiries.find((item) => item.id === proposal.inquiryId);
        const venue = get().venues.find((item) => item.id === inquiry?.venuePreference);
        const totals = quoteTotals(proposal.items, proposal.depositPercent);
        const booking: Booking = {
          id: uid("bk"),
          number: nextCode("BK", get().bookings.map((item) => item.number)),
          clientId: proposal.clientId,
          proposalId: proposal.id,
          inquiryId: proposal.inquiryId,
          eventName: inquiry ? `${inquiry.fullName} ${inquiry.eventType}` : proposal.number,
          eventType: inquiry?.eventType || "Private Celebration",
          venueId: venue?.id || "",
          venueName: venue?.name || inquiry?.venueName || "Client venue",
          eventDate: inquiry?.eventDate || new Date().toISOString().slice(0, 10),
          startTime: inquiry?.startTime || "09:00",
          endTime: inquiry?.endTime || "17:00",
          guestCount: inquiry?.guestCount || 0,
          total: Math.round(totals.grandTotal),
          paid: 0,
          paymentStatus: "Unpaid",
          status: "Tentative",
          serviceIds: inquiry?.serviceIds || [],
          notes: proposal.notes,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          bookings: [booking, ...state.bookings],
          proposals: state.proposals.map((item) =>
            item.id === proposalId ? { ...item, status: "ACCEPTED", updatedAt: new Date().toISOString() } : item,
          ),
          inquiries: state.inquiries.map((item) =>
            item.id === proposal.inquiryId ? { ...item, status: "ACCEPTED" } : item,
          ),
          activity: withLog(
            state.activity,
            log(`Created booking ${booking.number} from ${proposal.number}.`, "Ava Mendoza", "booking", booking.id),
          ),
        }));
        return { booking, created: true };
      },
      updateBooking: (id, patch) =>
        set((state) => ({
          bookings: state.bookings.map((booking) => {
            if (booking.id !== id) return booking;
            const next = { ...booking, ...patch, id };
            return { ...next, paymentStatus: paymentStatusFor(next.paid, next.total) };
          }),
          activity: withLog(state.activity, log("Updated a booking.", "Ava Mendoza", "booking", id)),
        })),
      setBookingStatus: (id, status) =>
        set((state) => ({
          bookings: state.bookings.map((booking) => (booking.id === id ? { ...booking, status } : booking)),
          activity: withLog(state.activity, log(`Booking status set to ${status}.`, "Ava Mendoza", "booking", id)),
        })),
      recordPayment: (input) => {
        const booking = get().bookings.find((item) => item.id === input.bookingId);
        if (!booking) return null;
        const payment: Payment = {
          id: uid("pay"),
          number: nextCode("PAY", get().payments.map((item) => item.number)),
          bookingId: booking.id,
          clientId: booking.clientId,
          amount: input.amount,
          method: input.method,
          reference: input.reference,
          date: input.date,
          notes: input.notes,
          status: "Completed",
        };
        const paid = booking.paid + input.amount;
        set((state) => ({
          payments: [payment, ...state.payments],
          bookings: state.bookings.map((item) =>
            item.id === booking.id
              ? { ...item, paid, paymentStatus: paymentStatusFor(paid, item.total) }
              : item,
          ),
          activity: withLog(
            state.activity,
            log(`Recorded payment ${payment.number}.`, "Ava Mendoza", "booking", booking.id),
          ),
        }));
        return payment;
      },
      addClient: (input) => {
        const client: Client = { ...input, id: uid("cli"), createdAt: new Date().toISOString() };
        set((state) => ({
          clients: [client, ...state.clients],
          activity: withLog(state.activity, log(`Added client ${client.name}.`, "Ava Mendoza", "client", client.id)),
        }));
        return client;
      },
      updateClient: (id, patch) =>
        set((state) => ({
          clients: state.clients.map((client) => (client.id === id ? { ...client, ...patch, id } : client)),
          activity: withLog(state.activity, log("Updated a client.", "Ava Mendoza", "client", id)),
        })),
      addGalleryItem: (input) => {
        const item: GalleryItem = { ...input, id: uid("gal") };
        set((state) => ({
          gallery: [item, ...state.gallery],
          activity: withLog(state.activity, log("Added a gallery image.", "Ava Mendoza", "gallery", item.id)),
        }));
        return item;
      },
      updateGalleryItem: (id, patch) =>
        set((state) => ({
          gallery: state.gallery.map((item) => (item.id === id ? { ...item, ...patch, id } : item)),
        })),
      deleteGalleryItem: (id) =>
        set((state) => ({
          gallery: state.gallery.filter((item) => item.id !== id),
          activity: withLog(state.activity, log("Removed a gallery image.", "Ava Mendoza", "gallery", id)),
        })),
      addTestimonial: (input) => {
        const item: Testimonial = { ...input, id: uid("tes") };
        set((state) => ({
          testimonials: [item, ...state.testimonials],
          activity: withLog(state.activity, log("Added a testimonial.", "Ava Mendoza", "testimonial", item.id)),
        }));
        return item;
      },
      updateTestimonial: (id, patch) =>
        set((state) => ({
          testimonials: state.testimonials.map((item) => (item.id === id ? { ...item, ...patch, id } : item)),
        })),
      deleteTestimonial: (id) =>
        set((state) => ({
          testimonials: state.testimonials.filter((item) => item.id !== id),
          activity: withLog(state.activity, log("Deleted a testimonial.", "Ava Mendoza", "testimonial", id)),
        })),
      updateSettings: (patch) =>
        set((state) => ({
          settings: { ...state.settings, ...patch },
          activity: withLog(state.activity, log("Saved website settings.")),
        })),
      inviteUser: (input) => {
        const user: StaffUser = { ...input, id: uid("usr"), status: input.status ?? "Invited" };
        set((state) => ({
          users: [...state.users, user],
          activity: withLog(state.activity, log(`Invited ${user.email}.`, "Ava Mendoza", "user", user.id)),
        }));
        return user;
      },
      setUserStatus: (id, status) =>
        set((state) => ({
          users: state.users.map((user) => (user.id === id ? { ...user, status } : user)),
        })),
      addMessage: (input) => {
        const message: ContactMessage = { ...input, id: uid("msg"), createdAt: new Date().toISOString() };
        set((state) => ({
          messages: [message, ...state.messages],
          activity: withLog(state.activity, log(`Contact message from ${message.name}.`, "Website", "message", message.id)),
        }));
        return message;
      },
    }),
    {
      name: "rsvpnow-demo-v1",
      version: 9,
      migrate: (persisted, fromVersion) => {
        // v9: wipe all sample/demo records; keep company settings.
        if (fromVersion < 9) {
          const empty = createSeedData();
          const prev = persisted as Partial<DemoData> | undefined;
          return {
            ...empty,
            settings: { ...empty.settings, ...(prev?.settings ?? {}) },
            users: empty.users,
          };
        }
        return persisted as DemoData;
      },
      skipHydration: true,
      partialize: (state) => ({
        venues: state.venues,
        packages: state.packages,
        services: state.services,
        inquiries: state.inquiries,
        proposals: state.proposals,
        bookings: state.bookings,
        payments: state.payments,
        clients: state.clients,
        testimonials: state.testimonials,
        gallery: state.gallery,
        settings: state.settings,
        users: state.users,
        activity: state.activity,
        messages: state.messages,
      }),
    },
  ),
);

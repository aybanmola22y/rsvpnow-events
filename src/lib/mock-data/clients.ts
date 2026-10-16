import type { Client, StaffUser, Testimonial, WebsiteSettings } from "@/lib/types";
import { photos } from "@/lib/images";

export const seedClients: Client[] = [
  { id: "cli-isabella", name: "Isabella Reyes", company: "Reyes & Co.", email: "isabella.reyes@example.com", phone: "+63 917 555 0142", status: "Active", createdAt: "2026-01-14T02:00:00.000Z" },
  { id: "cli-gabriel", name: "Gabriel Tan", company: "Tan Holdings", email: "gabriel.tan@example.com", phone: "+63 918 555 0176", status: "Active", createdAt: "2026-02-02T02:00:00.000Z" },
  { id: "cli-sofia", name: "Sofia Delgado", company: "", email: "sofia.delgado@example.com", phone: "+63 919 555 0118", status: "Lead", createdAt: "2026-03-11T02:00:00.000Z" },
  { id: "cli-miguel", name: "Miguel Santos", company: "Northwind Singapore", email: "miguel.santos@example.com", phone: "+65 9123 0190", status: "Active", createdAt: "2026-03-20T02:00:00.000Z" },
  { id: "cli-camille", name: "Camille Uy", company: "Uy Family", email: "camille.uy@example.com", phone: "+63 916 555 0133", status: "Lead", createdAt: "2026-04-04T02:00:00.000Z" },
  { id: "cli-andre", name: "Andre Villanueva", company: "Villanueva Law", email: "andre.villanueva@example.com", phone: "+63 917 555 0164", status: "Active", createdAt: "2026-04-18T02:00:00.000Z" },
  { id: "cli-patricia", name: "Patricia Lim", company: "Lim Atelier", email: "patricia.lim@example.com", phone: "+63 918 555 0127", status: "Active", createdAt: "2026-05-02T02:00:00.000Z" },
  { id: "cli-elena", name: "Elena Cruz", company: "", email: "elena.cruz@example.com", phone: "+63 919 555 0188", status: "Lead", createdAt: "2026-05-16T02:00:00.000Z" },
  { id: "cli-julian", name: "Julian Navarro", company: "Summit Conferences", email: "julian.navarro@example.com", phone: "+63 917 555 0104", status: "Inactive", createdAt: "2026-06-01T02:00:00.000Z" },
  { id: "cli-rafael", name: "Rafael Dizon", company: "Dizon Group", email: "rafael.dizon@example.com", phone: "+63 918 555 0199", status: "Active", createdAt: "2026-06-12T02:00:00.000Z" },
  { id: "cli-hannah", name: "Hannah Co", company: "", email: "hannah.co@example.com", phone: "+63 916 555 0171", status: "Lead", createdAt: "2026-09-02T02:00:00.000Z" },
  { id: "cli-paolo", name: "Paolo Mendoza", company: "Mendoza Studio", email: "paolo.mendoza@example.com", phone: "+63 917 555 0155", status: "Lead", createdAt: "2026-09-18T02:00:00.000Z" },
  { id: "cli-bianca", name: "Bianca Flores", company: "Flores Family", email: "bianca.flores@example.com", phone: "+63 919 555 0144", status: "Lead", createdAt: "2026-10-01T02:00:00.000Z" },
  { id: "cli-marco", name: "Marco Lim", company: "Harbor Seminars", email: "marco.lim@example.com", phone: "+63 918 555 0160", status: "Inactive", createdAt: "2026-07-09T02:00:00.000Z" },
  { id: "cli-nina", name: "Nina Santos", company: "Santos Collective", email: "nina.santos@example.com", phone: "+63 917 555 0182", status: "Active", createdAt: "2026-08-22T02:00:00.000Z" },
];

export const seedUsers: StaffUser[] = [
  { id: "usr-ava", name: "Ava Mendoza", email: "admin@eventdemo.com", role: "Administrator", status: "Active" },
  { id: "usr-marco", name: "Marco Santos", email: "marco.santos@rsvpnowevents.com", role: "Events Manager", status: "Active" },
  { id: "usr-liza", name: "Liza Cruz", email: "liza.cruz@rsvpnowevents.com", role: "Sales Lead", status: "Active" },
];

export const seedSettings: WebsiteSettings = {
  companyName: "RSVPNow",
  companyDescription:
    "RSVPNow is a Singapore-based events and experiences company bringing people together through memorable, seamlessly executed events. From corporate celebrations, team building, dinner and dances and festive events to private functions and customised experiences, we handle the planning, coordination and execution from start to finish.",
  email: "rsvpnowevents@novanorthsg.com",
  phone: "",
  address: "60 Paya Lebar Rd, Singapore 409051",
  facebook: "",
  instagram: "https://www.instagram.com/rsvpnowevents",
  tiktok: "",
  youtube: "",
  website: "https://www.novanorthsg.com",
  businessHours: "Open 24 hours",
};

export const seedTestimonials: Testimonial[] = [
  {
    id: "tes-1",
    name: "Isabella Reyes",
    role: "Wedding, Grand Ballroom",
    eventType: "Wedding",
    quote:
      "RSVPNow treated the dinner as carefully as the ceremony. Our parents never had to ask where to stand, and the room still felt like ours.",
    rating: 5,
    image: photos.portraitA,
    featured: true,
    published: true,
  },
  {
    id: "tes-2",
    name: "Gabriel Tan",
    role: "Leadership dinner, Raffles Place",
    eventType: "Corporate",
    quote:
      "The briefing was short, the room was ready, and the program ended when we said it would. That is rarer than it should be.",
    rating: 5,
    image: photos.portraitB,
    featured: true,
    published: true,
  },
  {
    id: "tes-3",
    name: "Camille Uy",
    role: "Anniversary dinner planning",
    eventType: "Celebration",
    quote:
      "They understood that a family celebration can be grand without becoming a production. The evening had room to breathe.",
    rating: 5,
    image: photos.portraitC,
    featured: true,
    published: true,
  },
  {
    id: "tes-4",
    name: "Patricia Lim",
    role: "Client seminar",
    eventType: "Seminar",
    quote:
      "Slides, lunch, and the Q&A all felt hosted. Guests stayed for the conversation after, which was the point.",
    rating: 5,
    image: photos.portraitE,
    featured: false,
    published: true,
  },
  {
    id: "tes-5",
    name: "Andre Villanueva",
    role: "Firm anniversary, Sentosa",
    eventType: "Company Party",
    quote:
      "We wanted the coast without a festival atmosphere. RSVPNow kept the evening elegant and the speeches audible over the water.",
    rating: 4,
    image: photos.portraitD,
    featured: false,
    published: true,
  },
  {
    id: "tes-6",
    name: "Sofia Delgado",
    role: "40th birthday, Dempsey",
    eventType: "Birthday",
    quote:
      "The pavilion looked like a dinner party, not a themed set. My parents are still talking about the cake table.",
    rating: 5,
    image: photos.portraitG,
    featured: true,
    published: true,
  },
  {
    id: "tes-7",
    name: "Rafael Dizon",
    role: "Product launch, Suntec",
    eventType: "Corporate",
    quote:
      "Registration moved, the LED wall behaved, and our CEO was not left waiting on a clicker. We will book the hall again.",
    rating: 5,
    image: photos.portraitF,
    featured: false,
    published: true,
  },
  {
    id: "tes-8",
    name: "Elena Cruz",
    role: "Wedding consultation",
    eventType: "Wedding",
    quote:
      "The proposal was itemized and calm. We knew what was included before we fell in love with the garden.",
    rating: 5,
    image: photos.portraitA,
    featured: false,
    published: false,
  },
];

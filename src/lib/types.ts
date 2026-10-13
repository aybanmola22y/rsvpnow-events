export const EVENT_TYPES = [
  "Wedding",
  "Birthday",
  "Debut",
  "Corporate",
  "Conference",
  "Seminar",
  "Company Party",
  "Private Celebration",
] as const;

export type EventType = (typeof EVENT_TYPES)[number];

export const PRICING_TYPES = [
  "Fixed",
  "Per Person",
  "Per Hour",
  "Per Day",
  "Custom",
] as const;

export type PricingType = (typeof PRICING_TYPES)[number];

export const INQUIRY_STATUSES = [
  "NEW",
  "CONTACTED",
  "FOR REVIEW",
  "PROPOSAL PREPARATION",
  "PROPOSAL SENT",
  "ACCEPTED",
  "DECLINED",
  "ARCHIVED",
] as const;

export type InquiryStatus = (typeof INQUIRY_STATUSES)[number];

export const PROPOSAL_STATUSES = [
  "DRAFT",
  "FOR APPROVAL",
  "APPROVED",
  "SENT",
  "ACCEPTED",
  "DECLINED",
  "REVISED",
] as const;

export type ProposalStatus = (typeof PROPOSAL_STATUSES)[number];

export const BOOKING_STATUSES = [
  "Tentative",
  "Confirmed",
  "Ongoing",
  "Completed",
  "Cancelled",
] as const;

export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const PAYMENT_STATUSES = ["Unpaid", "Partial", "Paid", "Refunded"] as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_METHODS = [
  "Cash",
  "GCash",
  "Maya",
  "Bank Transfer",
  "Card",
  "Other",
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_RECORD_STATUSES = ["Completed", "Pending", "Failed"] as const;

export type PaymentRecordStatus = (typeof PAYMENT_RECORD_STATUSES)[number];

export const CLIENT_STATUSES = ["Active", "Lead", "Inactive"] as const;

export type ClientStatus = (typeof CLIENT_STATUSES)[number];

export const USER_STATUSES = ["Active", "Invited", "Inactive"] as const;

export type UserStatus = (typeof USER_STATUSES)[number];

export type Venue = {
  id: string;
  name: string;
  slug: string;
  images: string[];
  shortDescription: string;
  description: string;
  location: string;
  startingPrice: number;
  minCapacity: number;
  maxCapacity: number;
  amenities: string[];
  facilities: string[];
  eventTypes: string[];
  featured: boolean;
  published: boolean;
};

export type EventPackage = {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  price: number;
  salePrice: number | null;
  guestCapacity: number;
  inclusions: string[];
  exclusions: string[];
  venueIds: string[];
  serviceIds: string[];
  eventType: string;
  featured: boolean;
  published: boolean;
  archived: boolean;
};

export type Service = {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  price: number;
  pricingType: PricingType;
  category: string;
  active: boolean;
};

export type Inquiry = {
  id: string;
  number: string;
  fullName: string;
  company: string;
  email: string;
  phone: string;
  eventType: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  guestCount: number;
  venuePreference: string;
  venueName: string;
  venueAddress: string;
  packageId: string;
  serviceIds: string[];
  budget: number;
  theme: string;
  specialRequests: string;
  status: InquiryStatus;
  assignedStaff: string;
  source: "website" | "builder" | "admin";
  createdAt: string;
};

export type QuotationLine = {
  id: string;
  item: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
};

export type Proposal = {
  id: string;
  number: string;
  inquiryId: string;
  clientId: string;
  status: ProposalStatus;
  items: QuotationLine[];
  notes: string;
  validUntil: string;
  depositPercent: number;
  createdAt: string;
  updatedAt: string;
};

export type Booking = {
  id: string;
  number: string;
  clientId: string;
  proposalId: string;
  inquiryId: string;
  eventName: string;
  eventType: string;
  venueId: string;
  venueName: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  guestCount: number;
  total: number;
  paid: number;
  paymentStatus: PaymentStatus;
  status: BookingStatus;
  serviceIds: string[];
  notes: string;
  createdAt: string;
};

export type Payment = {
  id: string;
  number: string;
  bookingId: string;
  clientId: string;
  amount: number;
  method: PaymentMethod;
  reference: string;
  date: string;
  notes: string;
  status: PaymentRecordStatus;
};

export type Client = {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: ClientStatus;
  createdAt: string;
};

export type Testimonial = {
  id: string;
  name: string;
  role: string;
  eventType: string;
  quote: string;
  rating: number;
  image: string;
  featured: boolean;
  published: boolean;
};

export type GalleryItem = {
  id: string;
  src: string;
  caption: string;
  category: string;
  featured: boolean;
};

export type WebsiteSettings = {
  companyName: string;
  companyDescription: string;
  email: string;
  phone: string;
  address: string;
  facebook: string;
  instagram: string;
  tiktok: string;
  youtube: string;
  website: string;
  businessHours: string;
};

export type StaffUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: UserStatus;
};

export type ActivityLog = {
  id: string;
  action: string;
  actor: string;
  createdAt: string;
  entityType?: string;
  entityId?: string;
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  createdAt: string;
};

export type DemoData = {
  venues: Venue[];
  packages: EventPackage[];
  services: Service[];
  inquiries: Inquiry[];
  proposals: Proposal[];
  bookings: Booking[];
  payments: Payment[];
  clients: Client[];
  testimonials: Testimonial[];
  gallery: GalleryItem[];
  settings: WebsiteSettings;
  users: StaffUser[];
  activity: ActivityLog[];
  messages: ContactMessage[];
};

export type InquiryInput = {
  fullName: string;
  company: string;
  email: string;
  phone: string;
  eventType: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  guestCount: number;
  venuePreference: string;
  venueName: string;
  venueAddress: string;
  packageId: string;
  serviceIds: string[];
  budget: number;
  theme: string;
  specialRequests: string;
  source: Inquiry["source"];
};

export type PaymentInput = {
  bookingId: string;
  amount: number;
  method: PaymentMethod;
  reference: string;
  date: string;
  notes: string;
};

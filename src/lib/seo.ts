import type { Metadata } from "next";
import { seedSettings } from "@/lib/mock-data/clients";

/** Canonical production origin. Override with NEXT_PUBLIC_SITE_URL when needed. */
export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  const fromWebsite = seedSettings.website?.trim().replace(/\/$/, "");
  if (fromWebsite) return fromWebsite;
  // Prefer www — apex redirects to www in production.
  return "https://www.rsvpnowevents.com";
}

export const siteName = seedSettings.companyName || "RSVPNow";

export const defaultDescription =
  seedSettings.companyDescription ||
  "Singapore event planner for corporate celebrations, team building, dinners & dances, and private functions. RSVPNow handles planning, coordination, and execution end to end.";

/** Phrases people may search when looking for an event company in Singapore. */
export const siteKeywords = [
  "event planner Singapore",
  "event planning Singapore",
  "corporate event planner Singapore",
  "wedding planner Singapore",
  "team building Singapore",
  "dinner and dance Singapore",
  "event organiser Singapore",
  "RSVPNow",
  "RSVPNow Events",
];

export function absoluteUrl(path = "/"): string {
  const base = getSiteUrl();
  if (!path || path === "/") return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

type PageSeoInput = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  noIndex?: boolean;
};

/** Shared metadata for public pages (title template still applies from root layout). */
export function pageMetadata({
  title,
  description,
  path,
  keywords,
  noIndex,
}: PageSeoInput): Metadata {
  const url = absoluteUrl(path);
  return {
    title,
    description,
    keywords: keywords?.length ? [...siteKeywords, ...keywords] : siteKeywords,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} · ${siteName}`,
      description,
      url,
      siteName,
      type: "website",
      locale: "en_SG",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} · ${siteName}`,
      description,
    },
    ...(noIndex
      ? { robots: { index: false, follow: false } }
      : { robots: { index: true, follow: true } }),
  };
}

export function localBusinessJsonLd() {
  const url = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "EventPlanningBusiness",
    name: siteName,
    description: defaultDescription,
    url,
    email: seedSettings.email || undefined,
    telephone: seedSettings.phone || undefined,
    image: absoluteUrl("/brand/hero.jpg"),
    logo: absoluteUrl("/brand/logo.svg"),
    address: {
      "@type": "PostalAddress",
      streetAddress: "60 Paya Lebar Rd",
      addressLocality: "Singapore",
      postalCode: "409051",
      addressCountry: "SG",
    },
    areaServed: {
      "@type": "City",
      name: "Singapore",
    },
    sameAs: [seedSettings.instagram, seedSettings.facebook, seedSettings.tiktok, seedSettings.youtube].filter(
      Boolean,
    ),
    openingHours: seedSettings.businessHours || undefined,
    priceRange: "$$",
  };
}

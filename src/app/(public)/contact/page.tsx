import type { Metadata } from "next";
import { ContactPage } from "@/components/public/contact-page";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Contact",
  description:
    "Contact RSVPNow in Singapore — tell us about your event and we will help with planning, venues, and coordination from start to finish.",
  path: "/contact",
  keywords: ["contact event planner Singapore"],
});

export default function Page() {
  return <ContactPage />;
}

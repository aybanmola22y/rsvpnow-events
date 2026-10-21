import type { Metadata } from "next";
import { ServicesPage } from "@/components/public/story-pages";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Event Planning Services",
  description:
    "Explore RSVPNow event planning services in Singapore — coordination, styling, production, and end-to-end execution for corporate and private events.",
  path: "/services",
  keywords: ["event coordination Singapore", "event production Singapore"],
});

export default function Page() {
  return <ServicesPage />;
}

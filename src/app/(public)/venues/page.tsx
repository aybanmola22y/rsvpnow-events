import type { Metadata } from "next";
import { VenuesPage } from "@/components/public/venues-browse";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Event Venues Singapore",
  description:
    "Discover RSVPNow event venues across Singapore — ballrooms, garden pavilions, seaside halls, and function rooms for weddings and corporate events.",
  path: "/venues",
  keywords: ["event venue Singapore", "wedding venue Singapore"],
});

export default function Page() {
  return <VenuesPage />;
}

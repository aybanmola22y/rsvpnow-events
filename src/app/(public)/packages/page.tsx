import type { Metadata } from "next";
import { PackagesPage } from "@/components/public/packages-browse";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Event Packages",
  description:
    "Browse RSVPNow event packages in Singapore — weddings, birthdays, corporate events, conferences, and intimate celebrations with clear inclusions.",
  path: "/packages",
  keywords: ["wedding package Singapore", "corporate event package Singapore"],
});

export default function Page() {
  return <PackagesPage />;
}

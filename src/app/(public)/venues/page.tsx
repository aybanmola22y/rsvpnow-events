import type { Metadata } from "next";
import { VenuesPage } from "@/components/public/venues-browse";

export const metadata: Metadata = { title: "Venues" };

export default function Page() {
  return <VenuesPage />;
}

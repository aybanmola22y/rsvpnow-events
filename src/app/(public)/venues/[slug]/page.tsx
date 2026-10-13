import type { Metadata } from "next";
import { VenueDetail } from "@/components/public/venues-browse";

export const metadata: Metadata = { title: "Venue" };

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <VenueDetail slug={slug} />;
}

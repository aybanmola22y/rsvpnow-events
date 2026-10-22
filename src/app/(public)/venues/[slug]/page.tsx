import type { Metadata } from "next";
import { VenueDetail } from "@/components/public/venues-browse";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return pageMetadata({
    title: "Venue",
    description: "Browse RSVPNow event venues in Singapore.",
    path: `/venues/${slug}`,
  });
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  return <VenueDetail slug={slug} />;
}

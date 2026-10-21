import type { Metadata } from "next";
import { VenueDetail } from "@/components/public/venues-browse";
import { seedVenues } from "@/lib/mock-data/venues";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return seedVenues.filter((item) => item.published).map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = seedVenues.find((venue) => venue.slug === slug);
  if (!item) {
    return pageMetadata({
      title: "Venue",
      description: "Browse RSVPNow event venues in Singapore.",
      path: `/venues/${slug}`,
    });
  }
  return pageMetadata({
    title: `${item.name} · ${item.location}`,
    description: item.shortDescription || item.description.slice(0, 160),
    path: `/venues/${item.slug}`,
    keywords: [item.name, item.location, "event venue Singapore"],
  });
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  return <VenueDetail slug={slug} />;
}

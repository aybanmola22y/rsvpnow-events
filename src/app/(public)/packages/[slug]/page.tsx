import type { Metadata } from "next";
import { PackageDetail } from "@/components/public/packages-browse";
import { seedPackages } from "@/lib/mock-data/packages";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return seedPackages.filter((item) => item.published).map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = seedPackages.find((pkg) => pkg.slug === slug);
  if (!item) {
    return pageMetadata({
      title: "Package",
      description: "Browse RSVPNow event packages in Singapore.",
      path: `/packages/${slug}`,
    });
  }
  return pageMetadata({
    title: item.name,
    description: item.description.slice(0, 160),
    path: `/packages/${item.slug}`,
    keywords: [item.name, "event package Singapore"],
  });
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  return <PackageDetail slug={slug} />;
}

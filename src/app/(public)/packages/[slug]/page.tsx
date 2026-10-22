import type { Metadata } from "next";
import { PackageDetail } from "@/components/public/packages-browse";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return pageMetadata({
    title: "Package",
    description: "Browse RSVPNow event packages in Singapore.",
    path: `/packages/${slug}`,
  });
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  return <PackageDetail slug={slug} />;
}

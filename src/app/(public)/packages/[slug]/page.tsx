import type { Metadata } from "next";
import { PackageDetail } from "@/components/public/packages-browse";

export const metadata: Metadata = { title: "Package" };

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <PackageDetail slug={slug} />;
}

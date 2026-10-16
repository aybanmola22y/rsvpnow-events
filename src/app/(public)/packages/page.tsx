import type { Metadata } from "next";
import { PackagesPage } from "@/components/public/packages-browse";

export const metadata: Metadata = { title: "Packages" };

export default function Page() {
  return <PackagesPage />;
}

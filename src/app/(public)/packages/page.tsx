import type { Metadata } from "next";
import { Suspense } from "react";
import { PackagesPage } from "@/components/public/packages-browse";

export const metadata: Metadata = { title: "Packages" };

export default function Page() {
  return (
    <Suspense fallback={<div className="px-6 py-24 text-center">Loading packages…</div>}>
      <PackagesPage />
    </Suspense>
  );
}

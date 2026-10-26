import type { Metadata } from "next";
import { Suspense } from "react";
import { TrackInquiryPage } from "@/components/public/track-inquiry";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Track Your Quotation",
  description:
    "Track your RSVPNow quotation request in Singapore using your reference number and email.",
  path: "/track",
  keywords: ["track quotation Singapore", "event proposal status"],
});

export default function Page() {
  return (
    <Suspense fallback={<div className="px-6 py-24 text-center text-stone-500">Loading…</div>}>
      <TrackInquiryPage />
    </Suspense>
  );
}

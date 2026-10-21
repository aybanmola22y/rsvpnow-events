import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Request a Proposal",
  description:
    "Request an event proposal from RSVPNow in Singapore. Share your date, guest count, and vision — we will return a clear plan and quote.",
  path: "/request-proposal",
  keywords: ["event quotation Singapore", "event proposal Singapore"],
});

const RequestProposalForm = dynamic(
  () =>
    import("@/components/public/request-proposal-form").then((mod) => ({
      default: mod.RequestProposalForm,
    })),
  {
    loading: () => (
      <div className="px-6 py-24 text-center text-stone-500">Loading the form…</div>
    ),
  },
);

export default function Page() {
  return (
    <Suspense fallback={<div className="px-6 py-24 text-center text-stone-500">Loading the form…</div>}>
      <RequestProposalForm />
    </Suspense>
  );
}

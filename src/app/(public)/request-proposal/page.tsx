import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Suspense } from "react";

export const metadata: Metadata = { title: "Request Proposal" };

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

import type { Metadata } from "next";
import { Suspense } from "react";
import { RequestProposalForm } from "@/components/public/request-proposal-form";

export const metadata: Metadata = { title: "Request Proposal" };

export default function Page() {
  return (
    <Suspense fallback={<div className="px-6 py-24 text-center">Loading the form…</div>}>
      <RequestProposalForm />
    </Suspense>
  );
}

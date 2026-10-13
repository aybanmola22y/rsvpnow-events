import type { Metadata } from "next";
import { Suspense } from "react";
import { BuildEventWizard } from "@/components/public/build-event-wizard";

export const metadata: Metadata = { title: "Build Your Event" };

export default function Page() {
  return (
    <Suspense fallback={<div className="px-6 py-24 text-center">Preparing the planner…</div>}>
      <BuildEventWizard />
    </Suspense>
  );
}

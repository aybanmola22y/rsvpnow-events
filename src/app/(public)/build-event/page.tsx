import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Suspense } from "react";

export const metadata: Metadata = { title: "Build Your Event" };

const BuildEventWizard = dynamic(
  () =>
    import("@/components/public/build-event-wizard").then((mod) => ({
      default: mod.BuildEventWizard,
    })),
  {
    loading: () => (
      <div className="px-6 py-24 text-center text-stone-500">Preparing the planner…</div>
    ),
  },
);

export default function Page() {
  return (
    <Suspense fallback={<div className="px-6 py-24 text-center text-stone-500">Preparing the planner…</div>}>
      <BuildEventWizard />
    </Suspense>
  );
}

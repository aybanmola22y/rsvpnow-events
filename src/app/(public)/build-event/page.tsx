import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Build Your Event",
  description:
    "Build your Singapore event with RSVPNow — choose the format, guest count, and style, then request a tailored proposal from our planning team.",
  path: "/build-event",
  keywords: ["plan an event Singapore", "custom event planner"],
});

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

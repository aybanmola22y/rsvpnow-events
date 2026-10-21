import type { Metadata } from "next";
import { HomePage } from "@/components/public/home-page";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Event Planner Singapore",
  description:
    "RSVPNow is a Singapore event planner for corporate celebrations, team building, dinners & dances, and private functions. You bring the people — we take care of the rest.",
  path: "/",
  keywords: ["corporate events Singapore", "private functions Singapore"],
});

export default function Page() {
  return <HomePage />;
}

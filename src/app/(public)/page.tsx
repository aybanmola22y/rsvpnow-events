import type { Metadata } from "next";
import { HomePage } from "@/components/public/home-page";

export const metadata: Metadata = { title: "Celebrate Moments" };

export default function Page() {
  return <HomePage />;
}

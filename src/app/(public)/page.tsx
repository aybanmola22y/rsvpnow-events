import type { Metadata } from "next";
import { HomePage } from "@/components/public/home-page";

export const metadata: Metadata = { title: "Events in Singapore" };

export default function Page() {
  return <HomePage />;
}

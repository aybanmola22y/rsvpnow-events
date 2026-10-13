import type { Metadata } from "next";
import { ServicesPage } from "@/components/public/story-pages";

export const metadata: Metadata = { title: "Services" };

export default function Page() {
  return <ServicesPage />;
}

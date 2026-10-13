import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = { title: "Staff login" };

export default function Page() {
  return <LoginForm />;
}

import { Suspense } from "react";
import { InquiryAdminList } from "@/components/admin/inquiry-admin";

export default function Page() {
  return (
    <Suspense>
      <InquiryAdminList />
    </Suspense>
  );
}

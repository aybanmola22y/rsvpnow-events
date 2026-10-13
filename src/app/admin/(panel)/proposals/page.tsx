import { Suspense } from "react";
import { ProposalAdminList } from "@/components/admin/proposal-admin";

export default function Page() {
  return (
    <Suspense>
      <ProposalAdminList />
    </Suspense>
  );
}

import { Suspense } from "react";
import { BookingAdminList } from "@/components/admin/booking-admin";

export default function Page() {
  return (
    <Suspense>
      <BookingAdminList />
    </Suspense>
  );
}

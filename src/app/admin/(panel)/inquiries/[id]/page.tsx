import { InquiryAdminDetail } from "@/components/admin/inquiry-admin";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <InquiryAdminDetail id={id} />;
}

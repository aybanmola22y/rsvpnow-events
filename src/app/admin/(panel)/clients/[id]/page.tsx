import { ClientAdminDetail } from "@/components/admin/sales-admin";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ClientAdminDetail id={id} />;
}

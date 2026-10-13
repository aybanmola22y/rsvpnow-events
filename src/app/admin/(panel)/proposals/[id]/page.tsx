import { ProposalBuilder } from "@/components/admin/proposal-admin";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProposalBuilder id={id} />;
}

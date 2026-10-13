"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/shared/chrome";
import { CurrencyDisplay } from "@/components/shared/currency";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { QuotationEditor } from "@/components/admin/quotation-editor";
import { quoteTotals } from "@/lib/pricing";
import type { ProposalStatus, QuotationLine } from "@/lib/types";
import { formatDate, wait } from "@/lib/format";
import { useDemoStore } from "@/lib/store/demo-store";

const pendingStatuses: ProposalStatus[] = ["DRAFT", "FOR APPROVAL", "APPROVED"];

export function ProposalAdminList() {
  const params = useSearchParams();
  const view = params.get("view");
  const proposals = useDemoStore((state) => state.proposals);
  const clients = useDemoStore((state) => state.clients);
  const rows = proposals.filter((item) => (view === "pending" ? pendingStatuses.includes(item.status) : true));

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Sales" title={view === "pending" ? "Pending proposals" : "Proposals"} description="Drafts, approvals, and quotations sent to clients." />
      <DataTable
        rows={rows}
        rowKey={(row) => row.id}
        getSearchText={(row) => `${row.number} ${row.status}`}
        searchPlaceholder="Search proposals"
        emptyTitle="No proposals found"
        emptyDescription="Create one from an inquiry."
        emptyAction={<Button asChild><Link href="/admin/inquiries">View inquiries</Link></Button>}
        columns={[
          { key: "number", header: "Proposal", sortValue: (row) => row.number, cell: (row) => row.number },
          { key: "client", header: "Client", cell: (row) => clients.find((client) => client.id === row.clientId)?.name ?? "—" },
          { key: "total", header: "Total", sortValue: (row) => quoteTotals(row.items, row.depositPercent).grandTotal, cell: (row) => <CurrencyDisplay value={quoteTotals(row.items, row.depositPercent).grandTotal} /> },
          { key: "status", header: "Status", sortValue: (row) => row.status, cell: (row) => <StatusBadge status={row.status} /> },
          { key: "updated", header: "Updated", sortValue: (row) => row.updatedAt, cell: (row) => formatDate(row.updatedAt) },
          { key: "actions", header: "Actions", cell: (row) => <Button size="sm" variant="outline" asChild><Link href={`/admin/proposals/${row.id}`}>Open</Link></Button> },
        ]}
      />
    </div>
  );
}

export function ProposalBuilder({ id }: { id: string }) {
  const proposal = useDemoStore((state) => state.proposals.find((item) => item.id === id));
  const inquiry = useDemoStore((state) => state.inquiries.find((item) => item.id === proposal?.inquiryId));
  const client = useDemoStore((state) => state.clients.find((item) => item.id === proposal?.clientId));
  const settings = useDemoStore((state) => state.settings);
  const updateProposal = useDemoStore((state) => state.updateProposal);
  const setProposalStatus = useDemoStore((state) => state.setProposalStatus);
  const convertProposalToBooking = useDemoStore((state) => state.convertProposalToBooking);
  const existingBooking = useDemoStore((state) => state.bookings.find((item) => item.proposalId === id));
  const router = useRouter();
  const [items, setItems] = useState<QuotationLine[]>(proposal?.items ?? []);
  const [deposit, setDeposit] = useState(proposal?.depositPercent ?? 50);
  const [notes, setNotes] = useState(proposal?.notes ?? "");
  const [pending, setPending] = useState<string | null>(null);

  if (!proposal) return <p>Proposal not found.</p>;
  const current = proposal;

  async function run(label: string, action: () => void) {
    setPending(label);
    await wait();
    action();
    setPending(null);
  }

  function persist(status?: ProposalStatus) {
    updateProposal(current.id, { items, depositPercent: deposit, notes });
    if (status) setProposalStatus(current.id, status);
  }

  return (
    <div className="space-y-6">
      <div className="no-print">
        <PageHeader
          eyebrow={proposal.number}
          title={client?.name ?? "Proposal"}
          description={inquiry ? `${inquiry.eventType} · ${formatDate(inquiry.eventDate)}` : proposal.status}
          actions={<StatusBadge status={proposal.status} />}
        />
        <div className="mt-4 flex flex-wrap gap-2">
          <Button disabled={pending != null} onClick={() => void run("save", () => { persist(current.status === "DRAFT" ? "DRAFT" : undefined); toast.success("Draft saved."); })}>{pending === "save" ? "Saving..." : "Save Draft"}</Button>
          <Button variant="outline" disabled={pending != null} onClick={() => void run("review", () => { persist("FOR APPROVAL"); toast.success("Submitted for approval."); })}>Submit for Approval</Button>
          <Button variant="outline" disabled={pending != null} onClick={() => void run("approve", () => { persist("APPROVED"); toast.success("Proposal approved."); })}>Approve</Button>
          <Button variant="outline" disabled={pending != null} onClick={() => void run("send", () => { persist("SENT"); toast.success("Proposal sent successfully (Demo Mode)."); })}>{pending === "send" ? "Sending..." : "Send Proposal"}</Button>
          <Button variant="outline" onClick={() => window.print()}>Print</Button>
          <Button variant="outline" disabled={pending != null} onClick={() => void run("accept", () => { persist("ACCEPTED"); toast.success("Proposal accepted."); })}>Accept Proposal</Button>
          <Button variant="outline" disabled={pending != null} onClick={() => void run("decline", () => { persist("DECLINED"); toast.success("Proposal declined."); })}>Decline Proposal</Button>
          <Button disabled={pending != null} onClick={() => void run("convert", () => {
            persist();
            const result = convertProposalToBooking(current.id);
            if (!result) return;
            toast.success(result.created ? "Booking created successfully." : "Booking already exists.");
            router.push(`/admin/bookings/${result.booking.id}`);
          })}>{existingBooking ? "View Booking" : pending === "convert" ? "Creating..." : "Convert to Booking"}</Button>
        </div>
      </div>
      <article className="print-root border border-stone-200 bg-white p-6">
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="font-display text-4xl">{settings.companyName}</p>
            <p className="text-sm text-muted-foreground">{settings.email} · {settings.phone}</p>
          </div>
          <div className="text-right text-sm">
            <p className="font-medium">{proposal.number}</p>
            <p>Valid until {formatDate(proposal.validUntil)}</p>
          </div>
        </header>
        <div className="mt-6">
          <QuotationEditor items={items} depositPercent={deposit} onItemsChange={setItems} onDepositChange={setDeposit} />
        </div>
        <label className="mt-6 block text-sm">
          Notes
          <Textarea className="mt-2" value={notes} onChange={(event) => setNotes(event.target.value)} />
        </label>
      </article>
    </div>
  );
}

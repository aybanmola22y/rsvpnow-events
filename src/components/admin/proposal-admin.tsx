"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { PageHeader } from "@/components/shared/chrome";
import { CurrencyDisplay } from "@/components/shared/currency";
import { StatusBadge } from "@/components/shared/status-badge";
import { QuotationEditor } from "@/components/admin/quotation-editor";
import { quoteTotals } from "@/lib/pricing";
import { PROPOSAL_STATUSES, type ProposalStatus, type QuotationLine } from "@/lib/types";
import { formatDate, formatLabel, formatPeso, wait } from "@/lib/format";
import { useDemoStore } from "@/lib/store/demo-store";
import { cn } from "@/lib/utils";

const pendingStatuses: ProposalStatus[] = ["DRAFT", "FOR APPROVAL", "APPROVED"];

const proposalFilters: { label: string; href: string; key: string }[] = [
  { label: "All", href: "/admin/proposals", key: "all" },
  { label: "Pending", href: "/admin/proposals?view=pending", key: "pending" },
  ...PROPOSAL_STATUSES.map((status) => ({
    label: status === "FOR APPROVAL" ? "For approval" : status.charAt(0) + status.slice(1).toLowerCase(),
    href: `/admin/proposals?status=${encodeURIComponent(status)}`,
    key: status,
  })),
];

export function ProposalAdminList() {
  const params = useSearchParams();
  const view = params.get("view");
  const status = params.get("status");
  const proposals = useDemoStore((state) => state.proposals);
  const clients = useDemoStore((state) => state.clients);
  const inquiries = useDemoStore((state) => state.inquiries);
  const [query, setQuery] = useState("");

  const priced = useMemo(
    () =>
      proposals.map((proposal) => ({
        proposal,
        total: quoteTotals(proposal.items, proposal.depositPercent).grandTotal,
        client: clients.find((client) => client.id === proposal.clientId),
        inquiry: inquiries.find((inquiry) => inquiry.id === proposal.inquiryId),
      })),
    [proposals, clients, inquiries],
  );

  const summary = useMemo(() => {
    const sum = (items: typeof priced) => items.reduce((total, item) => total + item.total, 0);
    const pending = priced.filter((item) => pendingStatuses.includes(item.proposal.status));
    const inPlay = priced.filter((item) => !["DECLINED", "ACCEPTED"].includes(item.proposal.status));
    const byStatus = PROPOSAL_STATUSES.map((item) => ({
      status: item,
      count: priced.filter((entry) => entry.proposal.status === item).length,
    })).filter((item) => item.count > 0);
    const waiting = priced
      .filter((item) => item.proposal.status === "SENT")
      .sort((a, b) => a.proposal.validUntil.localeCompare(b.proposal.validUntil));
    return {
      pending: pending.length,
      sent: priced.filter((item) => item.proposal.status === "SENT").length,
      accepted: priced.filter((item) => item.proposal.status === "ACCEPTED").length,
      inPlay: sum(inPlay),
      byStatus,
      waiting,
    };
  }, [priced]);

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return priced
      .filter((item) => {
        if (view === "pending") return pendingStatuses.includes(item.proposal.status);
        if (status) return item.proposal.status === status;
        return true;
      })
      .filter((item) => {
        if (!needle) return true;
        return `${item.proposal.number} ${item.proposal.status} ${item.client?.name ?? ""} ${item.inquiry?.eventType ?? ""} ${item.inquiry?.fullName ?? ""}`
          .toLowerCase()
          .includes(needle);
      })
      .sort((a, b) => b.proposal.updatedAt.localeCompare(a.proposal.updatedAt));
  }, [priced, view, status, query]);

  const titles: Record<string, string> = {
    pending: "Pending proposals",
    DRAFT: "Drafts",
    "FOR APPROVAL": "For approval",
    APPROVED: "Approved",
    SENT: "Sent",
    ACCEPTED: "Accepted",
    DECLINED: "Declined",
    REVISED: "Revised",
  };
  const title = view === "pending" ? titles.pending : status ? titles[status] ?? "Proposals" : "Proposals";
  const activeKey = view === "pending" ? "pending" : status || "all";
  const peak = Math.max(...summary.byStatus.map((item) => item.count), 1);

  return (
    <div className="min-w-0 space-y-5">
      <PageHeader
        eyebrow="Sales"
        title={title}
        description={`${formatPeso(summary.inPlay)} still being decided. Accepted and declined quotes sit outside that figure.`}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Link href="/admin/proposals?view=pending" className="rounded-lg border border-black/5 bg-white p-5 shadow-sm transition hover:border-black/10">
          <p className="text-[11px] font-medium text-neutral-400">Pending</p>
          <p className="mt-3 text-4xl font-bold tracking-tight text-neutral-950">{summary.pending}</p>
          <p className="mt-4 border-t border-neutral-100 pt-3 text-xs text-neutral-400">Drafts not yet sent</p>
        </Link>
        <Link href="/admin/proposals?status=SENT" className="rounded-lg border border-black/5 bg-white p-5 shadow-sm transition hover:border-black/10">
          <p className="text-[11px] font-medium text-neutral-400">Sent</p>
          <p className="mt-3 text-4xl font-bold tracking-tight text-neutral-950">{summary.sent}</p>
          <p className="mt-4 border-t border-neutral-100 pt-3 text-xs text-neutral-400">With the client</p>
        </Link>
        <Link href="/admin/proposals?status=ACCEPTED" className="rounded-lg border border-black/5 bg-white p-5 shadow-sm transition hover:border-black/10">
          <p className="text-[11px] font-medium text-neutral-400">Accepted</p>
          <p className="mt-3 text-4xl font-bold tracking-tight text-[#1f8a4c]">{summary.accepted}</p>
          <p className="mt-4 border-t border-neutral-100 pt-3 text-xs text-neutral-400">Ready for the book</p>
        </Link>
        <article className="rounded-lg border border-black/5 bg-white p-5 shadow-sm">
          <p className="text-[11px] font-medium text-neutral-400">In play</p>
          <p className="mt-3 text-2xl font-bold tracking-tight text-neutral-950 tabular-nums">{formatPeso(summary.inPlay)}</p>
          <p className="mt-4 border-t border-neutral-100 pt-3 text-xs text-neutral-400">Open quotations</p>
        </article>
      </div>

      <div className="flex flex-wrap gap-2">
        {proposalFilters.map((filter) => (
          <Link
            key={filter.key}
            href={filter.href}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium",
              activeKey === filter.key ? "bg-neutral-950 text-white" : "border border-black/10 bg-white text-neutral-600 hover:text-neutral-950",
            )}
          >
            {filter.label}
          </Link>
        ))}
      </div>

      <div className="grid min-w-0 items-start gap-4 xl:grid-cols-[1.6fr_0.85fr]">
        <section className="min-w-0 rounded-lg border border-black/5 bg-white shadow-sm">
          <header className="flex flex-col gap-3 border-b border-neutral-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-neutral-950">Quotations</h2>
              <p className="mt-0.5 text-xs text-neutral-400">{rows.length} shown, latest update first.</p>
            </div>
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search client or proposal"
              aria-label="Search proposals"
              className="h-10 w-full border-black/10 bg-white shadow-none sm:max-w-xs"
            />
          </header>
          {rows.length === 0 ? (
            <div className="px-5 py-10">
              <p className="text-sm text-neutral-500">No proposals match this view.</p>
              <Button asChild variant="outline" className="mt-4"><Link href="/admin/proposals">Show all</Link></Button>
            </div>
          ) : (
            <ul>
              {rows.map(({ proposal, total, client, inquiry }) => (
                <li key={proposal.id} className="border-b border-neutral-100 last:border-0">
                  <Link href={`/admin/proposals/${proposal.id}`} className="grid gap-3 px-5 py-4 hover:bg-neutral-50 sm:grid-cols-[1fr_auto] sm:items-center">
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium text-[#1f8a4c]">{inquiry?.eventType ?? "Quotation"}</p>
                      <p className="mt-1 truncate text-sm font-semibold text-neutral-950">{client?.name ?? "Client"}</p>
                      <p className="mt-0.5 truncate text-sm text-neutral-500">{proposal.number} · valid until {formatDate(proposal.validUntil)}</p>
                      <p className="mt-1 text-xs text-neutral-400">Updated {formatDate(proposal.updatedAt)}</p>
                    </div>
                    <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                      <p className="text-base font-semibold text-neutral-950 tabular-nums">{formatPeso(total)}</p>
                      <StatusBadge status={proposal.status} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="grid min-w-0 gap-4">
          <section className="rounded-lg border border-black/5 bg-white p-5 shadow-sm">
            <h2 className="text-[11px] font-semibold text-neutral-500">By status</h2>
            <ul className="mt-4 space-y-3">
              {summary.byStatus.map((item) => (
                <li key={item.status}>
                  <Link href={`/admin/proposals?status=${encodeURIComponent(item.status)}`} className="block">
                    <div className="flex items-baseline justify-between gap-3 text-sm">
                      <span className="font-medium normal-case text-neutral-950">{formatLabel(item.status)}</span>
                      <span className="text-neutral-500 tabular-nums">{item.count}</span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-neutral-100">
                      <div className="h-full rounded-full bg-[#c4454d]" style={{ width: `${(item.count / peak) * 100}%` }} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
          <section className="rounded-lg border border-black/5 bg-white shadow-sm">
            <header className="px-5 pt-5">
              <h2 className="text-[11px] font-semibold text-neutral-500">Out with the client</h2>
              <p className="mt-1 text-xs text-neutral-400">Sent quotes, soonest expiry first.</p>
            </header>
            <ul className="mt-2">
              {summary.waiting.length === 0 ? (
                <li className="px-5 py-6 text-sm text-neutral-500">Nothing is waiting on a reply.</li>
              ) : (
                summary.waiting.map(({ proposal, client, total }) => (
                  <li key={proposal.id} className="border-b border-neutral-100 last:border-0">
                    <Link href={`/admin/proposals/${proposal.id}`} className="block px-5 py-3.5 hover:bg-neutral-50">
                      <p className="text-sm font-medium text-neutral-950">{client?.name ?? "Client"}</p>
                      <p className="mt-1 text-xs text-neutral-400">Valid until {formatDate(proposal.validUntil)} · {formatPeso(total)}</p>
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

export function ProposalBuilder({ id }: { id: string }) {
  const proposal = useDemoStore((state) => state.proposals.find((item) => item.id === id));
  const inquiry = useDemoStore((state) => state.inquiries.find((item) => item.id === proposal?.inquiryId));
  const client = useDemoStore((state) => state.clients.find((item) => item.id === proposal?.clientId));
  const settings = useDemoStore((state) => state.settings);
  const updateProposal = useDemoStore((state) => state.updateProposal);
  const deleteProposal = useDemoStore((state) => state.deleteProposal);
  const setProposalStatus = useDemoStore((state) => state.setProposalStatus);
  const convertProposalToBooking = useDemoStore((state) => state.convertProposalToBooking);
  const existingBooking = useDemoStore((state) => state.bookings.find((item) => item.proposalId === id));
  const router = useRouter();
  const [items, setItems] = useState<QuotationLine[]>(proposal?.items ?? []);
  const [deposit, setDeposit] = useState(proposal?.depositPercent ?? 50);
  const [notes, setNotes] = useState(proposal?.notes ?? "");
  const [pending, setPending] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

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

  const status = current.status;
  const editing =
    status === "DRAFT" || status === "REVISED" || status === "FOR APPROVAL" || status === "APPROVED";
  const waitingOnCustomer = status === "SENT";
  const won = status === "ACCEPTED";
  const lost = status === "DECLINED";

  const nextStep = editing
    ? "1. Edit the prices → 2. Save → 3. Send to the customer"
    : waitingOnCustomer
      ? "Waiting on the customer. Mark Accepted or Declined when they reply."
      : won
        ? existingBooking
          ? "Proposal accepted. Open the booking when you need it."
          : "Proposal accepted. Convert it to a booking next."
        : lost
          ? "Customer declined. Reopen as draft if you want to revise and resend."
          : "";

  return (
    <div className="space-y-6">
      <div className="no-print">
        <PageHeader
          eyebrow={proposal.number}
          title={client?.name ?? "Proposal"}
          description={inquiry ? `${inquiry.eventType} · ${formatDate(inquiry.eventDate)}` : proposal.status}
          actions={<StatusBadge status={proposal.status} />}
        />
        <p className="mt-3 text-sm text-neutral-500">{nextStep}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {editing ? (
            <>
              <Button
                disabled={pending != null}
                onClick={() =>
                  void run("save", () => {
                    persist(status === "DRAFT" || status === "REVISED" ? status : "DRAFT");
                    toast.success("Saved.");
                  })
                }
              >
                {pending === "save" ? "Saving…" : "Save"}
              </Button>
              <Button
                disabled={pending != null}
                onClick={() =>
                  void run("send", () => {
                    persist("SENT");
                    toast.success("Marked as sent to the customer.");
                  })
                }
              >
                {pending === "send" ? "Sending…" : "Send to customer"}
              </Button>
              <Button variant="outline" onClick={() => window.print()}>
                Print
              </Button>
            </>
          ) : null}

          {waitingOnCustomer ? (
            <>
              <Button
                disabled={pending != null}
                onClick={() =>
                  void run("accept", () => {
                    persist("ACCEPTED");
                    toast.success("Marked as accepted.");
                  })
                }
              >
                {pending === "accept" ? "Saving…" : "Customer accepted"}
              </Button>
              <Button
                variant="outline"
                disabled={pending != null}
                onClick={() =>
                  void run("decline", () => {
                    persist("DECLINED");
                    toast.success("Marked as declined.");
                  })
                }
              >
                Customer declined
              </Button>
              <Button
                variant="outline"
                disabled={pending != null}
                onClick={() =>
                  void run("revise", () => {
                    persist("DRAFT");
                    toast.success("Reopened as draft.");
                  })
                }
              >
                Edit again
              </Button>
              <Button variant="outline" onClick={() => window.print()}>
                Print
              </Button>
            </>
          ) : null}

          {won ? (
            <>
              <Button
                disabled={pending != null}
                onClick={() =>
                  void run("convert", () => {
                    persist();
                    const result = convertProposalToBooking(current.id);
                    if (!result) return;
                    toast.success(result.created ? "Booking created." : "Opening existing booking.");
                    router.push(`/admin/bookings/${result.booking.id}`);
                  })
                }
              >
                {existingBooking
                  ? "View booking"
                  : pending === "convert"
                    ? "Creating…"
                    : "Convert to booking"}
              </Button>
              <Button variant="outline" onClick={() => window.print()}>
                Print
              </Button>
            </>
          ) : null}

          {lost ? (
            <>
              <Button
                disabled={pending != null}
                onClick={() =>
                  void run("reopen", () => {
                    persist("DRAFT");
                    toast.success("Reopened as draft.");
                  })
                }
              >
                Reopen as draft
              </Button>
              <Button variant="outline" onClick={() => window.print()}>
                Print
              </Button>
            </>
          ) : null}

          <Button
            variant="destructive"
            disabled={pending != null}
            onClick={() => setDeleteOpen(true)}
          >
            Delete
          </Button>
        </div>
      </div>
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`Delete ${current.number}?`}
        description={
          existingBooking
            ? "This permanently removes the proposal. Linked bookings stay, but will no longer point to this proposal."
            : "This permanently removes the proposal. This cannot be undone."
        }
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          deleteProposal(current.id);
          toast.success(`Deleted ${current.number}.`);
          setDeleteOpen(false);
          router.replace("/admin/proposals");
        }}
      />
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

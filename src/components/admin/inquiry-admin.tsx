"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/shared/chrome";
import { CurrencyDisplay } from "@/components/shared/currency";
import { StatusBadge } from "@/components/shared/status-badge";
import { INQUIRY_STATUSES, type InquiryStatus } from "@/lib/types";
import { formatDate, formatLabel, formatPeso, formatTime, wait } from "@/lib/format";
import { useDemoStore } from "@/lib/store/demo-store";
import { cn } from "@/lib/utils";

const filters: { label: string; value: string }[] = [
  { label: "All", value: "" },
  { label: "New", value: "NEW" },
  { label: "Contacted", value: "CONTACTED" },
  { label: "For review", value: "FOR REVIEW" },
  { label: "Preparing", value: "PROPOSAL PREPARATION" },
  { label: "Sent", value: "PROPOSAL SENT" },
  { label: "Accepted", value: "ACCEPTED" },
  { label: "Declined", value: "DECLINED" },
  { label: "Archived", value: "ARCHIVED" },
];

export function InquiryAdminList() {
  const params = useSearchParams();
  const status = params.get("status");
  const inquiries = useDemoStore((state) => state.inquiries);
  const venues = useDemoStore((state) => state.venues);
  const [query, setQuery] = useState("");
  const today = new Date().toISOString().slice(0, 10);

  const summary = useMemo(() => {
    const count = (values: InquiryStatus[]) => inquiries.filter((item) => values.includes(item.status)).length;
    const open = inquiries.filter((item) => item.status !== "ARCHIVED" && item.status !== "DECLINED");
    const byStatus = INQUIRY_STATUSES.map((item) => ({
      status: item,
      count: inquiries.filter((inquiry) => inquiry.status === item).length,
    })).filter((item) => item.count > 0);
    const upcoming = [...open].filter((item) => item.eventDate >= today).sort((a, b) => a.eventDate.localeCompare(b.eventDate));
    return {
      fresh: count(["NEW"]),
      review: count(["FOR REVIEW"]),
      sent: count(["PROPOSAL SENT"]),
      accepted: count(["ACCEPTED"]),
      pipeline: open.reduce((sum, item) => sum + item.budget, 0),
      byStatus,
      upcoming,
    };
  }, [inquiries, today]);

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return [...inquiries]
      .filter((item) => !status || item.status === status)
      .filter((item) => {
        if (!needle) return true;
        const venue = venues.find((entry) => entry.id === item.venuePreference);
        return `${item.number} ${item.fullName} ${item.company} ${item.eventType} ${item.email} ${item.assignedStaff} ${venue?.name ?? item.venueName}`
          .toLowerCase()
          .includes(needle);
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [inquiries, venues, status, query]);

  const titles: Record<string, string> = {
    NEW: "New inquiries",
    CONTACTED: "Contacted",
    "FOR REVIEW": "For review",
    "PROPOSAL PREPARATION": "Preparing a proposal",
    "PROPOSAL SENT": "Proposal sent",
    ACCEPTED: "Accepted",
    DECLINED: "Declined",
    ARCHIVED: "Archived inquiries",
  };
  const title = status ? titles[status] ?? "Inquiries" : "All inquiries";
  const peak = Math.max(...summary.byStatus.map((item) => item.count), 1);

  return (
    <div className="min-w-0 space-y-5">
      <PageHeader
        eyebrow="Inquiries"
        title={title}
        description={`${formatPeso(summary.pipeline)} still in play across requests that have not been declined or archived.`}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Link href="/admin/inquiries?status=NEW" className="rounded-lg border border-black/5 bg-white p-5 shadow-sm transition hover:border-black/10">
          <p className="text-[11px] font-medium text-neutral-400">New</p>
          <p className="mt-3 text-4xl font-bold tracking-tight text-neutral-950">{summary.fresh}</p>
          <p className="mt-4 border-t border-neutral-100 pt-3 text-xs text-neutral-400">Waiting on a first reply</p>
        </Link>
        <Link href="/admin/inquiries?status=FOR REVIEW" className="rounded-lg border border-black/5 bg-white p-5 shadow-sm transition hover:border-black/10">
          <p className="text-[11px] font-medium text-neutral-400">For review</p>
          <p className="mt-3 text-4xl font-bold tracking-tight text-neutral-950">{summary.review}</p>
          <p className="mt-4 border-t border-neutral-100 pt-3 text-xs text-neutral-400">Needs a look before the quote</p>
        </Link>
        <Link href="/admin/inquiries?status=PROPOSAL SENT" className="rounded-lg border border-black/5 bg-white p-5 shadow-sm transition hover:border-black/10">
          <p className="text-[11px] font-medium text-neutral-400">Proposal sent</p>
          <p className="mt-3 text-4xl font-bold tracking-tight text-neutral-950">{summary.sent}</p>
          <p className="mt-4 border-t border-neutral-100 pt-3 text-xs text-neutral-400">Waiting on a yes</p>
        </Link>
        <Link href="/admin/inquiries?status=ACCEPTED" className="rounded-lg border border-black/5 bg-white p-5 shadow-sm transition hover:border-black/10">
          <p className="text-[11px] font-medium text-neutral-400">Accepted</p>
          <p className="mt-3 text-4xl font-bold tracking-tight text-[#1f8a4c]">{summary.accepted}</p>
          <p className="mt-4 border-t border-neutral-100 pt-3 text-xs text-neutral-400">Ready to become a booking</p>
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => {
          const active = filter.value ? status === filter.value : !status;
          const count = filter.value ? inquiries.filter((item) => item.status === filter.value).length : inquiries.length;
          return (
            <Link
              key={filter.label}
              href={filter.value ? `/admin/inquiries?status=${encodeURIComponent(filter.value)}` : "/admin/inquiries"}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium",
                active ? "bg-neutral-950 text-white" : "border border-black/10 bg-white text-neutral-600 hover:text-neutral-950",
              )}
            >
              {filter.label} {count}
            </Link>
          );
        })}
      </div>

      <div className="grid min-w-0 items-start gap-4 xl:grid-cols-[1.6fr_0.85fr]">
        <section className="min-w-0 rounded-lg border border-black/5 bg-white shadow-sm">
          <header className="flex flex-col gap-3 border-b border-neutral-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-neutral-950">Requests</h2>
              <p className="mt-0.5 text-xs text-neutral-400">{rows.length} shown, newest first.</p>
            </div>
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name, event, or email"
              aria-label="Search inquiries"
              className="h-10 w-full border-black/10 bg-white shadow-none sm:max-w-xs"
            />
          </header>
          {rows.length === 0 ? (
            <div className="px-5 py-10">
              <p className="text-sm text-neutral-500">No inquiries match this view.</p>
              <Button asChild variant="outline" className="mt-4">
                <Link href="/admin/inquiries">Show all</Link>
              </Button>
            </div>
          ) : (
            <ul>
              {rows.map((inquiry) => {
                const venue = venues.find((item) => item.id === inquiry.venuePreference);
                return (
                  <li key={inquiry.id} className="border-b border-neutral-100 last:border-0">
                    <Link href={`/admin/inquiries/${inquiry.id}`} className="grid gap-3 px-5 py-4 hover:bg-neutral-50 sm:grid-cols-[1fr_auto] sm:items-center">
                      <div className="min-w-0">
                        <p className="text-[11px] font-medium text-[#1f8a4c]">{inquiry.eventType}</p>
                        <p className="mt-1 truncate text-sm font-semibold text-neutral-950">{inquiry.fullName}</p>
                        <p className="mt-0.5 truncate text-sm text-neutral-500">
                          {formatDate(inquiry.eventDate)} · {inquiry.guestCount} guests · {venue?.name || inquiry.venueName || "Venue not chosen"}
                        </p>
                        <p className="mt-1 text-xs text-neutral-400">
                          {inquiry.assignedStaff || "Unassigned"} · submitted {formatDate(inquiry.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                        <p className="text-base font-semibold text-neutral-950 tabular-nums">{formatPeso(inquiry.budget)}</p>
                        <StatusBadge status={inquiry.status} />
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <div className="grid min-w-0 gap-4">
          <section className="rounded-lg border border-black/5 bg-white p-5 shadow-sm">
            <h2 className="text-[11px] font-semibold text-neutral-500">By status</h2>
            <ul className="mt-4 space-y-3">
              {summary.byStatus.map((item) => (
                <li key={item.status}>
                  <Link href={`/admin/inquiries?status=${encodeURIComponent(item.status)}`} className="block">
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
              <h2 className="text-[11px] font-semibold text-neutral-500">Coming up</h2>
              <p className="mt-1 text-xs text-neutral-400">Open requests whose date is still ahead.</p>
            </header>
            <ul className="mt-2">
              {summary.upcoming.length === 0 ? (
                <li className="px-5 py-6 text-sm text-neutral-500">Nothing dated ahead of today.</li>
              ) : (
                summary.upcoming.slice(0, 6).map((inquiry) => (
                  <li key={inquiry.id} className="border-b border-neutral-100 last:border-0">
                    <Link href={`/admin/inquiries/${inquiry.id}`} className="block px-5 py-3.5 hover:bg-neutral-50">
                      <p className="text-[11px] font-medium text-[#1f8a4c]">{inquiry.eventType}</p>
                      <p className="mt-1 text-sm font-medium text-neutral-950">{inquiry.fullName}</p>
                      <p className="mt-1 text-xs text-neutral-400">{formatDate(inquiry.eventDate)} · {inquiry.guestCount} guests</p>
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

export function InquiryAdminDetail({ id }: { id: string }) {
  const inquiry = useDemoStore((state) => state.inquiries.find((item) => item.id === id));
  const venues = useDemoStore((state) => state.venues);
  const packages = useDemoStore((state) => state.packages);
  const services = useDemoStore((state) => state.services);
  const users = useDemoStore((state) => state.users);
  const proposals = useDemoStore((state) => state.proposals);
  const setInquiryStatus = useDemoStore((state) => state.setInquiryStatus);
  const assignInquiry = useDemoStore((state) => state.assignInquiry);
  const createProposalFromInquiry = useDemoStore((state) => state.createProposalFromInquiry);
  const router = useRouter();
  const [statusOpen, setStatusOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [status, setStatus] = useState<InquiryStatus>(inquiry?.status ?? "NEW");
  const [staff, setStaff] = useState(inquiry?.assignedStaff || users[0]?.name || "");
  const [pending, setPending] = useState(false);
  if (!inquiry) return <p>Inquiry not found.</p>;
  const record = inquiry;
  const existing = proposals.find((item) => item.inquiryId === record.id);
  const venue = venues.find((item) => item.id === inquiry.venuePreference);
  const eventPackage = packages.find((item) => item.id === inquiry.packageId);

  async function createProposal() {
    setPending(true);
    await wait();
    const result = createProposalFromInquiry(record.id);
    setPending(false);
    if (!result) return;
    toast.success(result.created ? "Proposal created." : "Opening the existing proposal.");
    router.push(`/admin/proposals/${result.proposal.id}`);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={inquiry.number}
        title={inquiry.fullName}
        description={`${inquiry.eventType} · ${formatDate(inquiry.eventDate)}`}
        actions={
          <>
            <Button variant="outline" onClick={() => { setStatus(inquiry.status); setStatusOpen(true); }}>Edit Status</Button>
            <Button disabled={pending} onClick={() => void createProposal()}>{pending ? "Creating..." : existing ? "Open Proposal" : "Create Proposal"}</Button>
            <Button variant="outline" onClick={() => setAssignOpen(true)}>Assign Staff</Button>
            <Button variant="outline" onClick={() => { setInquiryStatus(inquiry.id, inquiry.status === "ARCHIVED" ? "NEW" : "ARCHIVED"); toast.success(inquiry.status === "ARCHIVED" ? "Inquiry restored." : "Inquiry archived."); }}>{inquiry.status === "ARCHIVED" ? "Restore" : "Archive"}</Button>
          </>
        }
      />
      <div className="grid gap-4 border border-stone-200 bg-white p-5 md:grid-cols-2">
        <Info label="Status" value={<StatusBadge status={inquiry.status} />} />
        <Info label="Company" value={inquiry.company || "—"} />
        <Info label="Email" value={inquiry.email} />
        <Info label="Phone" value={inquiry.phone} />
        <Info label="Schedule" value={`${formatTime(inquiry.startTime)} – ${formatTime(inquiry.endTime)}`} />
        <Info label="Guests" value={String(inquiry.guestCount)} />
        <Info label="Venue" value={venue?.name || inquiry.venueName || inquiry.venuePreference} />
        <Info label="Address" value={inquiry.venueAddress || "—"} />
        <Info label="Package" value={eventPackage?.name || "Not selected"} />
        <Info label="Budget" value={<CurrencyDisplay value={inquiry.budget} />} />
        <Info label="Theme" value={inquiry.theme || "—"} />
        <Info label="Assigned" value={inquiry.assignedStaff || "Unassigned"} />
        <div className="md:col-span-2"><Info label="Services" value={services.filter((service) => inquiry.serviceIds.includes(service.id)).map((service) => service.name).join(", ") || "None"} /></div>
        <div className="md:col-span-2"><Info label="Special requests" value={inquiry.specialRequests || "None"} /></div>
      </div>
      <Dialog open={statusOpen} onOpenChange={setStatusOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit status</DialogTitle></DialogHeader>
          <Select value={status} onValueChange={(value) => setStatus(value as InquiryStatus)}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>{INQUIRY_STATUSES.map((item) => <SelectItem key={item} value={item}>{formatLabel(item)}</SelectItem>)}</SelectContent>
          </Select>
          <DialogFooter>
            <Button onClick={() => { setInquiryStatus(inquiry.id, status); toast.success("Inquiry status updated."); setStatusOpen(false); }}>Save status</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Assign staff</DialogTitle></DialogHeader>
          <Select value={staff} onValueChange={setStaff}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>{users.map((user) => <SelectItem key={user.id} value={user.name}>{user.name}</SelectItem>)}</SelectContent>
          </Select>
          <DialogFooter>
            <Button onClick={() => { assignInquiry(inquiry.id, staff); toast.success("Staff assigned."); setAssignOpen(false); }}>Assign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="mt-1 text-sm">{value}</div>
    </div>
  );
}

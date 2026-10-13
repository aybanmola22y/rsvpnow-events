"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { INQUIRY_STATUSES, type InquiryStatus } from "@/lib/types";
import { formatDate, formatTime, wait } from "@/lib/format";
import { useDemoStore } from "@/lib/store/demo-store";

export function InquiryAdminList() {
  const params = useSearchParams();
  const status = params.get("status");
  const inquiries = useDemoStore((state) => state.inquiries);
  const rows = inquiries.filter((item) => (status ? item.status === status : true));
  const title = status === "NEW" ? "New inquiries" : status === "ARCHIVED" ? "Archived inquiries" : "All inquiries";

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Inquiries" title={title} description="Requests from the website and the event builder." />
      <DataTable
        rows={rows}
        rowKey={(row) => row.id}
        getSearchText={(row) => `${row.number} ${row.fullName} ${row.eventType} ${row.email}`}
        searchPlaceholder="Search inquiries"
        emptyTitle="No inquiries found"
        emptyDescription="New requests from the public site will appear here."
        emptyAction={<Button asChild variant="outline"><Link href="/">Open the website</Link></Button>}
        columns={[
          { key: "number", header: "Inquiry Number", sortValue: (row) => row.number, cell: (row) => row.number },
          { key: "client", header: "Client", sortValue: (row) => row.fullName, cell: (row) => row.fullName },
          { key: "event", header: "Event", sortValue: (row) => row.eventType, cell: (row) => row.eventType },
          { key: "date", header: "Event Date", sortValue: (row) => row.eventDate, cell: (row) => formatDate(row.eventDate) },
          { key: "guests", header: "Guests", sortValue: (row) => row.guestCount, cell: (row) => row.guestCount },
          { key: "budget", header: "Budget", sortValue: (row) => row.budget, cell: (row) => <CurrencyDisplay value={row.budget} /> },
          { key: "status", header: "Status", sortValue: (row) => row.status, cell: (row) => <StatusBadge status={row.status} /> },
          { key: "submitted", header: "Date Submitted", sortValue: (row) => row.createdAt, cell: (row) => formatDate(row.createdAt) },
          { key: "actions", header: "Actions", cell: (row) => <Button size="sm" variant="outline" asChild><Link href={`/admin/inquiries/${row.id}`}>Open</Link></Button> },
        ]}
      />
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
            <SelectContent>{INQUIRY_STATUSES.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
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

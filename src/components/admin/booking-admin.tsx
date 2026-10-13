"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/chrome";
import { CurrencyDisplay } from "@/components/shared/currency";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { RecordPaymentDialog } from "@/components/admin/payment-dialog";
import { BOOKING_STATUSES, type Booking, type BookingStatus } from "@/lib/types";
import { formatDate, formatDateTime, formatTime } from "@/lib/format";
import { useDemoStore } from "@/lib/store/demo-store";

export function BookingAdminList() {
  const params = useSearchParams();
  const status = params.get("status");
  const payment = params.get("payment");
  const bookings = useDemoStore((state) => state.bookings);
  const clients = useDemoStore((state) => state.clients);
  const rows = bookings.filter((booking) => {
    if (status && booking.status !== status) return false;
    if (payment === "outstanding" && !(booking.paymentStatus === "Unpaid" || booking.paymentStatus === "Partial")) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Events" title="Bookings" description="Held dates, balances, and event status." />
      <DataTable
        rows={rows}
        rowKey={(row) => row.id}
        getSearchText={(row) => `${row.number} ${row.eventName} ${row.venueName}`}
        searchPlaceholder="Search bookings"
        emptyTitle="No bookings scheduled"
        emptyDescription="Convert a proposal or clear the filters."
        emptyAction={<Button asChild variant="outline"><Link href="/admin/proposals">View proposals</Link></Button>}
        columns={[
          { key: "number", header: "Booking Number", sortValue: (row) => row.number, cell: (row) => row.number },
          { key: "client", header: "Client", cell: (row) => clients.find((client) => client.id === row.clientId)?.name ?? "—" },
          { key: "event", header: "Event", sortValue: (row) => row.eventName, cell: (row) => row.eventName },
          { key: "venue", header: "Venue", sortValue: (row) => row.venueName, cell: (row) => row.venueName },
          { key: "date", header: "Date", sortValue: (row) => row.eventDate, cell: (row) => formatDate(row.eventDate) },
          { key: "total", header: "Total", sortValue: (row) => row.total, cell: (row) => <CurrencyDisplay value={row.total} /> },
          { key: "pay", header: "Payment Status", cell: (row) => <StatusBadge status={row.paymentStatus} /> },
          { key: "status", header: "Booking Status", cell: (row) => <StatusBadge status={row.status} /> },
          { key: "actions", header: "Actions", cell: (row) => <Button size="sm" variant="outline" asChild><Link href={`/admin/bookings/${row.id}`}>Open</Link></Button> },
        ]}
      />
    </div>
  );
}

export function BookingAdminDetail({ id }: { id: string }) {
  const booking = useDemoStore((state) => state.bookings.find((item) => item.id === id));
  const client = useDemoStore((state) => state.clients.find((item) => item.id === booking?.clientId));
  const services = useDemoStore((state) => state.services);
  const paymentList = useDemoStore((state) => state.payments);
  const activityList = useDemoStore((state) => state.activity);
  const payments = useMemo(() => paymentList.filter((item) => item.bookingId === id), [paymentList, id]);
  const activity = useMemo(() => activityList.filter((item) => item.entityId === id), [activityList, id]);
  const venues = useDemoStore((state) => state.venues);
  const updateBooking = useDemoStore((state) => state.updateBooking);
  const setBookingStatus = useDemoStore((state) => state.setBookingStatus);
  const [editOpen, setEditOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [status, setStatus] = useState<BookingStatus>(booking?.status ?? "Tentative");
  const [form, setForm] = useState<Booking | null>(booking ?? null);

  if (!booking || !form) return <p>Booking not found.</p>;

  return (
    <div className="space-y-6">
      <div className="no-print">
        <PageHeader
          eyebrow={booking.number}
          title={booking.eventName}
          description={`${client?.name ?? "Client"} · ${formatDate(booking.eventDate)}`}
          actions={
            <>
              <Button variant="outline" onClick={() => { setForm(booking); setEditOpen(true); }}>Edit Booking</Button>
              <Button variant="outline" onClick={() => setPayOpen(true)}>Record Payment</Button>
              <Button variant="outline" onClick={() => { setStatus(booking.status); setStatusOpen(true); }}>Change Status</Button>
              <Button variant="outline" onClick={() => window.print()}>Print Details</Button>
            </>
          }
        />
      </div>
      <Tabs defaultValue="overview">
        <TabsList variant="line" className="no-print h-auto w-full justify-start gap-6 rounded-none border-b border-stone-200 bg-transparent px-0 [&_[data-slot=tabs-trigger]]:rounded-none [&_[data-slot=tabs-trigger]]:px-0 [&_[data-slot=tabs-trigger]]:text-[11px] [&_[data-slot=tabs-trigger]]:tracking-[0.14em] [&_[data-slot=tabs-trigger]]:uppercase [&_[data-slot=tabs-trigger]]:after:bg-gold">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="border border-stone-200 bg-white p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <p>Client: {client?.name}</p>
            <p>Venue: {booking.venueName}</p>
            <p>When: {formatDate(booking.eventDate)} · {formatTime(booking.startTime)} – {formatTime(booking.endTime)}</p>
            <p>Guests: {booking.guestCount}</p>
            <p>Total: <CurrencyDisplay value={booking.total} /></p>
            <p>Paid: <CurrencyDisplay value={booking.paid} /></p>
            <p>Balance: <CurrencyDisplay value={Math.max(0, booking.total - booking.paid)} /></p>
            <p className="flex gap-2">Status <StatusBadge status={booking.status} /> <StatusBadge status={booking.paymentStatus} /></p>
            <p className="md:col-span-2">Notes: {booking.notes || "None"}</p>
          </div>
        </TabsContent>
        <TabsContent value="services" className="border border-stone-200 bg-white p-5">
          <ul className="space-y-2 text-sm">
            {services.filter((service) => booking.serviceIds.includes(service.id)).map((service) => (
              <li key={service.id}>{service.name} · <CurrencyDisplay value={service.price} /> · {service.pricingType}</li>
            ))}
            {booking.serviceIds.length === 0 ? <li>No services attached.</li> : null}
          </ul>
        </TabsContent>
        <TabsContent value="payments" className="border border-stone-200 bg-white p-5">
          {payments.length === 0 ? <p className="text-sm">No payments recorded.</p> : payments.map((payment) => (
            <div key={payment.id} className="flex justify-between border-b py-2 text-sm">
              <span>{payment.number} · {payment.method} · {formatDate(payment.date)}</span>
              <CurrencyDisplay value={payment.amount} />
            </div>
          ))}
        </TabsContent>
        <TabsContent value="activity" className="border border-stone-200 bg-white p-5">
          {activity.length === 0 ? <p className="text-sm">No activity yet.</p> : activity.map((entry) => (
            <div key={entry.id} className="border-b py-2 text-sm">
              <p>{entry.action}</p>
              <p className="text-xs text-muted-foreground">{entry.actor} · {formatDateTime(entry.createdAt)}</p>
            </div>
          ))}
        </TabsContent>
      </Tabs>
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit booking</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <Input value={form.eventName} onChange={(event) => setForm({ ...form, eventName: event.target.value })} />
            <Input type="date" value={form.eventDate} onChange={(event) => setForm({ ...form, eventDate: event.target.value })} />
            <div className="grid grid-cols-2 gap-2">
              <Input type="time" value={form.startTime} onChange={(event) => setForm({ ...form, startTime: event.target.value })} />
              <Input type="time" value={form.endTime} onChange={(event) => setForm({ ...form, endTime: event.target.value })} />
            </div>
            <Input type="number" value={form.guestCount} onChange={(event) => setForm({ ...form, guestCount: Number(event.target.value) })} />
            <Input type="number" value={form.total} onChange={(event) => setForm({ ...form, total: Number(event.target.value) })} />
            <Select value={form.venueId || "client"} onValueChange={(value) => {
              const venue = venues.find((item) => item.id === value);
              setForm({ ...form, venueId: value === "client" ? "" : value, venueName: venue?.name ?? form.venueName });
            }}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="client">Client venue</SelectItem>
                {venues.map((venue) => <SelectItem key={venue.id} value={venue.id}>{venue.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
          </div>
          <DialogFooter>
            <Button onClick={() => { updateBooking(booking.id, form); toast.success("Booking updated."); setEditOpen(false); }}>Save booking</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={statusOpen} onOpenChange={setStatusOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Change status</DialogTitle></DialogHeader>
          <Select value={status} onValueChange={(value) => setStatus(value as BookingStatus)}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>{BOOKING_STATUSES.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
          </Select>
          <DialogFooter>
            <Button onClick={() => { setBookingStatus(booking.id, status); toast.success("Booking status updated."); setStatusOpen(false); }}>Save status</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <RecordPaymentDialog open={payOpen} onOpenChange={setPayOpen} bookingId={booking.id} />
    </div>
  );
}

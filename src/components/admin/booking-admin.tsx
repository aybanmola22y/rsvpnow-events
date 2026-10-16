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
import { StatusBadge } from "@/components/shared/status-badge";
import { RecordPaymentDialog } from "@/components/admin/payment-dialog";
import { BOOKING_STATUSES, type Booking, type BookingStatus } from "@/lib/types";
import { formatDate, formatDateTime, formatLabel, formatPeso, formatTime } from "@/lib/format";
import { useDemoStore } from "@/lib/store/demo-store";
import { cn } from "@/lib/utils";

export function BookingAdminList() {
  const params = useSearchParams();
  const status = params.get("status");
  const payment = params.get("payment");
  const when = params.get("when");
  const bookings = useDemoStore((state) => state.bookings);
  const clients = useDemoStore((state) => state.clients);
  const [query, setQuery] = useState("");
  const today = new Date().toISOString().slice(0, 10);

  const summary = useMemo(() => {
    const ahead = bookings.filter((booking) => booking.eventDate >= today && booking.status !== "Cancelled" && booking.status !== "Completed");
    const confirmed = bookings.filter((booking) => booking.status === "Confirmed");
    const byStatus = BOOKING_STATUSES.map((item) => ({
      status: item,
      count: bookings.filter((booking) => booking.status === item).length,
    })).filter((item) => item.count > 0);
    return {
      confirmed: confirmed.length,
      tentative: bookings.filter((booking) => booking.status === "Tentative").length,
      ahead: ahead.length,
      held: confirmed.reduce((sum, booking) => sum + booking.total, 0),
      byStatus,
      upcoming: [...ahead].sort((a, b) => a.eventDate.localeCompare(b.eventDate)),
    };
  }, [bookings, today]);

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return [...bookings]
      .filter((booking) => {
        if (status && booking.status !== status) return false;
        if (payment === "outstanding" && !(booking.paymentStatus === "Unpaid" || booking.paymentStatus === "Partial")) return false;
        if (when === "upcoming" && !(booking.eventDate >= today && booking.status !== "Cancelled" && booking.status !== "Completed")) return false;
        return true;
      })
      .filter((booking) => {
        if (!needle) return true;
        const client = clients.find((item) => item.id === booking.clientId);
        return `${booking.number} ${booking.eventName} ${booking.venueName} ${booking.eventType} ${client?.name ?? ""}`.toLowerCase().includes(needle);
      })
      .sort((a, b) => a.eventDate.localeCompare(b.eventDate));
  }, [bookings, clients, status, payment, when, query, today]);

  const titles: Record<string, string> = {
    Confirmed: "Confirmed",
    Tentative: "Tentative",
    Ongoing: "Ongoing",
    Completed: "Completed",
    Cancelled: "Cancelled",
    upcoming: "Coming up",
    outstanding: "Outstanding balances",
  };
  const title = when === "upcoming" ? titles.upcoming : payment === "outstanding" ? titles.outstanding : status ? titles[status] ?? "Bookings" : "Bookings";
  const activeKey = when === "upcoming" ? "upcoming" : payment === "outstanding" ? "outstanding" : status || "all";
  const peak = Math.max(...summary.byStatus.map((item) => item.count), 1);
  const filters = [
    { label: "All", href: "/admin/bookings", key: "all" },
    { label: "Ahead", href: "/admin/bookings?when=upcoming", key: "upcoming" },
    { label: "Outstanding", href: "/admin/bookings?payment=outstanding", key: "outstanding" },
    ...BOOKING_STATUSES.map((item) => ({ label: item, href: `/admin/bookings?status=${encodeURIComponent(item)}`, key: item })),
  ];

  return (
    <div className="min-w-0 space-y-5">
      <PageHeader
        eyebrow="Events"
        title={title}
        description={`${formatPeso(summary.held)} is held on confirmed dates.`}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Link href="/admin/bookings?status=Confirmed" className="rounded-lg border border-black/5 bg-white p-5 shadow-sm transition hover:border-black/10">
          <p className="text-[11px] font-medium text-neutral-400">Confirmed</p>
          <p className="mt-3 text-4xl font-bold tracking-tight text-[#1f8a4c]">{summary.confirmed}</p>
          <p className="mt-4 border-t border-neutral-100 pt-3 text-xs text-neutral-400">Dates held on the book</p>
        </Link>
        <Link href="/admin/bookings?status=Tentative" className="rounded-lg border border-black/5 bg-white p-5 shadow-sm transition hover:border-black/10">
          <p className="text-[11px] font-medium text-neutral-400">Tentative</p>
          <p className="mt-3 text-4xl font-bold tracking-tight text-neutral-950">{summary.tentative}</p>
          <p className="mt-4 border-t border-neutral-100 pt-3 text-xs text-neutral-400">Held, not yet firm</p>
        </Link>
        <Link href="/admin/bookings?when=upcoming" className="rounded-lg border border-black/5 bg-white p-5 shadow-sm transition hover:border-black/10">
          <p className="text-[11px] font-medium text-neutral-400">Ahead</p>
          <p className="mt-3 text-4xl font-bold tracking-tight text-neutral-950">{summary.ahead}</p>
          <p className="mt-4 border-t border-neutral-100 pt-3 text-xs text-neutral-400">Still on the calendar</p>
        </Link>
        <article className="rounded-lg border border-black/5 bg-white p-5 shadow-sm">
          <p className="text-[11px] font-medium text-neutral-400">Confirmed value</p>
          <p className="mt-3 text-2xl font-bold tracking-tight text-neutral-950 tabular-nums">{formatPeso(summary.held)}</p>
          <p className="mt-4 border-t border-neutral-100 pt-3 text-xs text-neutral-400">Totals on confirmed bookings</p>
        </article>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
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
              <h2 className="text-sm font-semibold text-neutral-950">The book</h2>
              <p className="mt-0.5 text-xs text-neutral-400">{rows.length} shown, soonest date first.</p>
            </div>
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search event, client, or room"
              aria-label="Search bookings"
              className="h-10 w-full border-black/10 bg-white shadow-none sm:max-w-xs"
            />
          </header>
          {rows.length === 0 ? (
            <div className="px-5 py-10">
              <p className="text-sm text-neutral-500">No bookings match this view.</p>
              <Button asChild variant="outline" className="mt-4"><Link href="/admin/bookings">Show all</Link></Button>
            </div>
          ) : (
            <ul>
              {rows.map((booking) => {
                const client = clients.find((item) => item.id === booking.clientId);
                return (
                  <li key={booking.id} className="border-b border-neutral-100 last:border-0">
                    <Link href={`/admin/bookings/${booking.id}`} className="grid gap-3 px-5 py-4 hover:bg-neutral-50 sm:grid-cols-[1fr_auto] sm:items-center">
                      <div className="min-w-0">
                        <p className="text-[11px] font-medium text-[#1f8a4c]">{booking.eventType}</p>
                        <p className="mt-1 truncate text-sm font-semibold text-neutral-950">{booking.eventName}</p>
                        <p className="mt-0.5 truncate text-sm text-neutral-500">
                          {formatDate(booking.eventDate)} · {booking.guestCount} guests · {booking.venueName}
                        </p>
                        <p className="mt-1 text-xs text-neutral-400">
                          {client?.name ?? "Client"} · {formatTime(booking.startTime)}–{formatTime(booking.endTime)}
                        </p>
                      </div>
                      <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                        <p className="text-base font-semibold text-neutral-950 tabular-nums">{formatPeso(booking.total)}</p>
                        <div className="flex flex-wrap justify-end gap-1.5">
                          <StatusBadge status={booking.status} />
                          <StatusBadge status={booking.paymentStatus} />
                        </div>
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
                  <Link href={`/admin/bookings?status=${encodeURIComponent(item.status)}`} className="block">
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
              <p className="mt-1 text-xs text-neutral-400">Dates still ahead, not cancelled.</p>
            </header>
            <ul className="mt-2">
              {summary.upcoming.length === 0 ? (
                <li className="px-5 py-6 text-sm text-neutral-500">Nothing is dated ahead of today.</li>
              ) : (
                summary.upcoming.slice(0, 6).map((booking) => (
                  <li key={booking.id} className="border-b border-neutral-100 last:border-0">
                    <Link href={`/admin/bookings/${booking.id}`} className="block px-5 py-3.5 hover:bg-neutral-50">
                      <p className="text-[11px] font-medium text-[#1f8a4c]">{booking.eventType}</p>
                      <p className="mt-1 text-sm font-medium text-neutral-950">{booking.eventName}</p>
                      <p className="mt-1 text-xs text-neutral-400">{formatDate(booking.eventDate)} · {booking.venueName}</p>
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

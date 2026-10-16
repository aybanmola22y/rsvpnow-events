"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import { adminControlClass, Field, PageHeader } from "@/components/shared/chrome";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { CurrencyDisplay } from "@/components/shared/currency";
import { ImageUploader } from "@/components/shared/editors";
import { StatusBadge } from "@/components/shared/status-badge";
import { RecordPaymentDialog } from "@/components/admin/payment-dialog";
import { CLIENT_STATUSES, PRICING_TYPES, type PricingType, type Service } from "@/lib/types";
import { formatDate, formatPeso, wait } from "@/lib/format";
import { useDemoStore } from "@/lib/store/demo-store";
import { cn } from "@/lib/utils";

const blankService: Omit<Service, "id" | "slug"> = {
  name: "",
  description: "",
  image: "",
  price: 0,
  pricingType: "Fixed",
  category: "Planning",
  active: true,
};

export function ServiceAdmin() {
  const services = useDemoStore((state) => state.services);
  const addService = useDemoStore((state) => state.addService);
  const updateService = useDemoStore((state) => state.updateService);
  const deleteService = useDemoStore((state) => state.deleteService);
  const duplicateService = useDemoStore((state) => state.duplicateService);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState(blankService);
  const [pending, setPending] = useState(false);
  const [removeId, setRemoveId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const groups = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const visible = services.filter((service) => !needle || `${service.name} ${service.category} ${service.pricingType}`.toLowerCase().includes(needle));
    const categories = [...new Set(visible.map((service) => service.category))];
    return categories.map((category) => ({
      category,
      items: visible.filter((service) => service.category === category),
    }));
  }, [services, query]);

  function startCreate() {
    setEditing(null);
    setForm(blankService);
    setOpen(true);
  }

  async function save() {
    if (!form.name.trim() || !form.description.trim()) {
      toast.error("Name and description are required.");
      return;
    }
    setPending(true);
    await wait();
    if (editing) {
      updateService(editing.id, form);
      toast.success("Service updated successfully.");
    } else {
      addService(form);
      toast.success("Service created successfully.");
    }
    setPending(false);
    setOpen(false);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Rate card"
        title="Services"
        description="Add-ons grouped the way the team sells them. The price sits beside how it is charged."
        actions={<Button onClick={startCreate} className="bg-neutral-950 text-white hover:bg-neutral-800">Add service</Button>}
      />
      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Find a service or a way it is priced"
        aria-label="Search services"
        className="h-11 max-w-md border-black/10 bg-white shadow-none"
      />
      {groups.length === 0 ? (
        <p className="text-sm text-neutral-500">No services match that search.</p>
      ) : (
        groups.map((group) => (
          <section key={group.category}>
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="text-lg font-bold tracking-tight text-neutral-950">{group.category}</h2>
              <p className="text-xs text-neutral-400">{group.items.length} {group.items.length === 1 ? "rate" : "rates"}</p>
            </div>
            <div className="overflow-hidden rounded-lg border border-black/5 bg-white">
              {group.items.map((service) => (
                <div key={service.id} className={`grid gap-4 border-b border-neutral-100 px-4 py-4 last:border-0 md:grid-cols-[5.5rem_1fr_auto] md:items-center ${service.active ? "" : "opacity-50"}`}>
                  <img src={service.image} alt="" className="h-14 w-full rounded-md object-cover md:w-[5.5rem]" />
                  <div className="min-w-0">
                    <p className="font-semibold text-neutral-950">{service.name}</p>
                    <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-neutral-500">{service.description}</p>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3 md:flex-col md:items-end">
                    <div className="text-left md:text-right">
                      <p className="text-base font-semibold text-neutral-950 tabular-nums">{formatPeso(service.price)}</p>
                      <p className="text-xs text-neutral-400">{service.pricingType}{service.active ? "" : " · off"}</p>
                    </div>
                    <div className="flex flex-wrap justify-end gap-1.5">
                      <Button size="sm" variant="outline" onClick={() => { setEditing(service); setForm(service); setOpen(true); }}>Edit</Button>
                      <Button size="sm" variant="outline" onClick={() => { duplicateService(service.id); toast.success("Service duplicated."); }}>Duplicate</Button>
                      <Button size="sm" variant="outline" onClick={() => { updateService(service.id, { active: !service.active }); toast.success(service.active ? "Service deactivated." : "Service activated."); }}>{service.active ? "Deactivate" : "Activate"}</Button>
                      <Button size="sm" variant="destructive" onClick={() => setRemoveId(service.id)}>Delete</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-auto sm:max-w-xl">
          <DialogHeader><DialogTitle>{editing ? "Edit service" : "Add service"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Field label="Name"><Input className={adminControlClass} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></Field>
            <Field label="Description"><Textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></Field>
            <Field label="Price"><Input type="number" className={adminControlClass} value={form.price} onChange={(event) => setForm({ ...form, price: Number(event.target.value) })} /></Field>
            <Field label="Pricing type">
              <Select value={form.pricingType} onValueChange={(value) => setForm({ ...form, pricingType: value as PricingType })}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>{PRICING_TYPES.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Category"><Input className={adminControlClass} value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} /></Field>
            <Field label="Image"><ImageUploader multiple={false} images={form.image ? [form.image] : []} onChange={(images) => setForm({ ...form, image: images[0] ?? "" })} /></Field>
            <label className="flex items-center justify-between text-sm">Active <Switch checked={form.active} onCheckedChange={(active) => setForm({ ...form, active })} /></label>
          </div>
          <DialogFooter><Button disabled={pending} onClick={() => void save()}>{pending ? "Saving..." : "Save service"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={removeId != null}
        onOpenChange={(open) => !open && setRemoveId(null)}
        title="Delete service?"
        description="This action will remove the service from the demo."
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (!removeId) return;
          deleteService(removeId);
          toast.success("Service deleted.");
          setRemoveId(null);
        }}
      />
    </div>
  );
}

export function PaymentAdmin() {
  const payments = useDemoStore((state) => state.payments);
  const bookings = useDemoStore((state) => state.bookings);
  const clients = useDemoStore((state) => state.clients);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const ledger = useMemo(() => {
    const received = new Map<string, number>();
    for (const payment of payments) {
      if (payment.status !== "Completed") continue;
      received.set(payment.bookingId, (received.get(payment.bookingId) ?? 0) + payment.amount);
    }
    const collected = [...received.values()].reduce((sum, amount) => sum + amount, 0);
    const openBooks = bookings
      .filter((booking) => booking.status !== "Cancelled")
      .map((booking) => ({
        booking,
        received: received.get(booking.id) ?? 0,
        balance: Math.max(booking.total - (received.get(booking.id) ?? 0), 0),
      }))
      .filter((item) => item.balance > 0)
      .sort((a, b) => b.balance - a.balance);
    const outstanding = openBooks.reduce((sum, item) => sum + item.balance, 0);
    const methods = [...new Set(payments.map((item) => item.method))].map((method) => ({
      method,
      amount: payments
        .filter((item) => item.method === method && item.status === "Completed")
        .reduce((sum, item) => sum + item.amount, 0),
    })).filter((item) => item.amount > 0).sort((a, b) => b.amount - a.amount);
    const latest = [...payments].sort((a, b) => b.date.localeCompare(a.date) || b.number.localeCompare(a.number))[0];
    return { collected, outstanding, openBooks, methods, latest };
  }, [payments, bookings]);

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return [...payments]
      .sort((a, b) => b.date.localeCompare(a.date) || b.number.localeCompare(a.number))
      .filter((payment) => {
        if (!needle) return true;
        const booking = bookings.find((item) => item.id === payment.bookingId);
        const client = clients.find((item) => item.id === payment.clientId);
        return `${payment.number} ${payment.method} ${payment.reference} ${payment.notes} ${booking?.eventName ?? ""} ${booking?.number ?? ""} ${client?.name ?? ""}`
          .toLowerCase()
          .includes(needle);
      });
  }, [payments, bookings, clients, query]);

  const latestClient = clients.find((item) => item.id === ledger.latest?.clientId);

  return (
    <div className="min-w-0 space-y-5">
      <PageHeader
        eyebrow="Finance"
        title="Payments"
        description="Receipts against the book, and the balances still to collect."
        actions={<Button onClick={() => setOpen(true)} className="bg-neutral-950 text-white hover:bg-neutral-800">Record payment</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-lg border border-black/5 bg-white p-5 shadow-sm">
          <p className="text-[11px] font-medium text-neutral-400">Collected</p>
          <p className="mt-3 text-2xl font-bold tracking-tight text-neutral-950 tabular-nums">{formatPeso(ledger.collected)}</p>
          <p className="mt-4 border-t border-neutral-100 pt-3 text-xs text-neutral-400">Completed receipts on the ledger</p>
        </article>
        <article className="rounded-lg border border-black/5 bg-white p-5 shadow-sm">
          <p className="text-[11px] font-medium text-neutral-400">Still open</p>
          <p className="mt-3 text-2xl font-bold tracking-tight text-[#c4454d] tabular-nums">{formatPeso(ledger.outstanding)}</p>
          <p className="mt-4 border-t border-neutral-100 pt-3 text-xs text-neutral-400">{ledger.openBooks.length} active bookings with a balance</p>
        </article>
        <article className="rounded-lg border border-black/5 bg-white p-5 shadow-sm">
          <p className="text-[11px] font-medium text-neutral-400">Receipts</p>
          <p className="mt-3 text-4xl font-bold tracking-tight text-neutral-950">{payments.length}</p>
          <p className="mt-4 border-t border-neutral-100 pt-3 text-xs text-neutral-400">Recorded against a booking</p>
        </article>
        <article className="rounded-lg border border-black/5 bg-white p-5 shadow-sm">
          <p className="text-[11px] font-medium text-neutral-400">Latest</p>
          <p className="mt-3 text-2xl font-bold tracking-tight text-neutral-950">{ledger.latest ? formatDate(ledger.latest.date) : "—"}</p>
          <p className="mt-4 border-t border-neutral-100 pt-3 text-xs text-neutral-400">
            {ledger.latest ? `${latestClient?.name ?? "Client"} · ${formatPeso(ledger.latest.amount)}` : "No receipts yet"}
          </p>
        </article>
      </div>

      <div className="grid min-w-0 items-start gap-4 xl:grid-cols-[1.6fr_0.85fr]">
        <section className="min-w-0 rounded-lg border border-black/5 bg-white shadow-sm">
          <header className="flex flex-col gap-3 border-b border-neutral-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-neutral-950">Ledger</h2>
              <p className="mt-0.5 text-xs text-neutral-400">Newest receipt first.</p>
            </div>
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search client, booking, or reference"
              aria-label="Search payments"
              className="h-10 w-full border-black/10 bg-white shadow-none sm:max-w-xs"
            />
          </header>
          {rows.length === 0 ? (
            <p className="px-5 py-10 text-sm text-neutral-500">No receipts match that search.</p>
          ) : (
            <ul>
              {rows.map((payment) => {
                const booking = bookings.find((item) => item.id === payment.bookingId);
                const client = clients.find((item) => item.id === payment.clientId);
                return (
                  <li key={payment.id} className="border-b border-neutral-100 last:border-0">
                    <Link href={booking ? `/admin/bookings/${booking.id}` : "/admin/bookings"} className="grid gap-3 px-5 py-4 hover:bg-neutral-50 sm:grid-cols-[1fr_auto] sm:items-center">
                      <div className="min-w-0">
                        <p className="text-[11px] font-medium text-[#1f8a4c]">{payment.method}</p>
                        <p className="mt-1 truncate text-sm font-semibold text-neutral-950">{client?.name ?? "Unknown client"}</p>
                        <p className="mt-0.5 truncate text-sm text-neutral-500">
                          {booking?.eventName ?? "Booking"} · {booking?.number ?? payment.number}
                        </p>
                        <p className="mt-1 text-xs text-neutral-400">
                          {payment.notes || payment.reference || payment.number} · {formatDate(payment.date)}
                        </p>
                      </div>
                      <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                        <p className="text-base font-semibold text-neutral-950 tabular-nums">{formatPeso(payment.amount)}</p>
                        <StatusBadge status={payment.status} />
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
            <h2 className="text-[11px] font-semibold text-neutral-500">How it arrived</h2>
            <ul className="mt-4 space-y-3">
              {ledger.methods.map((item) => (
                <li key={item.method}>
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="font-medium text-neutral-950">{item.method}</span>
                    <span className="text-neutral-500 tabular-nums">{formatPeso(item.amount)}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-neutral-100">
                    <div
                      className="h-full rounded-full bg-[#c4454d]"
                      style={{ width: `${ledger.collected > 0 ? (item.amount / ledger.collected) * 100 : 0}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-lg border border-black/5 bg-white shadow-sm">
            <header className="px-5 pt-5">
              <h2 className="text-[11px] font-semibold text-neutral-500">Still to collect</h2>
              <p className="mt-1 text-xs text-neutral-400">Active bookings with money left on the total.</p>
            </header>
            <ul className="mt-2">
              {ledger.openBooks.length === 0 ? (
                <li className="px-5 py-6 text-sm text-neutral-500">Every active booking is paid.</li>
              ) : (
                ledger.openBooks.slice(0, 6).map(({ booking, balance, received }) => {
                  const client = clients.find((item) => item.id === booking.clientId);
                  return (
                    <li key={booking.id} className="border-b border-neutral-100 last:border-0">
                      <Link href={`/admin/bookings/${booking.id}`} className="block px-5 py-3.5 hover:bg-neutral-50">
                        <p className="text-[11px] font-medium text-[#1f8a4c]">{booking.eventType}</p>
                        <div className="mt-1 flex items-baseline justify-between gap-3">
                          <p className="truncate text-sm font-medium text-neutral-950">{booking.eventName}</p>
                          <p className="shrink-0 text-sm font-semibold text-neutral-950 tabular-nums">{formatPeso(balance)}</p>
                        </div>
                        <p className="mt-1 text-xs text-neutral-400">{client?.name ?? "Client"} · {formatPeso(received)} of {formatPeso(booking.total)}</p>
                      </Link>
                    </li>
                  );
                })
              )}
            </ul>
          </section>
        </div>
      </div>

      <RecordPaymentDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}

export function ClientAdminList() {
  const params = useSearchParams();
  const status = params.get("status");
  const clients = useDemoStore((state) => state.clients);
  const bookings = useDemoStore((state) => state.bookings);
  const addClient = useDemoStore((state) => state.addClient);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState({ name: "", company: "", email: "", phone: "" });

  const stats = useMemo(() => {
    const map = new Map<string, { events: number; value: number }>();
    for (const client of clients) {
      const own = bookings.filter((booking) => booking.clientId === client.id && booking.status !== "Cancelled");
      map.set(client.id, { events: own.length, value: own.reduce((sum, booking) => sum + booking.total, 0) });
    }
    return map;
  }, [clients, bookings]);

  const bookedValue = [...stats.values()].reduce((sum, item) => sum + item.value, 0);
  const withEvents = [...stats.values()].filter((item) => item.events > 0).length;
  const active = clients.filter((client) => client.status === "Active").length;
  const leads = clients.filter((client) => client.status === "Lead").length;
  const ranked = [...clients].sort((a, b) => (stats.get(b.id)?.value ?? 0) - (stats.get(a.id)?.value ?? 0)).filter((client) => (stats.get(client.id)?.value ?? 0) > 0);
  const newestLeads = [...clients].filter((client) => client.status === "Lead").sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return [...clients]
      .filter((client) => !status || client.status === status)
      .filter((client) => !needle || `${client.name} ${client.company} ${client.email} ${client.phone}`.toLowerCase().includes(needle))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [clients, status, query]);

  const title = status === "Lead" ? "Leads" : status === "Active" ? "Active clients" : status === "Inactive" ? "Inactive clients" : "Clients";

  return (
    <div className="min-w-0 space-y-5">
      <PageHeader
        eyebrow="Sales"
        title={title}
        description={`${formatPeso(bookedValue)} booked across clients, not counting cancelled dates.`}
        actions={<Button onClick={() => setOpen(true)} className="bg-neutral-950 text-white hover:bg-neutral-800">Add client</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Link href="/admin/clients?status=Active" className="rounded-lg border border-black/5 bg-white p-5 shadow-sm transition hover:border-black/10">
          <p className="text-[11px] font-medium text-neutral-400">Active</p>
          <p className="mt-3 text-4xl font-bold tracking-tight text-[#1f8a4c]">{active}</p>
          <p className="mt-4 border-t border-neutral-100 pt-3 text-xs text-neutral-400">Already on the house account</p>
        </Link>
        <Link href="/admin/clients?status=Lead" className="rounded-lg border border-black/5 bg-white p-5 shadow-sm transition hover:border-black/10">
          <p className="text-[11px] font-medium text-neutral-400">Leads</p>
          <p className="mt-3 text-4xl font-bold tracking-tight text-neutral-950">{leads}</p>
          <p className="mt-4 border-t border-neutral-100 pt-3 text-xs text-neutral-400">Still marked as a lead</p>
        </Link>
        <article className="rounded-lg border border-black/5 bg-white p-5 shadow-sm">
          <p className="text-[11px] font-medium text-neutral-400">Booked</p>
          <p className="mt-3 text-2xl font-bold tracking-tight text-neutral-950 tabular-nums">{formatPeso(bookedValue)}</p>
          <p className="mt-4 border-t border-neutral-100 pt-3 text-xs text-neutral-400">{withEvents} clients with a date</p>
        </article>
        <Link href="/admin/clients?status=Inactive" className="rounded-lg border border-black/5 bg-white p-5 shadow-sm transition hover:border-black/10">
          <p className="text-[11px] font-medium text-neutral-400">Inactive</p>
          <p className="mt-3 text-4xl font-bold tracking-tight text-neutral-950">{clients.filter((client) => client.status === "Inactive").length}</p>
          <p className="mt-4 border-t border-neutral-100 pt-3 text-xs text-neutral-400">No current work</p>
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {[{ label: "All", value: "" }, ...CLIENT_STATUSES.map((item) => ({ label: item, value: item }))].map((filter) => {
          const active = filter.value ? status === filter.value : !status;
          return (
            <Link
              key={filter.label}
              href={filter.value ? `/admin/clients?status=${encodeURIComponent(filter.value)}` : "/admin/clients"}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium",
                active ? "bg-neutral-950 text-white" : "border border-black/10 bg-white text-neutral-600 hover:text-neutral-950",
              )}
            >
              {filter.label}
            </Link>
          );
        })}
      </div>

      <div className="grid min-w-0 items-start gap-4 xl:grid-cols-[1.6fr_0.85fr]">
        <section className="min-w-0 rounded-lg border border-black/5 bg-white shadow-sm">
          <header className="flex flex-col gap-3 border-b border-neutral-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-neutral-950">The house</h2>
              <p className="mt-0.5 text-xs text-neutral-400">{rows.length} shown, by name.</p>
            </div>
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name, company, or email"
              aria-label="Search clients"
              className="h-10 w-full border-black/10 bg-white shadow-none sm:max-w-xs"
            />
          </header>
          {rows.length === 0 ? (
            <div className="px-5 py-10">
              <p className="text-sm text-neutral-500">No clients match this view.</p>
              <Button onClick={() => setOpen(true)} className="mt-4 bg-neutral-950 text-white hover:bg-neutral-800">Add client</Button>
            </div>
          ) : (
            <ul>
              {rows.map((client) => {
                const record = stats.get(client.id) ?? { events: 0, value: 0 };
                return (
                  <li key={client.id} className="border-b border-neutral-100 last:border-0">
                    <Link href={`/admin/clients/${client.id}`} className="grid gap-3 px-5 py-4 hover:bg-neutral-50 sm:grid-cols-[1fr_auto] sm:items-center">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-neutral-950">{client.name}</p>
                        <p className="mt-0.5 truncate text-sm text-neutral-500">{client.company || "Private client"}</p>
                        <p className="mt-1 truncate text-xs text-neutral-400">{client.email} · {client.phone}</p>
                      </div>
                      <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                        <div className="text-right">
                          <p className="text-base font-semibold text-neutral-950 tabular-nums">{formatPeso(record.value)}</p>
                          <p className="text-xs text-neutral-400">{record.events} {record.events === 1 ? "event" : "events"}</p>
                        </div>
                        <StatusBadge status={client.status} />
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <div className="grid min-w-0 gap-4">
          <section className="rounded-lg border border-black/5 bg-white shadow-sm">
            <header className="px-5 pt-5">
              <h2 className="text-[11px] font-semibold text-neutral-500">Largest accounts</h2>
              <p className="mt-1 text-xs text-neutral-400">By booked value, cancelled dates left out.</p>
            </header>
            <ul className="mt-2">
              {ranked.slice(0, 5).map((client) => (
                <li key={client.id} className="border-b border-neutral-100 last:border-0">
                  <Link href={`/admin/clients/${client.id}`} className="flex items-baseline justify-between gap-3 px-5 py-3.5 hover:bg-neutral-50">
                    <span className="truncate text-sm font-medium text-neutral-950">{client.name}</span>
                    <span className="shrink-0 text-sm text-neutral-500 tabular-nums">{formatPeso(stats.get(client.id)?.value ?? 0)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
          <section className="rounded-lg border border-black/5 bg-white shadow-sm">
            <header className="px-5 pt-5">
              <h2 className="text-[11px] font-semibold text-neutral-500">Newest leads</h2>
            </header>
            <ul className="mt-2">
              {newestLeads.slice(0, 5).map((client) => (
                <li key={client.id} className="border-b border-neutral-100 last:border-0">
                  <Link href={`/admin/clients/${client.id}`} className="block px-5 py-3.5 hover:bg-neutral-50">
                    <p className="text-sm font-medium text-neutral-950">{client.name}</p>
                    <p className="mt-1 text-xs text-neutral-400">{client.company || "Private client"} · {formatDate(client.createdAt)}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add client</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            <Input placeholder="Company" value={form.company} onChange={(event) => setForm({ ...form, company: event.target.value })} />
            <Input placeholder="Email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
            <Input placeholder="Phone" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
          </div>
          <DialogFooter>
            <Button onClick={() => {
              if (form.name.trim().length < 2 || !form.email.includes("@")) {
                toast.error("Enter a name and email.");
                return;
              }
              addClient({ ...form, status: "Lead" });
              toast.success("Client added.");
              setOpen(false);
              setForm({ name: "", company: "", email: "", phone: "" });
            }}>Save client</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function ClientAdminDetail({ id }: { id: string }) {
  const client = useDemoStore((state) => state.clients.find((item) => item.id === id));
  const inquiryList = useDemoStore((state) => state.inquiries);
  const proposalList = useDemoStore((state) => state.proposals);
  const bookingList = useDemoStore((state) => state.bookings);
  const paymentList = useDemoStore((state) => state.payments);
  const inquiries = useMemo(
    () => inquiryList.filter((item) => item.email.toLowerCase() === client?.email.toLowerCase()),
    [inquiryList, client?.email],
  );
  const proposals = useMemo(() => proposalList.filter((item) => item.clientId === id), [proposalList, id]);
  const bookings = useMemo(() => bookingList.filter((item) => item.clientId === id), [bookingList, id]);
  const payments = useMemo(() => paymentList.filter((item) => item.clientId === id), [paymentList, id]);
  const updateClient = useDemoStore((state) => state.updateClient);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(client);
  if (!client || !form) return <p>Client not found.</p>;

  return (
    <div className="space-y-6">
      <PageHeader
        title={client.name}
        description={client.company || client.email}
        actions={<Button variant="outline" onClick={() => setEditing((value) => !value)}>{editing ? "Close editor" : "Edit client"}</Button>}
      />
      {editing ? (
        <div className="grid gap-3 border border-stone-200 bg-white p-4 md:grid-cols-2">
          <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          <Input value={form.company} onChange={(event) => setForm({ ...form, company: event.target.value })} />
          <Input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          <Input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
          <Button onClick={() => { updateClient(client.id, form); toast.success("Client updated."); setEditing(false); }}>Save client</Button>
        </div>
      ) : null}
      <Section title="Inquiries">
        {inquiries.length === 0 ? <Empty /> : inquiries.map((item) => <Link key={item.id} href={`/admin/inquiries/${item.id}`} className="block border-b border-stone-100 py-3 text-sm last:border-0 hover:text-gold">{item.number} · {item.eventType}</Link>)}
      </Section>
      <Section title="Proposals">
        {proposals.length === 0 ? <Empty /> : proposals.map((item) => <Link key={item.id} href={`/admin/proposals/${item.id}`} className="block border-b border-stone-100 py-3 text-sm last:border-0 hover:text-gold">{item.number} · {item.status}</Link>)}
      </Section>
      <Section title="Bookings">
        {bookings.length === 0 ? <Empty /> : bookings.map((item) => <Link key={item.id} href={`/admin/bookings/${item.id}`} className="block border-b border-stone-100 py-3 text-sm last:border-0 hover:text-gold">{item.number} · {item.eventName}</Link>)}
      </Section>
      <Section title="Payments">
        {payments.length === 0 ? <Empty /> : payments.map((item) => <p key={item.id} className="py-2 text-sm">{item.number} · <CurrencyDisplay value={item.amount} /> · {formatDate(item.date)}</p>)}
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="border border-stone-200 bg-white p-6"><h2 className="font-display text-3xl text-ink">{title}</h2><div className="mt-3">{children}</div></section>;
}

function Empty() {
  return <p className="text-sm text-muted-foreground">Nothing recorded yet.</p>;
}

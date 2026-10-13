"use client";

import Link from "next/link";
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
import { DataTable } from "@/components/shared/data-table";
import { ImageUploader } from "@/components/shared/editors";
import { StatusBadge } from "@/components/shared/status-badge";
import { RecordPaymentDialog } from "@/components/admin/payment-dialog";
import { PRICING_TYPES, type PricingType, type Service } from "@/lib/types";
import { formatDate, formatPeso, wait } from "@/lib/format";
import { useDemoStore } from "@/lib/store/demo-store";

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
      <PageHeader eyebrow="Content" title="Services" actions={<Button onClick={startCreate}>Add Service</Button>} />
      <DataTable
        rows={services}
        rowKey={(row) => row.id}
        getSearchText={(row) => `${row.name} ${row.category} ${row.pricingType}`}
        searchPlaceholder="Search services"
        emptyTitle="No services found"
        emptyDescription="Add a service to offer it on the website."
        emptyAction={<Button onClick={startCreate}>Add Service</Button>}
        columns={[
          { key: "name", header: "Name", sortValue: (row) => row.name, cell: (row) => row.name },
          { key: "category", header: "Category", sortValue: (row) => row.category, cell: (row) => row.category },
          { key: "price", header: "Price", sortValue: (row) => row.price, cell: (row) => <CurrencyDisplay value={row.price} /> },
          { key: "type", header: "Pricing Type", cell: (row) => row.pricingType },
          { key: "active", header: "Active", cell: (row) => <StatusBadge status={row.active ? "Active" : "Inactive"} /> },
          {
            key: "actions",
            header: "Actions",
            cell: (row) => (
              <div className="flex flex-wrap justify-end gap-1">
                <Button size="sm" variant="outline" onClick={() => { setEditing(row); setForm(row); setOpen(true); }}>Edit</Button>
                <Button size="sm" variant="outline" onClick={() => { duplicateService(row.id); toast.success("Service duplicated."); }}>Duplicate</Button>
                <Button size="sm" variant="outline" onClick={() => { updateService(row.id, { active: !row.active }); toast.success(row.active ? "Service deactivated." : "Service activated."); }}>{row.active ? "Deactivate" : "Activate"}</Button>
                <Button size="sm" variant="destructive" onClick={() => setRemoveId(row.id)}>Delete</Button>
              </div>
            ),
          },
        ]}
      />
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
  const collected = payments.filter((item) => item.status === "Completed").reduce((sum, item) => sum + item.amount, 0);
  const latest = [...payments].sort((a, b) => b.date.localeCompare(a.date))[0];
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Finance" title="Payments" description="Money received against confirmed bookings." actions={<Button onClick={() => setOpen(true)}>Record Payment</Button>} />
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-black/5 bg-white p-5 shadow-sm">
          <p className="text-[11px] font-medium tracking-[0.12em] text-neutral-400 uppercase">Recorded</p>
          <p className="mt-3 text-4xl font-bold tracking-tight">{payments.length}</p>
        </div>
        <div className="rounded-lg border border-black/5 bg-white p-5 shadow-sm">
          <p className="text-[11px] font-medium tracking-[0.12em] text-neutral-400 uppercase">Collected</p>
          <p className="mt-3 text-4xl font-bold tracking-tight">{formatPeso(collected)}</p>
        </div>
        <div className="rounded-lg border border-black/5 bg-white p-5 shadow-sm">
          <p className="text-[11px] font-medium tracking-[0.12em] text-neutral-400 uppercase">Latest</p>
          <p className="mt-3 text-2xl font-bold tracking-tight">{latest ? formatDate(latest.date) : "—"}</p>
        </div>
      </div>
      <DataTable
        rows={payments}
        rowKey={(row) => row.id}
        getSearchText={(row) => `${row.number} ${row.method} ${row.reference}`}
        searchPlaceholder="Search payments"
        emptyTitle="No payments found"
        emptyDescription="Record a payment against a booking."
        emptyAction={<Button onClick={() => setOpen(true)}>Record Payment</Button>}
        columns={[
          { key: "number", header: "Payment Number", sortValue: (row) => row.number, cell: (row) => row.number },
          { key: "booking", header: "Booking", cell: (row) => bookings.find((item) => item.id === row.bookingId)?.number ?? "—" },
          { key: "client", header: "Client", cell: (row) => <span className="font-medium">{clients.find((item) => item.id === row.clientId)?.name ?? "—"}</span> },
          { key: "amount", header: "Amount", sortValue: (row) => row.amount, cell: (row) => <span className="font-display text-xl"><CurrencyDisplay value={row.amount} /></span> },
          { key: "method", header: "Method", cell: (row) => row.method },
          { key: "date", header: "Date", sortValue: (row) => row.date, cell: (row) => formatDate(row.date) },
          { key: "status", header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
        ]}
      />
      <RecordPaymentDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}

export function ClientAdminList() {
  const clients = useDemoStore((state) => state.clients);
  const bookings = useDemoStore((state) => state.bookings);
  const addClient = useDemoStore((state) => state.addClient);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", company: "", email: "", phone: "" });

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Sales" title="Clients" actions={<Button onClick={() => setOpen(true)}>Add Client</Button>} />
      <DataTable
        rows={clients}
        rowKey={(row) => row.id}
        getSearchText={(row) => `${row.name} ${row.company} ${row.email} ${row.phone}`}
        searchPlaceholder="Search clients"
        emptyTitle="No clients found"
        emptyDescription="Add a client or submit an inquiry from the website."
        emptyAction={<Button onClick={() => setOpen(true)}>Add Client</Button>}
        columns={[
          { key: "name", header: "Name", sortValue: (row) => row.name, cell: (row) => <Link className="font-medium hover:text-gold" href={`/admin/clients/${row.id}`}>{row.name}</Link> },
          { key: "company", header: "Company", sortValue: (row) => row.company, cell: (row) => row.company || "—" },
          { key: "email", header: "Email", cell: (row) => row.email },
          { key: "phone", header: "Phone", cell: (row) => row.phone },
          { key: "events", header: "Events", sortValue: (row) => bookings.filter((item) => item.clientId === row.id).length, cell: (row) => bookings.filter((item) => item.clientId === row.id).length },
          { key: "value", header: "Total Value", sortValue: (row) => bookings.filter((item) => item.clientId === row.id && item.status !== "Cancelled").reduce((sum, item) => sum + item.total, 0), cell: (row) => <CurrencyDisplay value={bookings.filter((item) => item.clientId === row.id && item.status !== "Cancelled").reduce((sum, item) => sum + item.total, 0)} /> },
          { key: "status", header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
        ]}
      />
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

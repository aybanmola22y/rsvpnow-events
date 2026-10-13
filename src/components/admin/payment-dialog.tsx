"use client";

import { useState } from "react";
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
import { Field } from "@/components/shared/chrome";
import { PAYMENT_METHODS, type PaymentMethod } from "@/lib/types";
import { formatPeso, wait } from "@/lib/format";
import { useDemoStore } from "@/lib/store/demo-store";

export function RecordPaymentDialog({
  open,
  onOpenChange,
  bookingId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId?: string;
}) {
  const bookings = useDemoStore((state) => state.bookings);
  const clients = useDemoStore((state) => state.clients);
  const recordPayment = useDemoStore((state) => state.recordPayment);
  const [pending, setPending] = useState(false);
  const [form, setForm] = useState({
    bookingId: bookingId ?? "",
    amount: "",
    method: "Bank Transfer" as PaymentMethod,
    reference: "",
    date: new Date().toISOString().slice(0, 10),
    notes: "",
  });
  const selected = bookings.find((item) => item.id === (form.bookingId || bookingId));

  async function save() {
    const id = form.bookingId || bookingId || "";
    const amount = Number(form.amount);
    if (!id || !(amount > 0) || !form.date) {
      toast.error("Choose a booking, amount, and date.");
      return;
    }
    setPending(true);
    await wait();
    const payment = recordPayment({
      bookingId: id,
      amount,
      method: form.method,
      reference: form.reference,
      date: form.date,
      notes: form.notes,
    });
    setPending(false);
    if (!payment) {
      toast.error("That booking could not be found.");
      return;
    }
    toast.success("Payment recorded successfully.");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record payment</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Field label="Booking">
            <Select value={form.bookingId || bookingId || ""} onValueChange={(value) => setForm({ ...form, bookingId: value })}>
              <SelectTrigger className="h-10 w-full"><SelectValue placeholder="Select a booking" /></SelectTrigger>
              <SelectContent>
                {bookings.map((booking) => {
                  const client = clients.find((item) => item.id === booking.clientId);
                  return (
                    <SelectItem key={booking.id} value={booking.id}>
                      {booking.number} · {client?.name} · due {formatPeso(Math.max(0, booking.total - booking.paid))}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </Field>
          {selected ? <p className="text-xs text-muted-foreground">Balance before this payment: {formatPeso(Math.max(0, selected.total - selected.paid))}</p> : null}
          <Field label="Amount"><Input type="number" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} /></Field>
          <Field label="Payment method">
            <Select value={form.method} onValueChange={(value) => setForm({ ...form, method: value as PaymentMethod })}>
              <SelectTrigger className="h-10 w-full"><SelectValue /></SelectTrigger>
              <SelectContent>{PAYMENT_METHODS.map((method) => <SelectItem key={method} value={method}>{method}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Reference number"><Input value={form.reference} onChange={(event) => setForm({ ...form, reference: event.target.value })} /></Field>
          <Field label="Date"><Input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} /></Field>
          <Field label="Notes"><Textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} /></Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={pending} onClick={() => void save()}>{pending ? "Saving..." : "Save payment"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

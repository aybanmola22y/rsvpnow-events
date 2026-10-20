"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { cn } from "@/lib/utils";

const controlClass =
  "h-11 rounded-md border-neutral-200 bg-white shadow-none focus-visible:border-neutral-950 focus-visible:ring-1 focus-visible:ring-neutral-950/10";

function today() {
  return new Date().toISOString().slice(0, 10);
}

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
    date: today(),
    notes: "",
  });

  useEffect(() => {
    if (!open) return;
    setForm({
      bookingId: bookingId ?? "",
      amount: "",
      method: "Bank Transfer",
      reference: "",
      date: today(),
      notes: "",
    });
  }, [open, bookingId]);

  const selected = bookings.find((item) => item.id === (form.bookingId || bookingId));
  const client = selected ? clients.find((item) => item.id === selected.clientId) : undefined;
  const balance = selected ? Math.max(0, selected.total - selected.paid) : 0;

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
      reference: form.reference.trim(),
      date: form.date,
      notes: form.notes.trim(),
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
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="border-b border-neutral-100 px-6 pt-6 pr-12 pb-5">
          <p className="text-[11px] font-medium tracking-[0.16em] text-neutral-400 uppercase">
            Payments ledger
          </p>
          <DialogTitle className="mt-1 text-2xl font-semibold tracking-tight text-neutral-950">
            Record payment
          </DialogTitle>
          <DialogDescription className="mt-1.5 text-sm text-neutral-500">
            Enter the amount received against a booking. Reference numbers help reconcile bank transfers.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 px-6 py-5">
          <Field label="Booking">
            <Select
              value={form.bookingId || bookingId || ""}
              onValueChange={(value) => setForm({ ...form, bookingId: value })}
            >
              <SelectTrigger className={cn(controlClass, "w-full")}>
                <SelectValue placeholder="Select a booking" />
              </SelectTrigger>
              <SelectContent>
                {bookings.map((booking) => {
                  const name = clients.find((item) => item.id === booking.clientId)?.name;
                  return (
                    <SelectItem key={booking.id} value={booking.id}>
                      {booking.number} · {name} · due {formatPeso(Math.max(0, booking.total - booking.paid))}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </Field>

          {selected ? (
            <div className="grid grid-cols-3 gap-3 border border-neutral-200 bg-neutral-50 px-4 py-3">
              <div>
                <p className="text-[10px] font-medium tracking-[0.12em] text-neutral-400 uppercase">Client</p>
                <p className="mt-1 truncate text-sm font-medium text-neutral-950">{client?.name ?? "—"}</p>
              </div>
              <div>
                <p className="text-[10px] font-medium tracking-[0.12em] text-neutral-400 uppercase">Booking</p>
                <p className="mt-1 text-sm font-medium text-neutral-950">{selected.number}</p>
              </div>
              <div>
                <p className="text-[10px] font-medium tracking-[0.12em] text-neutral-400 uppercase">Balance due</p>
                <p className="mt-1 text-sm font-semibold tabular-nums text-neutral-950">{formatPeso(balance)}</p>
              </div>
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Amount (S$)">
              <div className="relative">
                <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-neutral-400">
                  S$
                </span>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="0.00"
                  className={cn(controlClass, "pl-10 tabular-nums")}
                  value={form.amount}
                  onChange={(event) => setForm({ ...form, amount: event.target.value })}
                />
              </div>
            </Field>
            <Field label="Payment method">
              <Select
                value={form.method}
                onValueChange={(value) => setForm({ ...form, method: value as PaymentMethod })}
              >
                <SelectTrigger className={cn(controlClass, "w-full")}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((method) => (
                    <SelectItem key={method} value={method}>
                      {method}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Date received">
              <Input
                type="date"
                className={controlClass}
                value={form.date}
                onChange={(event) => setForm({ ...form, date: event.target.value })}
              />
            </Field>
            <Field label="Reference number">
              <Input
                placeholder="Bank ref / cheque no."
                className={controlClass}
                value={form.reference}
                onChange={(event) => setForm({ ...form, reference: event.target.value })}
              />
            </Field>
          </div>

          <Field label="Notes" hint="Optional">
            <Textarea
              placeholder="Internal note for finance or the client file."
              className="min-h-24 rounded-md border-neutral-200 bg-white shadow-none focus-visible:border-neutral-950 focus-visible:ring-1 focus-visible:ring-neutral-950/10"
              value={form.notes}
              onChange={(event) => setForm({ ...form, notes: event.target.value })}
            />
          </Field>
        </div>

        <DialogFooter className="gap-2 border-t border-neutral-100 bg-neutral-50 px-6 py-4 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="h-10 border-neutral-200 bg-white"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={pending}
            className="h-10 bg-neutral-950 text-white hover:bg-neutral-800"
            onClick={() => void save()}
          >
            {pending ? "Saving…" : "Save payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

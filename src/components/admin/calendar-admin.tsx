"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameMonth, startOfMonth, startOfWeek } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatTime } from "@/lib/format";
import { useDemoStore } from "@/lib/store/demo-store";
import { cn } from "@/lib/utils";

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function eventTone(status: string) {
  if (status === "Confirmed" || status === "Ongoing") return "border-l-[#1f8a4c] bg-[#f3faf6] text-[#145c32]";
  if (status === "Tentative") return "border-l-[#c4454d] bg-[#fdf4f4] text-[#8d2e36]";
  if (status === "Cancelled") return "border-l-neutral-300 bg-neutral-50 text-neutral-400 line-through";
  return "border-l-neutral-400 bg-neutral-50 text-neutral-700";
}

export function CalendarAdmin() {
  const bookings = useDemoStore((state) => state.bookings);
  const clients = useDemoStore((state) => state.clients);
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));
  const [selected, setSelected] = useState<string | null>(null);
  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [cursor]);
  const monthKey = format(cursor, "yyyy-MM");
  const monthCount = bookings.filter((booking) => booking.eventDate.startsWith(monthKey) && booking.status !== "Cancelled").length;
  const selectedBookings = bookings.filter((booking) => booking.eventDate === selected);
  const todayKey = format(new Date(), "yyyy-MM-dd");

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-950">Calendar</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {format(cursor, "MMMM yyyy")} · {monthCount} {monthCount === 1 ? "event" : "events"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" className="bg-white" onClick={() => setCursor((date) => addMonths(date, -1))}>
            <ChevronLeft />
            Previous
          </Button>
          <Button type="button" variant="outline" className="bg-white" onClick={() => setCursor(startOfMonth(new Date()))}>
            Today
          </Button>
          <Button type="button" variant="outline" className="bg-white" onClick={() => setCursor((date) => addMonths(date, 1))}>
            Next
            <ChevronRight />
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-black/5 bg-white shadow-sm">
        <div className="grid grid-cols-7 border-b border-neutral-100 bg-neutral-50">
          {weekdays.map((day) => (
            <div key={day} className="px-2 py-2.5 text-center text-[11px] font-medium tracking-[0.12em] text-neutral-400 uppercase">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((day) => {
            const key = format(day, "yyyy-MM-dd");
            const events = bookings.filter((booking) => booking.eventDate === key);
            const inMonth = isSameMonth(day, cursor);
            const isToday = key === todayKey;
            return (
              <div
                key={key}
                className={cn(
                  "min-h-32 border-r border-b border-neutral-100 p-2 last:border-r-0",
                  !inMonth && "bg-neutral-50/80",
                )}
              >
                <button
                  type="button"
                  onClick={() => events.length > 0 && setSelected(key)}
                  className={cn(
                    "grid size-7 place-items-center rounded-full text-sm font-medium",
                    isToday && "bg-[#c4454d] text-white",
                    !isToday && inMonth && "text-neutral-900",
                    !inMonth && "text-neutral-300",
                  )}
                >
                  {format(day, "d")}
                </button>
                <div className="mt-1.5 space-y-1">
                  {events.slice(0, 2).map((booking) => (
                    <button
                      key={booking.id}
                      type="button"
                      onClick={() => setSelected(key)}
                      className={cn("block w-full truncate rounded-sm border-l-2 px-1.5 py-1 text-left text-[11px] font-medium", eventTone(booking.status))}
                    >
                      {booking.eventName}
                    </button>
                  ))}
                  {events.length > 2 ? (
                    <button type="button" className="px-1 text-[11px] font-medium text-[#c4454d]" onClick={() => setSelected(key)}>
                      +{events.length - 2} more
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Dialog open={selected != null} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-md">
          <DialogHeader className="border-b border-neutral-100 px-5 pt-5 pr-12 pb-4">
            <p className="text-[11px] font-medium tracking-[0.14em] text-neutral-400 uppercase">
              {selected ? format(new Date(`${selected}T12:00:00`), "EEEE") : "Events"}
            </p>
            <DialogTitle className="mt-1 text-2xl font-bold tracking-tight">
              {selected ? format(new Date(`${selected}T12:00:00`), "MMMM d") : "Events"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 px-5 py-4">
            {selectedBookings.map((booking) => {
              const client = clients.find((item) => item.id === booking.clientId);
              return (
                <article key={booking.id} className="rounded-lg bg-neutral-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold tracking-[0.14em] text-[#1f8a4c] uppercase">{booking.eventType}</p>
                      <h3 className="mt-1 text-lg font-semibold tracking-tight text-neutral-950">{booking.eventName}</h3>
                      <p className="mt-0.5 text-sm text-neutral-500">{booking.venueName}</p>
                    </div>
                    <span className={cn("shrink-0 rounded-full bg-white px-2.5 py-1 text-[11px] font-medium ring-1 ring-black/5", booking.status === "Cancelled" && "text-neutral-400")}>
                      {booking.status}
                    </span>
                  </div>
                  <dl className="mt-4 grid grid-cols-3 gap-3 border-t border-neutral-200/80 pt-4">
                    <div>
                      <dt className="text-[10px] font-medium tracking-[0.12em] text-neutral-400 uppercase">Time</dt>
                      <dd className="mt-1 text-sm font-medium text-neutral-950">{formatTime(booking.startTime)}</dd>
                    </div>
                    <div>
                      <dt className="text-[10px] font-medium tracking-[0.12em] text-neutral-400 uppercase">Guests</dt>
                      <dd className="mt-1 text-sm font-medium text-neutral-950">{booking.guestCount}</dd>
                    </div>
                    <div>
                      <dt className="text-[10px] font-medium tracking-[0.12em] text-neutral-400 uppercase">Client</dt>
                      <dd className="mt-1 truncate text-sm font-medium text-neutral-950">{client?.name ?? "—"}</dd>
                    </div>
                  </dl>
                  <p className="mt-3 text-xs text-neutral-400">{booking.number} · {booking.paymentStatus}</p>
                  <Button asChild className="mt-4 h-10 w-full bg-neutral-950 text-white hover:bg-neutral-800">
                    <Link href={`/admin/bookings/${booking.id}`}>Open booking</Link>
                  </Button>
                </article>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

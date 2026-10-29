"use client";

import Link from "next/link";
import { eachDayOfInterval, format, subDays } from "date-fns";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatDateTime, formatLabel } from "@/lib/format";
import { useDemoStore } from "@/lib/store/demo-store";

const tooltipStyle = {
  background: "#fff",
  border: "1px solid #ececec",
  borderRadius: 8,
  fontSize: 12,
  color: "#111",
};

export function DashboardHome() {
  const inquiries = useDemoStore((state) => state.inquiries);
  const proposals = useDemoStore((state) => state.proposals);
  const bookings = useDemoStore((state) => state.bookings);
  const today = new Date().toISOString().slice(0, 10);

  const newInquiries = inquiries.filter((item) => item.status === "NEW").length;
  const pendingProposals = proposals.filter((item) => ["DRAFT", "FOR APPROVAL", "APPROVED"].includes(item.status)).length;
  const confirmed = bookings.filter((item) => item.status === "Confirmed").length;
  const upcoming = bookings.filter((item) => item.eventDate >= today && item.status !== "Cancelled" && item.status !== "Completed").length;

  const days = eachDayOfInterval({ start: subDays(new Date(), 29), end: new Date() });
  const activity = days.map((date) => {
    const key = format(date, "yyyy-MM-dd");
    return {
      day: format(date, "MMM d"),
      inquiries: inquiries.filter((item) => item.createdAt.slice(0, 10) === key).length,
    };
  });

  const cards = [
    { label: "New inquiries", value: newInquiries, hint: "Waiting on a first reply", href: "/admin/inquiries?status=NEW" },
    { label: "Pending proposals", value: pendingProposals, hint: "Drafts not yet accepted", href: "/admin/proposals?view=pending" },
    { label: "Confirmed bookings", value: confirmed, hint: "Dates held", href: "/admin/bookings?status=Confirmed" },
    { label: "Upcoming events", value: upcoming, hint: "Still ahead", href: "/admin/calendar" },
  ];

  const latest = [...inquiries].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6);

  return (
    <div className="min-w-0 space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-950">Dashboard</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Quotation requests, proposals, and confirmed bookings.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.label} href={card.href} className="rounded-lg border border-black/5 bg-white p-5 shadow-sm transition hover:border-black/10">
            <p className="text-[11px] font-medium text-neutral-400">{card.label}</p>
            <p className="mt-3 text-4xl font-bold tracking-tight text-neutral-950">{card.value}</p>
            <p className="mt-4 border-t border-neutral-100 pt-3 text-xs text-neutral-400">{card.hint}</p>
          </Link>
        ))}
      </div>

      <div className="grid min-w-0 items-start gap-4 xl:grid-cols-[1.5fr_0.9fr]">
        <section className="min-w-0 rounded-lg border border-black/5 bg-white p-5 shadow-sm">
          <h2 className="text-[11px] font-semibold text-neutral-500">Inquiry activity</h2>
          <p className="mt-1 text-xs text-neutral-400">Requests received over the last 30 days.</p>
          <div className="mt-4 h-72 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activity} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#efefef" />
                <XAxis dataKey="day" interval={4} tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} width={28} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="inquiries" stroke="#c4454d" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="min-w-0 rounded-lg border border-black/5 bg-white shadow-sm">
          <header className="flex items-center justify-between px-5 pt-5">
            <h2 className="text-[11px] font-semibold text-neutral-500">Latest inquiries</h2>
            <Link href="/admin/inquiries" className="text-[11px] font-semibold text-[#c4454d]">
              View all
            </Link>
          </header>
          <ul className="mt-2">
            {latest.map((inquiry) => (
              <li key={inquiry.id} className="border-b border-neutral-100 last:border-0">
                <Link href={`/admin/inquiries/${inquiry.id}`} className="block px-5 py-3.5 hover:bg-neutral-50">
                  <p className="text-[11px] font-medium text-[#1f8a4c]">{inquiry.eventType}</p>
                  <p className="mt-1 text-sm font-medium text-neutral-950">{inquiry.fullName}</p>
                  <p className="mt-1 text-xs text-neutral-400">{formatDateTime(inquiry.createdAt)} · {formatLabel(inquiry.status)}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

import { cn } from "@/lib/utils";

const tones: Record<string, string> = {
  NEW: "border-sky-200 bg-sky-50 text-sky-950",
  CONTACTED: "border-indigo-200 bg-indigo-50 text-indigo-950",
  "FOR REVIEW": "border-amber-200 bg-amber-50 text-amber-950",
  "PROPOSAL PREPARATION": "border-violet-200 bg-violet-50 text-violet-950",
  "PROPOSAL SENT": "border-blue-200 bg-blue-50 text-blue-950",
  ACCEPTED: "border-emerald-200 bg-emerald-50 text-emerald-950",
  DECLINED: "border-rose-200 bg-rose-50 text-rose-950",
  ARCHIVED: "border-stone-200 bg-stone-50 text-stone-600",
  DRAFT: "border-stone-200 bg-stone-50 text-stone-700",
  "FOR APPROVAL": "border-amber-200 bg-amber-50 text-amber-950",
  APPROVED: "border-teal-200 bg-teal-50 text-teal-950",
  SENT: "border-blue-200 bg-blue-50 text-blue-950",
  REVISED: "border-violet-200 bg-violet-50 text-violet-950",
  Tentative: "border-amber-200 bg-amber-50 text-amber-950",
  Confirmed: "border-emerald-200 bg-emerald-50 text-emerald-950",
  Ongoing: "border-sky-200 bg-sky-50 text-sky-950",
  Completed: "border-stone-200 bg-stone-50 text-stone-700",
  Cancelled: "border-rose-200 bg-rose-50 text-rose-950",
  Unpaid: "border-rose-200 bg-rose-50 text-rose-950",
  Partial: "border-amber-200 bg-amber-50 text-amber-950",
  Paid: "border-emerald-200 bg-emerald-50 text-emerald-950",
  Refunded: "border-stone-200 bg-stone-50 text-stone-600",
  Active: "border-emerald-200 bg-emerald-50 text-emerald-950",
  Lead: "border-sky-200 bg-sky-50 text-sky-950",
  Inactive: "border-stone-200 bg-stone-50 text-stone-600",
  Invited: "border-amber-200 bg-amber-50 text-amber-950",
  Published: "border-emerald-200 bg-emerald-50 text-emerald-950",
  Unpublished: "border-stone-200 bg-stone-50 text-stone-600",
  Featured: "border-amber-200 bg-amber-50 text-amber-950",
  Failed: "border-rose-200 bg-rose-50 text-rose-950",
  Pending: "border-amber-200 bg-amber-50 text-amber-950",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center border px-2 py-1 text-[10px] font-medium tracking-[0.14em] uppercase",
        tones[status] ?? "border-stone-200 bg-white text-ink",
        className,
      )}
    >
      {status}
    </span>
  );
}

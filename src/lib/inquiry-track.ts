import { formatLabel } from "@/lib/format";

/** Human-friendly progress steps for the public track page. */
export const TRACK_STEPS = [
  { status: "NEW", label: "Received", description: "Your request is in our inbox." },
  { status: "CONTACTED", label: "In touch", description: "Our team has reached out to you." },
  { status: "FOR REVIEW", label: "Under review", description: "We are reviewing the details." },
  {
    status: "PROPOSAL PREPARATION",
    label: "Preparing proposal",
    description: "Your quotation is being prepared.",
  },
  { status: "PROPOSAL SENT", label: "Proposal sent", description: "The quotation is on its way to you." },
  { status: "ACCEPTED", label: "Accepted", description: "You accepted the proposal." },
] as const;

export function trackStepIndex(status: string) {
  if (status === "DECLINED" || status === "ARCHIVED") return -1;
  const index = TRACK_STEPS.findIndex((step) => step.status === status);
  return index >= 0 ? index : 0;
}

export function trackStatusLabel(status: string) {
  if (status === "DECLINED") return "Declined";
  if (status === "ARCHIVED") return "Closed";
  return formatLabel(status);
}

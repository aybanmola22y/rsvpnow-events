"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Container, Field, publicButtonClass, publicControlClass } from "@/components/shared/chrome";
import { CurrencyDisplay } from "@/components/shared/currency";
import { ProposalSuccess } from "@/components/public/contact-page";
import { EVENT_TYPES } from "@/lib/types";
import { hoursBetween, wait } from "@/lib/format";
import { estimateEvent } from "@/lib/pricing";
import { useDemoStore } from "@/lib/store/demo-store";
import { cn } from "@/lib/utils";

const steps = ["Details", "Venue", "Package", "Services", "Client", "Review"];

type Draft = {
  eventType: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  guestCount: string;
  venueMode: "our" | "client";
  venueId: string;
  venueName: string;
  venueAddress: string;
  location: string;
  packageMode: "package" | "custom";
  packageId: string;
  serviceIds: string[];
  fullName: string;
  company: string;
  email: string;
  phone: string;
};

const emptyDraft: Draft = {
  eventType: "Wedding",
  eventDate: "",
  startTime: "16:00",
  endTime: "22:00",
  guestCount: "100",
  venueMode: "our",
  venueId: "",
  venueName: "",
  venueAddress: "",
  location: "",
  packageMode: "package",
  packageId: "",
  serviceIds: [],
  fullName: "",
  company: "",
  email: "",
  phone: "",
};

export function BuildEventWizard() {
  const params = useSearchParams();
  const venueList = useDemoStore((state) => state.venues);
  const packageList = useDemoStore((state) => state.packages);
  const serviceList = useDemoStore((state) => state.services);
  const venues = useMemo(() => venueList.filter((venue) => venue.published), [venueList]);
  const packages = useMemo(() => packageList.filter((item) => item.published && !item.archived), [packageList]);
  const services = useMemo(() => serviceList.filter((service) => service.active), [serviceList]);
  const submitInquiry = useDemoStore((state) => state.submitInquiry);
  const initialPackage = packages.find((item) => item.slug === params.get("package"));
  const initialVenue = venues.find((item) => item.slug === params.get("venue"));
  const initialStep = Math.min(5, Math.max(0, Number(params.get("step") ?? 1) - 1));
  const [step, setStep] = useState(Number.isFinite(initialStep) ? initialStep : 0);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [reference, setReference] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>({
    ...emptyDraft,
    eventType: initialPackage?.eventType ?? "Wedding",
    venueId: initialVenue?.id ?? "",
    packageId: initialPackage?.id ?? "",
    packageMode: initialPackage ? "package" : "package",
  });

  function patch(partial: Partial<Draft>) {
    setDraft((current) => ({ ...current, ...partial }));
    setError("");
  }

  const guests = Number(draft.guestCount) || 0;
  const hours = hoursBetween(draft.startTime, draft.endTime);
  const venue = venues.find((item) => item.id === draft.venueId) ?? null;
  const eventPackage = packages.find((item) => item.id === draft.packageId) ?? null;
  const selectedServices = services.filter((service) => draft.serviceIds.includes(service.id));
  const estimate = useMemo(
    () =>
      estimateEvent({
        venue,
        clientVenue: draft.venueMode === "client",
        eventPackage: draft.packageMode === "package" ? eventPackage : null,
        services: selectedServices,
        guests,
        hours,
      }),
    [venue, draft.venueMode, draft.packageMode, eventPackage, selectedServices, guests, hours],
  );

  function validate(current: number) {
    if (current === 0) {
      if (!draft.eventType || !draft.eventDate || !draft.startTime || !draft.endTime) return "Complete the event details.";
      if (!(guests > 0)) return "Enter the number of guests.";
      if (!(draft.endTime > draft.startTime)) return "End time must be after the start time.";
    }
    if (current === 1) {
      if (draft.venueMode === "our" && !draft.venueId) return "Select one of our venues.";
      if (draft.venueMode === "client" && (!draft.venueName.trim() || !draft.venueAddress.trim() || !draft.location.trim())) {
        return "Enter the venue name, address, and location.";
      }
    }
    if (current === 2 && draft.packageMode === "package" && !draft.packageId) return "Select a package or choose a custom event.";
    if (current === 4) {
      if (draft.fullName.trim().length < 2) return "Enter the client’s full name.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email)) return "Enter a valid email address.";
      if (draft.phone.trim().length < 7) return "Enter a phone number.";
    }
    return "";
  }

  function next() {
    const message = validate(step);
    if (message) {
      setError(message);
      return;
    }
    setStep((value) => Math.min(steps.length - 1, value + 1));
  }

  async function submit() {
    const message = validate(4);
    if (message) {
      setError(message);
      setStep(4);
      return;
    }
    setPending(true);
    await wait();
    const inquiry = submitInquiry({
      fullName: draft.fullName.trim(),
      company: draft.company.trim(),
      email: draft.email.trim(),
      phone: draft.phone.trim(),
      eventType: draft.eventType,
      eventDate: draft.eventDate,
      startTime: draft.startTime,
      endTime: draft.endTime,
      guestCount: guests,
      venuePreference: draft.venueMode === "our" ? draft.venueId : "client",
      venueName: draft.venueMode === "client" ? draft.venueName : venue?.name ?? "",
      venueAddress: draft.venueMode === "client" ? `${draft.venueAddress}, ${draft.location}` : "",
      packageId: draft.packageMode === "package" ? draft.packageId : "",
      serviceIds: draft.serviceIds,
      budget: estimate.total,
      theme: "",
      specialRequests: "Prepared through Build Your Event.",
      source: "builder",
    });
    setPending(false);
    setReference(inquiry.number);
  }

  if (reference) return <ProposalSuccess number={reference} />;

  return (
    <div className="py-16">
      <Container className="max-w-4xl">
        <p className="text-[11px] tracking-[0.22em] text-gold uppercase">Planner</p>
        <h1 className="mt-3 font-display text-5xl">Build your event</h1>
        <ol className="mt-8 grid grid-cols-3 gap-2 md:grid-cols-6">
          {steps.map((label, index) => (
            <li key={label}>
              <button
                type="button"
                disabled={index > step}
                onClick={() => index < step && setStep(index)}
                className={cn(
                  "w-full border px-2 py-3 text-left text-xs tracking-wide uppercase",
                  index === step ? "border-ink bg-ink text-white" : "border-stone-200 bg-white",
                  index > step && "opacity-50",
                )}
              >
                0{index + 1} {label}
              </button>
            </li>
          ))}
        </ol>

        <div className="mt-8 bg-white p-6 md:p-8">
          {step === 0 && (
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Event type">
                <Select value={draft.eventType} onValueChange={(value) => patch({ eventType: value })}>
                  <SelectTrigger className={publicControlClass}><SelectValue /></SelectTrigger>
                  <SelectContent>{EVENT_TYPES.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Event date">
                <Input type="date" className={publicControlClass} value={draft.eventDate} onChange={(event) => patch({ eventDate: event.target.value })} />
              </Field>
              <Field label="Start time">
                <Input type="time" className={publicControlClass} value={draft.startTime} onChange={(event) => patch({ startTime: event.target.value })} />
              </Field>
              <Field label="End time">
                <Input type="time" className={publicControlClass} value={draft.endTime} onChange={(event) => patch({ endTime: event.target.value })} />
              </Field>
              <Field label="Number of guests">
                <Input type="number" min={1} className={publicControlClass} value={draft.guestCount} onChange={(event) => patch({ guestCount: event.target.value })} />
              </Field>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <div className="flex gap-2">
                <Button type="button" variant={draft.venueMode === "our" ? "default" : "outline"} onClick={() => patch({ venueMode: "our" })}>Our Venue</Button>
                <Button type="button" variant={draft.venueMode === "client" ? "default" : "outline"} onClick={() => patch({ venueMode: "client" })}>Client Venue</Button>
              </div>
              {draft.venueMode === "our" ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {venues.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => patch({ venueId: item.id })}
                      className={cn("border p-3 text-left", draft.venueId === item.id ? "border-ink" : "border-stone-200")}
                    >
                      <img src={item.images[0]} alt="" className="h-28 w-full object-cover" />
                      <p className="mt-2 font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.location}</p>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="grid gap-4">
                  <Field label="Venue name"><Input className={publicControlClass} value={draft.venueName} onChange={(event) => patch({ venueName: event.target.value })} /></Field>
                  <Field label="Address"><Input className={publicControlClass} value={draft.venueAddress} onChange={(event) => patch({ venueAddress: event.target.value })} /></Field>
                  <Field label="Location"><Input className={publicControlClass} value={draft.location} onChange={(event) => patch({ location: event.target.value })} /></Field>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button type="button" variant={draft.packageMode === "package" ? "default" : "outline"} onClick={() => patch({ packageMode: "package" })}>Select Package</Button>
                <Button type="button" variant={draft.packageMode === "custom" ? "default" : "outline"} onClick={() => patch({ packageMode: "custom", packageId: "" })}>Custom Event</Button>
              </div>
              {draft.packageMode === "package" ? (
                <div className="grid gap-3">
                  {packages.map((item) => (
                    <button key={item.id} type="button" onClick={() => patch({ packageId: item.id, eventType: item.eventType })} className={cn("border p-4 text-left", draft.packageId === item.id && "border-ink")}>
                      <span className="font-medium">{item.name}</span>
                      <span className="mt-1 block text-sm text-muted-foreground"><CurrencyDisplay value={item.salePrice ?? item.price} /></span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-stone-600">We will price the evening from the venue and services you choose.</p>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="grid gap-3 sm:grid-cols-2">
              {services.map((service) => {
                const selected = draft.serviceIds.includes(service.id);
                return (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() =>
                      patch({
                        serviceIds: selected
                          ? draft.serviceIds.filter((id) => id !== service.id)
                          : [...draft.serviceIds, service.id],
                      })
                    }
                    className={cn("border p-4 text-left", selected && "border-ink bg-secondary")}
                  >
                    <p className="font-medium">{service.name}</p>
                    <p className="text-sm text-muted-foreground"><CurrencyDisplay value={service.price} /> · {service.pricingType}</p>
                  </button>
                );
              })}
            </div>
          )}

          {step === 4 && (
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Full name"><Input className={publicControlClass} value={draft.fullName} onChange={(event) => patch({ fullName: event.target.value })} /></Field>
              <Field label="Company"><Input className={publicControlClass} value={draft.company} onChange={(event) => patch({ company: event.target.value })} /></Field>
              <Field label="Email"><Input type="email" className={publicControlClass} value={draft.email} onChange={(event) => patch({ email: event.target.value })} /></Field>
              <Field label="Phone"><Input className={publicControlClass} value={draft.phone} onChange={(event) => patch({ phone: event.target.value })} /></Field>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <dl className="grid gap-3 text-sm md:grid-cols-2">
                <div><dt className="text-muted-foreground">Event</dt><dd>{draft.eventType} · {draft.eventDate} · {guests} guests</dd></div>
                <div><dt className="text-muted-foreground">Venue</dt><dd>{draft.venueMode === "our" ? venue?.name : draft.venueName}</dd></div>
                <div><dt className="text-muted-foreground">Package</dt><dd>{draft.packageMode === "package" ? eventPackage?.name : "Custom event"}</dd></div>
                <div><dt className="text-muted-foreground">Client</dt><dd>{draft.fullName}</dd></div>
              </dl>
              <div className="border-t pt-4">
                {estimate.lines.map((line) => (
                  <div key={line.label} className="flex justify-between py-1 text-sm">
                    <span>{line.label}</span>
                    <CurrencyDisplay value={line.amount} />
                  </div>
                ))}
                <div className="mt-3 flex justify-between border-t pt-3 font-medium">
                  <span>Estimated total</span>
                  <CurrencyDisplay value={estimate.total} />
                </div>
                <p className="mt-3 text-xs text-muted-foreground">Estimated pricing only. Final pricing is subject to review.</p>
              </div>
            </div>
          )}

          {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}
          <div className="mt-8 flex justify-between gap-3">
            <Button type="button" variant="outline" disabled={step === 0 || pending} onClick={() => setStep((value) => value - 1)}>Back</Button>
            {step < 5 ? (
              <Button type="button" className={publicButtonClass} onClick={next}>Continue</Button>
            ) : (
              <Button type="button" className={publicButtonClass} disabled={pending} onClick={() => void submit()}>
                {pending ? "Creating..." : "Request Formal Proposal"}
              </Button>
            )}
          </div>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Prefer a single form? <Link href="/request-proposal" className="underline">Request a proposal</Link>
        </p>
      </Container>
    </div>
  );
}

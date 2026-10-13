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
import { formatDate, formatTime, hoursBetween, packagePrice, wait } from "@/lib/format";
import { estimateEvent } from "@/lib/pricing";
import { useDemoStore } from "@/lib/store/demo-store";
import { cn } from "@/lib/utils";

const steps = [
  {
    label: "Details",
    title: "The evening",
    copy: "The occasion, the date, and how many people you are hosting.",
  },
  {
    label: "Venue",
    title: "The room",
    copy: "A house venue, or the address where the event already lives.",
  },
  {
    label: "Package",
    title: "The composition",
    copy: "A published package sets the frame. A custom event is priced from the room and the services.",
  },
  {
    label: "Services",
    title: "What you add",
    copy: "Optional. Choose only what the evening still needs.",
  },
  {
    label: "Client",
    title: "Who we write to",
    copy: "The proposal is addressed to this name. A company is optional.",
  },
  {
    label: "Review",
    title: "Before we send it",
    copy: "Estimated pricing only. A planner confirms the final quotation.",
  },
];

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
  const serviceGroups = useMemo(() => {
    const groups: { category: string; items: typeof services }[] = [];
    for (const service of services) {
      const existing = groups.find((group) => group.category === service.category);
      if (existing) existing.items.push(service);
      else groups.push({ category: service.category, items: [service] });
    }
    return groups;
  }, [services]);
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

  const current = steps[step];
  const venueLabel =
    draft.venueMode === "our" ? venue?.name ?? "Not chosen" : draft.venueName.trim() || "Client venue";
  const packageLabel =
    draft.packageMode === "custom" ? "Custom event" : eventPackage?.name ?? "Not chosen";

  return (
    <div className="py-16">
      <Container className="max-w-6xl">
        <p className="text-[11px] tracking-[0.22em] text-gold uppercase">Planner</p>
        <h1 className="mt-3 font-display text-5xl">Build your event</h1>
        <p className="mt-4 max-w-xl text-stone-600">
          Six short steps. The estimate stays beside the form and updates as you choose.
        </p>

        <div className="mt-10 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_18.5rem]">
          <div>
            <ol className="grid grid-cols-3 gap-x-4 border-b border-stone-200 md:grid-cols-6">
              {steps.map((item, index) => (
                <li key={item.label}>
                  <button
                    type="button"
                    disabled={index > step}
                    onClick={() => index < step && setStep(index)}
                    className={cn(
                      "-mb-px w-full border-b-2 pb-3 text-left",
                      index === step ? "border-ink" : "border-transparent",
                      index > step && "cursor-default opacity-40",
                    )}
                  >
                    <span className={cn("block text-[10px] tracking-[0.18em] uppercase", index === step ? "text-gold" : "text-stone-400")}>
                      0{index + 1}
                    </span>
                    <span className={cn("mt-1 block text-sm", index === step ? "text-ink" : "text-stone-500")}>{item.label}</span>
                  </button>
                </li>
              ))}
            </ol>

            <div className="mt-8 border border-stone-200 bg-white p-6 md:p-8">
              <p className="text-[11px] tracking-[0.22em] text-gold uppercase">Step 0{step + 1}</p>
              <h2 className="mt-2 font-display text-4xl">{current.title}</h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-stone-600">{current.copy}</p>

              <div className="mt-8">
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
                    <Choice
                      value={draft.venueMode}
                      onChange={(value) => patch({ venueMode: value as Draft["venueMode"] })}
                      options={[
                        { value: "our", label: "Our venue" },
                        { value: "client", label: "Client venue" },
                      ]}
                    />
                    {draft.venueMode === "our" ? (
                      <div className="grid gap-3 sm:grid-cols-2">
                        {venues.map((item) => {
                          const selected = draft.venueId === item.id;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => patch({ venueId: item.id })}
                              className={cn(
                                "border bg-white text-left",
                                selected ? "border-ink" : "border-stone-200 hover:border-stone-400",
                              )}
                            >
                              <img src={item.images[0]} alt="" className="aspect-[3/2] w-full object-cover" />
                              <span className="block p-4">
                                <span className="flex items-start justify-between gap-3">
                                  <span className="font-display text-2xl leading-none">{item.name}</span>
                                  {selected ? <SelectedMark /> : null}
                                </span>
                                <span className="mt-2 block text-sm text-stone-500">{item.location}</span>
                                <span className="mt-3 flex items-baseline justify-between gap-3 text-sm">
                                  <span className="text-stone-500">{item.minCapacity}–{item.maxCapacity} guests</span>
                                  <span>From <CurrencyDisplay value={item.startingPrice} /></span>
                                </span>
                              </span>
                            </button>
                          );
                        })}
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
                  <div className="space-y-5">
                    <Choice
                      value={draft.packageMode}
                      onChange={(value) =>
                        patch(
                          value === "custom"
                            ? { packageMode: "custom", packageId: "" }
                            : { packageMode: "package" },
                        )
                      }
                      options={[
                        { value: "package", label: "Select package" },
                        { value: "custom", label: "Custom event" },
                      ]}
                    />
                    {draft.packageMode === "package" ? (
                      <div className="grid gap-3">
                        {packages.map((item) => {
                          const selected = draft.packageId === item.id;
                          const price = packagePrice(item.price, item.salePrice);
                          const onSale = item.salePrice != null && item.salePrice > 0 && item.salePrice < item.price;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => patch({ packageId: item.id, eventType: item.eventType })}
                              className={cn(
                                "grid border bg-white text-left sm:grid-cols-[9.5rem_1fr]",
                                selected ? "border-ink" : "border-stone-200 hover:border-stone-400",
                              )}
                            >
                              <img src={item.image} alt="" className="aspect-[3/2] h-full w-full object-cover sm:aspect-auto sm:min-h-36" />
                              <span className="flex flex-col p-4 sm:p-5">
                                <span className="flex items-center justify-between gap-3">
                                  <span className="text-[11px] tracking-[0.18em] text-gold uppercase">{item.eventType}</span>
                                  {selected ? <SelectedMark /> : null}
                                </span>
                                <span className="mt-2 font-display text-2xl leading-none">{item.name}</span>
                                <span className="mt-2 line-clamp-2 text-sm leading-relaxed text-stone-600">{item.description}</span>
                                <span className="mt-4 flex items-baseline justify-between gap-3 text-sm">
                                  <span className="text-stone-500">Up to {item.guestCapacity} guests</span>
                                  <span>
                                    {onSale ? (
                                      <span className="mr-2 text-stone-400 line-through">
                                        <CurrencyDisplay value={item.price} />
                                      </span>
                                    ) : null}
                                    <CurrencyDisplay value={price} />
                                  </span>
                                </span>
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="border border-stone-200 bg-stone-50 px-5 py-8">
                        <p className="font-display text-3xl">A custom evening</p>
                        <p className="mt-2 max-w-lg text-sm leading-relaxed text-stone-600">
                          No package is applied. The estimate uses the venue and any services you add on the next step.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-8">
                    {serviceGroups.map((group) => (
                      <section key={group.category}>
                        <h3 className="text-[11px] tracking-[0.18em] text-stone-400 uppercase">{group.category}</h3>
                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                          {group.items.map((service) => {
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
                                className={cn(
                                  "flex h-full flex-col border p-4 text-left",
                                  selected ? "border-ink bg-stone-50" : "border-stone-200 bg-white hover:border-stone-400",
                                )}
                              >
                                <span className="flex items-start justify-between gap-3">
                                  <span className="font-medium">{service.name}</span>
                                  {selected ? <SelectedMark /> : null}
                                </span>
                                <span className="mt-2 line-clamp-2 text-sm leading-relaxed text-stone-600">{service.description}</span>
                                <span className="mt-auto pt-4 text-sm">
                                  <CurrencyDisplay value={service.price} />
                                  <span className="text-stone-500"> · {service.pricingType}</span>
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </section>
                    ))}
                  </div>
                )}

                {step === 4 && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Full name"><Input className={publicControlClass} value={draft.fullName} onChange={(event) => patch({ fullName: event.target.value })} /></Field>
                    <Field label="Company" hint="Optional"><Input className={publicControlClass} value={draft.company} onChange={(event) => patch({ company: event.target.value })} /></Field>
                    <Field label="Email"><Input type="email" className={publicControlClass} value={draft.email} onChange={(event) => patch({ email: event.target.value })} /></Field>
                    <Field label="Phone"><Input className={publicControlClass} value={draft.phone} onChange={(event) => patch({ phone: event.target.value })} /></Field>
                  </div>
                )}

                {step === 5 && (
                  <div className="space-y-8">
                    <dl className="grid gap-6 border-t border-stone-200 pt-6 sm:grid-cols-2">
                      <ReviewItem label="Event" value={`${draft.eventType} · ${guests} guests`} />
                      <ReviewItem label="When" value={draft.eventDate ? `${formatDate(draft.eventDate)} · ${formatTime(draft.startTime)}–${formatTime(draft.endTime)}` : "Date not set"} />
                      <ReviewItem label="Venue" value={venueLabel} />
                      <ReviewItem label="Package" value={packageLabel} />
                      <ReviewItem label="Services" value={selectedServices.length ? selectedServices.map((service) => service.name).join(", ") : "None added"} />
                      <ReviewItem label="Client" value={draft.company.trim() ? `${draft.fullName} · ${draft.company.trim()}` : draft.fullName} />
                    </dl>
                    <EstimateLines lines={estimate.lines} total={estimate.total} />
                  </div>
                )}
              </div>

              {error ? <p className="mt-6 text-sm text-destructive">{error}</p> : null}
              <div className="mt-8 flex items-center justify-between gap-3 border-t border-stone-200 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  disabled={step === 0 || pending}
                  onClick={() => setStep((value) => value - 1)}
                  className="h-12 rounded-none border-stone-300 px-7 text-[11px] font-medium tracking-[0.18em] uppercase"
                >
                  Back
                </Button>
                {step < 5 ? (
                  <Button type="button" className={publicButtonClass} onClick={next}>Continue</Button>
                ) : (
                  <Button type="button" className={publicButtonClass} disabled={pending} onClick={() => void submit()}>
                    {pending ? "Creating..." : "Request formal proposal"}
                  </Button>
                )}
              </div>
            </div>
            <p className="mt-4 text-sm text-stone-500">
              Prefer a single form? <Link href="/request-proposal" className="text-ink underline underline-offset-4">Request a proposal</Link>
            </p>
          </div>

          <aside className="border border-stone-200 bg-white p-6 lg:sticky lg:top-28">
            <p className="text-[11px] tracking-[0.22em] text-gold uppercase">Estimate</p>
            <p className="mt-3 font-display text-4xl leading-none">
              <CurrencyDisplay value={estimate.total} />
            </p>
            <p className="mt-3 text-xs leading-relaxed text-stone-500">
              Estimated pricing only. Final pricing is subject to review.
            </p>
            <dl className="mt-6 space-y-3 border-t border-stone-200 pt-5 text-sm">
              <SideFact label="Occasion" value={`${draft.eventType} · ${guests || "—"} guests`} />
              <SideFact label="Venue" value={venueLabel} />
              <SideFact label="Package" value={packageLabel} />
              <SideFact label="Added" value={selectedServices.length ? `${selectedServices.length} services` : "None"} />
            </dl>
            {estimate.lines.length ? (
              <div className="mt-5 border-t border-stone-200 pt-4">
                {estimate.lines.map((line) => (
                  <div key={line.label} className="flex justify-between gap-3 py-1 text-sm">
                    <span className="text-stone-600">{line.label}</span>
                    <CurrencyDisplay value={line.amount} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-5 border-t border-stone-200 pt-4 text-sm text-stone-500">
                The total fills in once a venue, package, or service is chosen.
              </p>
            )}
          </aside>
        </div>
      </Container>
    </div>
  );
}

function Choice({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="inline-flex border border-stone-300">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "h-10 px-4 text-[11px] font-medium tracking-[0.16em] uppercase",
            value === option.value ? "bg-ink text-white" : "bg-white text-stone-600 hover:bg-stone-50",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function SelectedMark() {
  return <span className="text-[10px] tracking-[0.16em] text-gold uppercase">Selected</span>;
}

function ReviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] tracking-[0.16em] text-stone-400 uppercase">{label}</dt>
      <dd className="mt-1 text-sm text-ink">{value}</dd>
    </div>
  );
}

function SideFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-stone-400">{label}</dt>
      <dd className="text-right">{value}</dd>
    </div>
  );
}

function EstimateLines({ lines, total }: { lines: { label: string; amount: number }[]; total: number }) {
  return (
    <div className="border-t border-stone-200 pt-6">
      {lines.length ? (
        lines.map((line) => (
          <div key={line.label} className="flex justify-between gap-4 py-1.5 text-sm">
            <span>{line.label}</span>
            <CurrencyDisplay value={line.amount} />
          </div>
        ))
      ) : (
        <p className="text-sm text-stone-500">Nothing is priced yet.</p>
      )}
      <div className="mt-4 flex items-baseline justify-between border-t border-stone-200 pt-4">
        <span className="text-[11px] tracking-[0.16em] uppercase">Estimated total</span>
        <span className="font-display text-3xl"><CurrencyDisplay value={total} /></span>
      </div>
    </div>
  );
}

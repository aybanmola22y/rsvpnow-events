"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { Container, publicButtonClass } from "@/components/shared/chrome";
import { CurrencyDisplay } from "@/components/shared/currency";
import { ProposalSuccess } from "@/components/public/contact-page";
import { EVENT_RATES, formatRate } from "@/lib/event-rates";
import { formatDate, formatTime, wait } from "@/lib/format";
import { useDemoStore } from "@/lib/store/demo-store";
import { cn } from "@/lib/utils";

const schema = z.object({
  fullName: z.string().min(2, "Enter your full name"),
  company: z.string(),
  email: z.email("Enter a valid email address"),
  phone: z.string().min(7, "Enter a phone number"),
  eventType: z.string().min(1, "Choose an event type"),
  eventDate: z.string().min(1, "Choose a date"),
  startTime: z.string().min(1, "Choose a start time"),
  endTime: z.string().min(1, "Choose an end time"),
  guestCount: z.number().int().positive("Enter the number of guests"),
  venuePreference: z.string().min(1, "Choose a venue preference"),
  packageId: z.string(),
  serviceIds: z.array(z.string()),
  budget: z.number().min(0, "Enter a budget"),
  theme: z.string(),
  specialRequests: z.string(),
}).refine((values) => values.endTime > values.startTime, {
  path: ["endTime"],
  message: "End time must be after the start time",
});

type FormValues = z.infer<typeof schema>;

const fillControl =
  "h-12 w-full rounded-none border border-stone-300 bg-white px-3 text-base text-ink shadow-none placeholder:text-stone-400 focus-visible:border-ink focus-visible:ring-0";

export function RequestProposalForm() {
  const params = useSearchParams();
  const venueList = useDemoStore((state) => state.venues);
  const packageList = useDemoStore((state) => state.packages);
  const serviceList = useDemoStore((state) => state.services);
  const venues = useMemo(() => venueList.filter((venue) => venue.published), [venueList]);
  const packages = useMemo(() => packageList.filter((item) => item.published && !item.archived), [packageList]);
  const services = useMemo(() => serviceList.filter((service) => service.active), [serviceList]);
  const serviceGroups = useMemo(() => {
    const groups: { category: string; items: typeof services }[] = [];
    for (const service of services) {
      const existing = groups.find((group) => group.category === service.category);
      if (existing) existing.items.push(service);
      else groups.push({ category: service.category, items: [service] });
    }
    return groups;
  }, [services]);
  const submitInquiry = useDemoStore((state) => state.submitInquiry);
  const [pending, setPending] = useState(false);
  const [reference, setReference] = useState<string | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "",
      company: "",
      email: "",
      phone: "",
      eventType: "",
      eventDate: "",
      startTime: "",
      endTime: "",
      guestCount: 80,
      venuePreference: "undecided",
      packageId: "",
      serviceIds: [],
      budget: 100000,
      theme: "",
      specialRequests: "",
    },
  });
  const serviceIds = useWatch({ control: form.control, name: "serviceIds" });

  useEffect(() => {
    const venue = venues.find((item) => item.slug === params.get("venue"));
    const eventPackage = packages.find((item) => item.slug === params.get("package"));
    const service = params.get("service");
    const event = params.get("event");
    const estimate = params.get("estimate");
    const guests = Number(params.get("guests"));
    const budget = Number(params.get("budget"));
    if (venue) form.setValue("venuePreference", venue.id);
    if (eventPackage) {
      form.setValue("packageId", eventPackage.id);
      form.setValue("eventType", eventPackage.eventType);
    }
    if (event) form.setValue("eventType", event);
    if (Number.isFinite(guests) && guests > 0) form.setValue("guestCount", guests);
    if (Number.isFinite(budget) && budget > 0) form.setValue("budget", budget);
    if (estimate) {
      form.setValue("theme", estimate);
      form.setValue("specialRequests", `Instant estimate for ${estimate}${Number.isFinite(guests) && guests > 0 ? `, ${guests} guests` : ""}.`);
    }
    if (service) form.setValue("serviceIds", [service]);
  }, [params, venues, packages, form]);

  async function onSubmit(values: FormValues) {
    setPending(true);
    await wait();
    const venue = venues.find((item) => item.id === values.venuePreference);
    const inquiry = submitInquiry({
      ...values,
      venueName: venue?.name ?? "",
      venueAddress: "",
      source: "website",
    });
    setPending(false);
    setReference(inquiry.number);
  }

  const values = useWatch({ control: form.control });
  const selectedServices = services.filter((service) => (values.serviceIds ?? serviceIds).includes(service.id));
  const venueChoice = venues.find((item) => item.id === values.venuePreference);
  const packageChoice = packages.find((item) => item.id === values.packageId);
  const selectedRate = EVENT_RATES.find((rate) => rate.name === values.eventType);
  const venueLabel =
    values.venuePreference === "client"
      ? "Your own venue"
      : values.venuePreference === "undecided" || !values.venuePreference
        ? "No preference yet"
        : venueChoice?.name ?? "No preference yet";
  const whenLabel = values.eventDate
    ? `${formatDate(values.eventDate)}${values.startTime && values.endTime ? ` · ${formatTime(values.startTime)}–${formatTime(values.endTime)}` : ""}`
    : "Date not set";

  if (reference) return <ProposalSuccess number={reference} />;

  return (
    <div className="py-10">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] tracking-[0.22em] text-gold uppercase">Proposal</p>
            <h1 className="mt-2 font-display text-4xl md:text-5xl">Request a proposal</h1>
          </div>
          <p className="max-w-sm text-sm text-stone-600">
            Tell us the shape of the evening. We reply with an itemized quotation.{" "}
            <Link href="/build-event" className="text-ink underline underline-offset-4">Build it step by step</Link>
          </p>
        </div>

        <form className="mt-5" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="mb-5 flex flex-wrap items-end justify-between gap-x-8 gap-y-3 border border-stone-200 bg-white px-5 py-4">
            <div>
              <p className="text-[11px] tracking-[0.22em] text-gold uppercase">This request</p>
              <p className="mt-1 font-display text-3xl leading-none">
                <CurrencyDisplay value={Number(values.budget) || 0} />
              </p>
            </div>
            <dl className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <SideFact label="For" value={values.fullName?.trim() || "Not named yet"} />
              <SideFact label="Occasion" value={values.eventType ? `${values.eventType} · ${values.guestCount || "—"} guests` : "Not chosen"} />
              <SideFact label="When" value={whenLabel} />
              <SideFact label="Venue" value={venueLabel} />
              <SideFact label="Starting" value={selectedRate ? formatRate(selectedRate) : packageChoice?.name ?? "Not chosen"} />
              <SideFact label="Added" value={selectedServices.length ? `${selectedServices.length} services` : "None"} />
            </dl>
          </div>
          <div className="border border-stone-200 bg-white">
            <div className="grid gap-10 bg-[#f7f6f4] p-5 md:p-8 xl:grid-cols-2 xl:gap-16">
              <FormSection eyebrow="01" title="Who we write to" lede="The quotation is addressed to this person." className="mt-0 border-0 pt-0">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Fill label="Full name" error={form.formState.errors.fullName?.message}>
                    <Input autoComplete="name" placeholder="Alex Tan" className={fillControl} {...form.register("fullName")} />
                  </Fill>
                  <Fill label="Company" hint="Optional">
                    <Input autoComplete="organization" placeholder="Company or family" className={fillControl} {...form.register("company")} />
                  </Fill>
                  <Fill label="Email" error={form.formState.errors.email?.message}>
                    <Input type="email" autoComplete="email" placeholder="name@company.com" className={fillControl} {...form.register("email")} />
                  </Fill>
                  <Fill label="Phone" error={form.formState.errors.phone?.message}>
                    <Input type="tel" autoComplete="tel" placeholder="+65 9123 4567" className={fillControl} {...form.register("phone")} />
                  </Fill>
                </div>
              </FormSection>

              <FormSection eyebrow="02" title="The evening" lede="The date, the hours, and how many people are coming." className="mt-0 border-0 pt-0">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Fill label="Event type" error={form.formState.errors.eventType?.message}>
                    <Select value={values.eventType || ""} onValueChange={(value) => form.setValue("eventType", value, { shouldValidate: true })}>
                      <SelectTrigger className={fillControl}><SelectValue placeholder="Choose an occasion" /></SelectTrigger>
                      <SelectContent>{EVENT_RATES.map((rate) => <SelectItem key={rate.id} value={rate.name}>{rate.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </Fill>
                  <Fill label="Event date" error={form.formState.errors.eventDate?.message}>
                    <Input type="date" className={fillControl} {...form.register("eventDate")} />
                  </Fill>
                  <Fill label="Start time" error={form.formState.errors.startTime?.message}>
                    <Input type="time" className={fillControl} {...form.register("startTime")} />
                  </Fill>
                  <Fill label="End time" error={form.formState.errors.endTime?.message}>
                    <Input type="time" className={fillControl} {...form.register("endTime")} />
                  </Fill>
                  <Fill label="Guest count" error={form.formState.errors.guestCount?.message}>
                    <div className="relative">
                      <Input type="number" min={1} placeholder="80" className={cn(fillControl, "pr-20")} {...form.register("guestCount", { valueAsNumber: true })} />
                      <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-stone-400">guests</span>
                    </div>
                  </Fill>
                  <Fill label="Budget" error={form.formState.errors.budget?.message}>
                    <div className="relative">
                      <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-stone-400">S$</span>
                      <Input type="number" min={0} placeholder="100000" className={cn(fillControl, "pl-9")} {...form.register("budget", { valueAsNumber: true })} />
                    </div>
                  </Fill>
                </div>
              </FormSection>
            </div>
            <div className="p-5 md:p-8">

              <FormSection eyebrow="03" title="The room">
                {form.formState.errors.venuePreference?.message ? (
                  <p className="mb-3 text-xs text-destructive">{form.formState.errors.venuePreference.message}</p>
                ) : null}
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
                  <ChoiceCard
                    selected={values.venuePreference === "undecided"}
                    title="No preference yet"
                    detail="We will suggest a room that fits the date and the guest count."
                    onClick={() => form.setValue("venuePreference", "undecided", { shouldValidate: true })}
                  />
                  <ChoiceCard
                    selected={values.venuePreference === "client"}
                    title="Your own venue"
                    detail="The event already has an address. Tell us more in the notes."
                    onClick={() => form.setValue("venuePreference", "client", { shouldValidate: true })}
                  />
                  {venues.map((venue) => (
                    <ChoiceCard
                      key={venue.id}
                      selected={values.venuePreference === venue.id}
                      title={venue.name}
                      detail={`${venue.location} · ${venue.minCapacity}–${venue.maxCapacity} guests`}
                      extra={<span>From <CurrencyDisplay value={venue.startingPrice} /></span>}
                      onClick={() => form.setValue("venuePreference", venue.id, { shouldValidate: true })}
                    />
                  ))}
                </div>
              </FormSection>

              <FormSection eyebrow="04" title="The occasion" lede="Starting prices. The quotation is written after we know the date and the room.">
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {EVENT_RATES.map((rate) => (
                    <ChoiceCard
                      key={rate.id}
                      selected={values.eventType === rate.name}
                      title={rate.name}
                      detail={rate.unit === "pax" ? "Priced per guest" : rate.unit === "event" ? "Priced for the event" : "We will price this after the brief"}
                      extra={<span>{formatRate(rate)}</span>}
                      onClick={() => {
                        form.setValue("eventType", rate.name, { shouldValidate: true });
                        form.setValue("packageId", "");
                      }}
                    />
                  ))}
                </div>
              </FormSection>

              <FormSection eyebrow="05" title="What you add">
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                  {serviceGroups.flatMap((group) =>
                    group.items.map((service) => {
                      const selected = (values.serviceIds ?? []).includes(service.id);
                      return (
                        <ChoiceCard
                          key={service.id}
                          selected={selected}
                          kicker={group.category}
                          title={service.name}
                          detail={`${service.pricingType}`}
                          extra={<CurrencyDisplay value={service.price} />}
                          onClick={() => {
                            const current = form.getValues("serviceIds");
                            form.setValue(
                              "serviceIds",
                              selected ? current.filter((id) => id !== service.id) : [...current, service.id],
                            );
                          }}
                        />
                      );
                    }),
                  )}
                </div>
              </FormSection>

              <FormSection eyebrow="06" title="Notes" lede="Anything the quotation should account for.">
                <div className="grid gap-4 md:grid-cols-[minmax(0,18rem)_1fr] md:items-start">
                  <Fill label="Theme" hint="Optional">
                    <Input placeholder="Ivory, candlelight, navy" className={fillControl} {...form.register("theme")} />
                  </Fill>
                  <Fill label="Special requests" hint="Optional">
                    <Textarea placeholder="Timing, dietary notes, or anything the room should know." className="min-h-24 rounded-none border border-stone-300 bg-white px-3 py-3 text-base text-ink shadow-none placeholder:text-stone-400 focus-visible:border-ink focus-visible:ring-0" {...form.register("specialRequests")} />
                  </Fill>
                </div>
              </FormSection>

              <div className="flex justify-end border-t border-stone-200 pt-5">
                <Button type="submit" disabled={pending} className={publicButtonClass}>
                  {pending ? "Submitting..." : "Submit request"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Container>
    </div>
  );
}

function FormSection({
  eyebrow,
  title,
  lede,
  children,
  className,
}: {
  eyebrow: string;
  title: string;
  lede?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("mt-8 border-t border-stone-200 pt-6 first:mt-0 first:border-t-0 first:pt-0", className)}>
      <div className="flex items-baseline gap-3">
        <p className="text-[11px] tracking-[0.18em] text-gold uppercase">{eyebrow}</p>
        <h2 className="font-display text-2xl">{title}</h2>
      </div>
      {lede ? <p className="mt-1 text-sm text-stone-500">{lede}</p> : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Fill({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between gap-3">
        <span className="text-[11px] tracking-[0.16em] text-stone-500 uppercase">{label}</span>
        {hint ? <span className="text-[11px] text-stone-400">{hint}</span> : null}
      </span>
      <span className="mt-1.5 block">{children}</span>
      {error ? <span className="mt-1 block text-xs text-destructive">{error}</span> : null}
    </label>
  );
}

function ChoiceCard({
  selected,
  kicker,
  title,
  detail,
  extra,
  onClick,
}: {
  selected: boolean;
  kicker?: string;
  title: string;
  detail: string;
  extra?: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-full flex-col border px-3 py-2.5 text-left",
        selected ? "border-ink bg-stone-50" : "border-stone-200 bg-white hover:border-stone-400",
      )}
    >
      <span className="flex items-start justify-between gap-3">
        <span>
          {kicker ? <span className="block text-[10px] tracking-[0.16em] text-gold uppercase">{kicker}</span> : null}
          <span className="block text-sm font-medium">{title}</span>
        </span>
        {selected ? <span className="shrink-0 text-[10px] tracking-[0.16em] text-gold uppercase">Selected</span> : null}
      </span>
      <span className="mt-1 line-clamp-1 text-xs text-stone-500">{detail}</span>
      {extra ? <span className="mt-auto pt-2 text-sm">{extra}</span> : null}
    </button>
  );
}

function SideFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-[10px] tracking-[0.14em] text-stone-400 uppercase">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

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
import { Container, Field, publicButtonClass, publicControlClass } from "@/components/shared/chrome";
import { CurrencyDisplay } from "@/components/shared/currency";
import { ProposalSuccess } from "@/components/public/contact-page";
import { EVENT_TYPES } from "@/lib/types";
import { formatDate, formatTime, packagePrice, wait } from "@/lib/format";
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
              <SideFact label="Package" value={packageChoice?.name ?? "Not sure yet"} />
              <SideFact label="Added" value={selectedServices.length ? `${selectedServices.length} services` : "None"} />
            </dl>
          </div>
          <div className="border border-stone-200 bg-white p-5 md:p-6">
            <div className="grid gap-8 xl:grid-cols-2 xl:gap-10">
              <FormSection eyebrow="01" title="Who we write to" className="mt-0 border-0 pt-0">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Full name" error={form.formState.errors.fullName?.message}>
                    <Input className={publicControlClass} {...form.register("fullName")} />
                  </Field>
                  <Field label="Company" hint="Optional">
                    <Input className={publicControlClass} {...form.register("company")} />
                  </Field>
                  <Field label="Email" error={form.formState.errors.email?.message}>
                    <Input type="email" className={publicControlClass} {...form.register("email")} />
                  </Field>
                  <Field label="Phone" error={form.formState.errors.phone?.message}>
                    <Input className={publicControlClass} {...form.register("phone")} />
                  </Field>
                </div>
              </FormSection>

              <FormSection eyebrow="02" title="The evening" className="mt-0 border-0 pt-0">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Event type" error={form.formState.errors.eventType?.message}>
                    <Select value={values.eventType || ""} onValueChange={(value) => form.setValue("eventType", value, { shouldValidate: true })}>
                      <SelectTrigger className={publicControlClass}><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>{EVENT_TYPES.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent>
                    </Select>
                  </Field>
                  <Field label="Event date" error={form.formState.errors.eventDate?.message}>
                    <Input type="date" className={publicControlClass} {...form.register("eventDate")} />
                  </Field>
                  <Field label="Start time" error={form.formState.errors.startTime?.message}>
                    <Input type="time" className={publicControlClass} {...form.register("startTime")} />
                  </Field>
                  <Field label="End time" error={form.formState.errors.endTime?.message}>
                    <Input type="time" className={publicControlClass} {...form.register("endTime")} />
                  </Field>
                  <Field label="Guest count" error={form.formState.errors.guestCount?.message}>
                    <Input type="number" min={1} className={publicControlClass} {...form.register("guestCount", { valueAsNumber: true })} />
                  </Field>
                  <Field label="Budget" hint="In Philippine pesos" error={form.formState.errors.budget?.message}>
                    <Input type="number" min={0} className={publicControlClass} {...form.register("budget", { valueAsNumber: true })} />
                  </Field>
                </div>
              </FormSection>
            </div>

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

              <FormSection eyebrow="04" title="The package">
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
                  <ChoiceCard
                    selected={!values.packageId}
                    title="Not sure yet"
                    detail="We will recommend a package after we read the brief."
                    onClick={() => form.setValue("packageId", "")}
                  />
                  {packages.map((item) => {
                    const price = packagePrice(item.price, item.salePrice);
                    const onSale = item.salePrice != null && item.salePrice > 0 && item.salePrice < item.price;
                    return (
                      <ChoiceCard
                        key={item.id}
                        selected={values.packageId === item.id}
                        kicker={item.eventType}
                        title={item.name}
                        detail={`Up to ${item.guestCapacity} guests`}
                        extra={
                          <span>
                            {onSale ? (
                              <span className="mr-2 text-stone-400 line-through">
                                <CurrencyDisplay value={item.price} />
                              </span>
                            ) : null}
                            <CurrencyDisplay value={price} />
                          </span>
                        }
                        onClick={() => {
                          form.setValue("packageId", item.id);
                          if (!form.getValues("eventType")) {
                            form.setValue("eventType", item.eventType, { shouldValidate: true });
                          }
                        }}
                      />
                    );
                  })}
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

              <FormSection eyebrow="06" title="Notes">
                <div className="grid gap-3 md:grid-cols-[minmax(0,16rem)_1fr] md:items-start">
                  <Field label="Theme">
                    <Input className={publicControlClass} {...form.register("theme")} />
                  </Field>
                  <Field label="Special requests">
                    <Textarea className="min-h-12 rounded-none border-stone-300 bg-white px-3 py-3 text-base shadow-none" {...form.register("specialRequests")} />
                  </Field>
                </div>
              </FormSection>

              <div className="flex justify-end border-t border-stone-200 pt-5">
                <Button type="submit" disabled={pending} className={publicButtonClass}>
                  {pending ? "Submitting..." : "Submit request"}
                </Button>
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
  children,
  className,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("mt-8 border-t border-stone-200 pt-6 first:mt-0 first:border-t-0 first:pt-0", className)}>
      <div className="flex items-baseline gap-3">
        <p className="text-[11px] tracking-[0.18em] text-gold uppercase">{eyebrow}</p>
        <h2 className="font-display text-2xl">{title}</h2>
      </div>
      <div className="mt-4">{children}</div>
    </section>
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

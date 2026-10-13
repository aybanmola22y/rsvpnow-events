"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Container, Field, publicButtonClass, publicControlClass } from "@/components/shared/chrome";
import { ProposalSuccess } from "@/components/public/contact-page";
import { EVENT_TYPES } from "@/lib/types";
import { wait } from "@/lib/format";
import { useDemoStore } from "@/lib/store/demo-store";

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

  if (reference) return <ProposalSuccess number={reference} />;

  return (
    <div className="py-16">
      <Container className="max-w-3xl">
        <p className="text-[11px] tracking-[0.22em] text-gold uppercase">Proposal</p>
        <h1 className="mt-3 font-display text-5xl">Request a proposal</h1>
        <p className="mt-4 text-stone-600">Tell us the shape of the evening. We will reply with an itemized quotation.</p>
        <form className="mt-8 space-y-5 bg-white p-6 md:p-8" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-4 md:grid-cols-2">
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
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Event type" error={form.formState.errors.eventType?.message}>
              <Select value={form.watch("eventType")} onValueChange={(value) => form.setValue("eventType", value, { shouldValidate: true })}>
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
              <Input type="number" className={publicControlClass} {...form.register("guestCount", { valueAsNumber: true })} />
            </Field>
            <Field label="Budget" error={form.formState.errors.budget?.message}>
              <Input type="number" className={publicControlClass} {...form.register("budget", { valueAsNumber: true })} />
            </Field>
          </div>
          <Field label="Venue preference" error={form.formState.errors.venuePreference?.message}>
            <Select value={form.watch("venuePreference")} onValueChange={(value) => form.setValue("venuePreference", value, { shouldValidate: true })}>
              <SelectTrigger className={publicControlClass}><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="undecided">No preference yet</SelectItem>
                <SelectItem value="client">Client’s own venue</SelectItem>
                {venues.map((venue) => <SelectItem key={venue.id} value={venue.id}>{venue.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Package">
            <Select value={form.watch("packageId") || "none"} onValueChange={(value) => form.setValue("packageId", value === "none" ? "" : value)}>
              <SelectTrigger className={publicControlClass}><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Not sure yet</SelectItem>
                {packages.map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Services">
            <div className="grid gap-2 sm:grid-cols-2">
              {services.map((service) => {
                const checked = serviceIds.includes(service.id);
                return (
                  <label key={service.id} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(value) => {
                        const next = value
                          ? [...serviceIds, service.id]
                          : serviceIds.filter((id) => id !== service.id);
                        form.setValue("serviceIds", next);
                      }}
                    />
                    {service.name}
                  </label>
                );
              })}
            </div>
          </Field>
          <Field label="Theme">
            <Input className={publicControlClass} {...form.register("theme")} />
          </Field>
          <Field label="Special requests">
            <Textarea className="min-h-28 rounded-none bg-white" {...form.register("specialRequests")} />
          </Field>
          <Button type="submit" disabled={pending} className={publicButtonClass}>
            {pending ? "Submitting..." : "Submit request"}
          </Button>
        </form>
      </Container>
    </div>
  );
}

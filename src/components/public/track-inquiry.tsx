"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Container,
  Field,
  publicButtonClass,
  publicControlClass,
} from "@/components/shared/chrome";
import { InquiryChat } from "@/components/shared/inquiry-chat";
import { TRACK_STEPS, trackStepIndex } from "@/lib/inquiry-track";
import { formatDate, formatLabel } from "@/lib/format";
import { isSupabaseEnabled } from "@/lib/supabase/env";
import { useDemoStore } from "@/lib/store/demo-store";
import { cn } from "@/lib/utils";

const schema = z.object({
  number: z.string().min(3, "Enter your reference number"),
  email: z.email("Enter the email used on the request"),
});

type FormValues = z.infer<typeof schema>;

type TrackResult = {
  id?: string;
  number: string;
  fullName: string;
  email?: string;
  eventType: string;
  eventDate: string;
  guestCount: number;
  status: string;
  statusLabel: string;
  createdAt: string;
};

export function TrackInquiryPage() {
  const searchParams = useSearchParams();
  const inquiries = useDemoStore((state) => state.inquiries);
  const [result, setResult] = useState<TrackResult | null>(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      number: searchParams.get("ref") ?? "",
      email: searchParams.get("email") ?? "",
    },
  });

  async function lookup(values: FormValues) {
    setPending(true);
    setError("");
    setResult(null);
    try {
      const number = values.number.trim().toUpperCase();
      const email = values.email.trim().toLowerCase();

      if (isSupabaseEnabled()) {
        const response = await fetch("/api/inquiries/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ number, email }),
        });
        const data = (await response.json()) as TrackResult & { error?: string };
        if (!response.ok) {
          throw new Error(data.error || "Could not find that request.");
        }
        setResult(data);
        return;
      }

      const local = inquiries.find(
        (item) =>
          item.number.toUpperCase() === number && item.email.trim().toLowerCase() === email,
      );
      if (!local) {
        throw new Error("No request found for that reference and email.");
      }
      setResult({
        id: local.id,
        number: local.number,
        fullName: local.fullName,
        email: local.email,
        eventType: local.eventType,
        eventDate: local.eventDate,
        guestCount: local.guestCount,
        status: local.status,
        statusLabel: formatLabel(local.status),
        createdAt: local.createdAt,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lookup failed.");
    } finally {
      setPending(false);
    }
  }

  const trackedEmail = (result?.email || form.getValues("email") || "").trim().toLowerCase();
  const canChat = Boolean(result && isSupabaseEnabled() && trackedEmail);

  useEffect(() => {
    const ref = searchParams.get("ref");
    const email = searchParams.get("email");
    if (ref && email) {
      void lookup({ number: ref, email });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once from URL
  }, []);

  const activeIndex = result ? trackStepIndex(result.status) : -1;
  const closed =
    result?.status === "DECLINED" || result?.status === "ARCHIVED";

  return (
    <div className="py-16">
      <Container className="max-w-6xl">
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,24rem)]">
          <div>
            <p className="text-[11px] tracking-[0.22em] text-stone-500 uppercase">Quotation</p>
            <h1 className="mt-2 font-display text-4xl md:text-5xl">Track your request</h1>
            <p className="mt-4 max-w-xl text-stone-600">
              Enter the reference number from your confirmation email and the same email address you used on the form.
            </p>

            <form
              className="mt-8 space-y-4 border border-stone-200 bg-white p-6"
              onSubmit={form.handleSubmit((values) => void lookup(values))}
            >
              <Field label="Reference number" error={form.formState.errors.number?.message}>
                <Input
                  className={publicControlClass}
                  placeholder="INQ-2026-00001"
                  {...form.register("number")}
                />
              </Field>
              <Field label="Email" error={form.formState.errors.email?.message}>
                <Input
                  type="email"
                  className={publicControlClass}
                  placeholder="name@company.com"
                  {...form.register("email")}
                />
              </Field>
              {error ? <p className="text-sm text-red-600">{error}</p> : null}
              <Button type="submit" disabled={pending} className={publicButtonClass}>
                {pending ? "Looking up…" : "Check progress"}
              </Button>
            </form>

            {canChat && result ? (
              <div className="mt-8">
                <InquiryChat
                  auth={{
                    mode: "customer",
                    number: result.number,
                    email: trackedEmail,
                  }}
                  title="Message RSVPNow"
                />
              </div>
            ) : null}
          </div>

          <aside className="border border-stone-200 bg-white p-6 lg:sticky lg:top-24">
            {result ? (
              <>
                <p className="text-[11px] tracking-[0.18em] text-stone-500 uppercase">
                  {result.number}
                </p>
                <h2 className="mt-2 font-display text-3xl">
                  {closed ? result.statusLabel : result.statusLabel || "In progress"}
                </h2>
                <p className="mt-2 text-sm text-stone-600">
                  {result.fullName} · {result.eventType || "Event"}
                  {result.eventDate ? ` · ${formatDate(result.eventDate)}` : ""}
                  {result.guestCount ? ` · ${result.guestCount} guests` : ""}
                </p>

                {!closed ? (
                  <ol className="mt-6 space-y-3">
                    {TRACK_STEPS.map((step, index) => {
                      const done = activeIndex >= index;
                      const current = activeIndex === index;
                      return (
                        <li key={step.status} className="flex gap-3">
                          <span
                            className={cn(
                              "mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border text-[11px]",
                              done
                                ? "border-ink bg-ink text-white"
                                : "border-stone-300 text-stone-400",
                            )}
                          >
                            {index + 1}
                          </span>
                          <div>
                            <p className={cn("font-medium", current ? "text-ink" : "text-stone-700")}>
                              {step.label}
                            </p>
                            <p className="text-sm text-stone-500">{step.description}</p>
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                ) : (
                  <p className="mt-6 text-sm text-stone-600">
                    This request is closed. Contact us if you need a new quotation.
                  </p>
                )}

                <p className="mt-6 text-sm text-stone-500">
                  Need help?{" "}
                  <Link href="/contact" className="text-ink underline underline-offset-4">
                    Contact RSVPNow
                  </Link>
                </p>
              </>
            ) : (
              <div className="py-8 text-center lg:py-16">
                <p className="text-[11px] tracking-[0.18em] text-stone-400 uppercase">Progress</p>
                <p className="mt-3 text-sm text-stone-500">
                  Your quotation status will appear here after you check a reference.
                </p>
              </div>
            )}
          </aside>
        </div>
      </Container>
    </div>
  );
}

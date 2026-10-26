"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Container, Field, publicButtonClass, publicControlClass } from "@/components/shared/chrome";
import { wait } from "@/lib/format";
import { useDemoStore } from "@/lib/store/demo-store";

const schema = z.object({
  name: z.string().min(2, "Enter your name"),
  email: z.email("Enter a valid email address"),
  phone: z.string().min(7, "Enter a phone number"),
  subject: z.string().min(3, "Add a subject"),
  message: z.string().min(12, "Tell us a little more"),
});

type FormValues = z.infer<typeof schema>;

export function ContactPage() {
  const settings = useDemoStore((state) => state.settings);
  const addMessage = useDemoStore((state) => state.addMessage);
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", phone: "", subject: "", message: "" },
  });

  async function onSubmit(values: FormValues) {
    setPending(true);
    await wait();
    addMessage(values);
    setPending(false);
    setSent(true);
    toast.success("Your message has been received.");
  }

  return (
    <div className="py-16">
      <Container className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-[11px] tracking-[0.22em] text-gold uppercase">Contact</p>
          <h1 className="mt-3 font-display text-5xl">Write to RSVPNow</h1>
          <div className="mt-8 space-y-3 text-sm text-stone-600">
            <p>{settings.address}</p>
            <a className="block hover:text-ink" href={`mailto:${settings.email}`}>{settings.email}</a>
            {settings.phone ? <a className="block hover:text-ink" href={`tel:${settings.phone}`}>{settings.phone}</a> : null}
            {settings.website ? <a className="block hover:text-ink" href={settings.website} target="_blank" rel="noreferrer">{settings.website.replace(/^https?:\/\//, "")}</a> : null}
            <p>{settings.businessHours}</p>
            <a
              className="inline-block underline"
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address)}`}
              target="_blank"
              rel="noreferrer"
            >
              Get directions
            </a>
          </div>
        </div>
        {sent ? (
          <div className="bg-white p-8">
            <h2 className="font-display text-4xl">Message received</h2>
            <p className="mt-3 text-sm text-stone-600">Your message has been received. A producer will reply during business hours.</p>
            <Button className={`mt-6 ${publicButtonClass}`} onClick={() => { setSent(false); form.reset(); }}>Send another</Button>
          </div>
        ) : (
          <form className="space-y-4 bg-white p-6 md:p-8" onSubmit={form.handleSubmit(onSubmit)}>
            <Field label="Full name" error={form.formState.errors.name?.message}>
              <Input className={publicControlClass} {...form.register("name")} />
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Email" error={form.formState.errors.email?.message}>
                <Input type="email" className={publicControlClass} {...form.register("email")} />
              </Field>
              <Field label="Phone" error={form.formState.errors.phone?.message}>
                <Input className={publicControlClass} {...form.register("phone")} />
              </Field>
            </div>
            <Field label="Subject" error={form.formState.errors.subject?.message}>
              <Input className={publicControlClass} {...form.register("subject")} />
            </Field>
            <Field label="Message" error={form.formState.errors.message?.message}>
              <Textarea className="min-h-32 rounded-none bg-white" {...form.register("message")} />
            </Field>
            <Button type="submit" disabled={pending} className={publicButtonClass}>
              {pending ? "Submitting..." : "Send message"}
            </Button>
          </form>
        )}
      </Container>
    </div>
  );
}

export function ProposalSuccess({ number }: { number: string }) {
  return (
    <Container className="py-24">
      <p className="text-[11px] tracking-[0.22em] text-gold uppercase">Inquiry {number}</p>
      <h1 className="mt-3 font-display text-5xl">Proposal request submitted successfully.</h1>
      <p className="mt-4 max-w-xl text-stone-600">
        Your reference number is <span className="font-medium text-ink">{number}</span>.
        We also send a confirmation to your email with a link to track progress.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild className={publicButtonClass}>
          <Link href={`/track?ref=${encodeURIComponent(number)}`}>Track this request</Link>
        </Button>
        <Button asChild variant="outline" className="rounded-none border-stone-300">
          <Link href="/">Return Home</Link>
        </Button>
      </div>
    </Container>
  );
}

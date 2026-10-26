"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/shared/chrome";
import { TurnstileWidget } from "@/components/public/turnstile-widget";
import { useSessionStore } from "@/lib/auth/session";
import { seedSettings } from "@/lib/mock-data/clients";
import { shouldShowTurnstile } from "@/lib/turnstile/env";

const GATE_KEY = "rsvpnow-admin-turnstile";
const GATE_TTL_MS = 1000 * 60 * 15;

function readGatePassed() {
  if (typeof window === "undefined") return false;
  try {
    const raw = sessionStorage.getItem(GATE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as { at?: number };
    if (!parsed.at || Date.now() - parsed.at > GATE_TTL_MS) {
      sessionStorage.removeItem(GATE_KEY);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

function writeGatePassed() {
  sessionStorage.setItem(GATE_KEY, JSON.stringify({ at: Date.now() }));
}

const schema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(1, "Enter the password"),
});

type FormValues = z.infer<typeof schema>;

const desk = [
  {
    title: "Inquiries",
    copy: "New requests, the first reply, and who is holding each one.",
  },
  {
    title: "Proposals",
    copy: "Drafts, quotes already sent, and the ones waiting on a yes.",
  },
  {
    title: "The book",
    copy: "Rooms, packages, and the dates that are actually held.",
  },
  {
    title: "Payments",
    copy: "Deposits and balances against confirmed bookings.",
  },
];

export function LoginForm() {
  const applySession = useSessionStore((state) => state.applySession);
  const router = useRouter();
  const searchParams = useSearchParams();
  const turnstileOn = shouldShowTurnstile();
  const [gateReady, setGateReady] = useState(!turnstileOn);
  const [gateChecking, setGateChecking] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileReset, setTurnstileReset] = useState(0);
  const [gateError, setGateError] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });
  const today = new Intl.DateTimeFormat("en-SG", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  useEffect(() => {
    if (!turnstileOn) {
      setGateReady(true);
      return;
    }
    setGateReady(readGatePassed());
  }, [turnstileOn]);

  async function continuePastGate() {
    if (!turnstileToken) {
      setGateError("Complete the security check to continue.");
      return;
    }
    setGateChecking(true);
    setGateError("");
    try {
      const response = await fetch("/api/turnstile/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: turnstileToken }),
      });
      const data = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Security check failed.");
      }
      writeGatePassed();
      setGateReady(true);
    } catch (err) {
      setGateError(err instanceof Error ? err.message : "Security check failed.");
      setTurnstileToken(null);
      setTurnstileReset((value) => value + 1);
    } finally {
      setGateChecking(false);
    }
  }

  async function onSubmit(values: FormValues) {
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
        }),
      });
      const data = (await response.json()) as {
        ok?: boolean;
        session?: { email: string; name: string; role: string };
        error?: string;
        attemptsLeft?: number;
      };

      if (!response.ok || !data.ok || !data.session) {
        const suffix =
          typeof data.attemptsLeft === "number" && data.attemptsLeft > 0
            ? ` (${data.attemptsLeft} attempt${data.attemptsLeft === 1 ? "" : "s"} left)`
            : "";
        setError((data.error || "Sign-in failed.") + suffix);
        return;
      }

      applySession(data.session);
      toast.success("Welcome back.");
      const next = searchParams.get("next");
      const safeNext =
        next && next.startsWith("/admin") && !next.startsWith("/admin/login") ? next : "/admin";
      router.replace(safeNext);
    } catch {
      setError("Could not reach the sign-in service. Try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="grid min-h-screen bg-[#f4f5f7] lg:grid-cols-[minmax(0,1.2fr)_minmax(22rem,0.8fr)]">
      <div className="relative lg:min-h-screen">
        <img
          src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1800&q=80"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#111111]/80 to-[#111111]/45" />
        <div className="relative flex min-h-[32rem] flex-col justify-between px-6 py-8 text-white sm:px-10 lg:h-full lg:px-12 lg:py-10">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="text-2xl font-bold tracking-tight">RSVPNow</p>
              <p className="mt-1 text-[11px] tracking-[0.16em] text-white/55 uppercase">Events by Nova North</p>
            </div>
            <p className="text-right text-sm text-white/70">
              <span className="block text-[11px] tracking-[0.16em] text-white/45 uppercase">Staff desk</span>
              {today}
            </p>
          </div>

          <div>
            <p className="text-[11px] font-medium tracking-[0.16em] text-[#e7b4b8] uppercase">Singapore · Paya Lebar</p>
            <h1 className="mt-3 max-w-xl text-3xl font-bold tracking-tight text-balance sm:text-4xl">
              The house, from the first inquiry to the last payment.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/75">
              Corporate dinners, weddings, debuts, and private rooms. This desk is where the team answers the request, sends the quote, holds the date, and records the money.
            </p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {desk.map((item, index) => (
                <li key={item.title} className="rounded-lg border border-white/10 bg-black/35 p-4">
                  <p className="text-[11px] font-medium tracking-[0.14em] text-[#e7b4b8] uppercase">
                    {String(index + 1).padStart(2, "0")} · {item.title}
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-white/75">{item.copy}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 border-t border-white/15 pt-4">
            <p className="text-[11px] font-medium tracking-[0.14em] text-white/45 uppercase">Studio</p>
            <p className="mt-3 text-xs leading-relaxed text-white/55">
              {seedSettings.address} · {seedSettings.businessHours} · {seedSettings.email}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-10 sm:px-10">
        {!gateReady ? (
          <div className="w-full max-w-md rounded-lg border border-black/5 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-[11px] font-medium tracking-[0.14em] text-neutral-400 uppercase">Staff access</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-neutral-950">Security check</h2>
            <p className="mt-2 text-sm leading-relaxed text-neutral-500">
              Complete the check below before the staff sign-in form is shown.
            </p>
            <div className="mt-6">
              <TurnstileWidget
                key={turnstileReset}
                onToken={setTurnstileToken}
                className="w-full"
              />
            </div>
            {gateError ? <p className="mt-3 text-sm text-red-600">{gateError}</p> : null}
            <Button
              type="button"
              disabled={gateChecking || !turnstileToken}
              onClick={() => void continuePastGate()}
              className="mt-6 h-11 w-full bg-neutral-950 text-white hover:bg-neutral-800"
            >
              {gateChecking ? "Verifying…" : "Continue to sign in"}
            </Button>
            <p className="mt-5 text-center text-sm text-neutral-500">
              <Link href="/" className="font-medium text-neutral-950 underline-offset-4 hover:underline">
                Back to the public site
              </Link>
            </p>
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} className="w-full max-w-md rounded-lg border border-black/5 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-[11px] font-medium tracking-[0.14em] text-neutral-400 uppercase">Staff access</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-neutral-950">Sign in</h2>
            <p className="mt-2 text-sm leading-relaxed text-neutral-500">
              Guests stay on the public site. After this you land on today&apos;s book: inquiries waiting on a reply, quotes still out, and the dates already confirmed.
            </p>
            <div className="mt-6 space-y-4">
              <Field label="Email" error={form.formState.errors.email?.message}>
                <Input type="email" className="h-11 rounded-md border-black/10 bg-white shadow-none" autoComplete="username" {...form.register("email")} />
              </Field>
              <Field label="Password" error={form.formState.errors.password?.message}>
                <Input type="password" className="h-11 rounded-md border-black/10 bg-white shadow-none" autoComplete="current-password" {...form.register("password")} />
              </Field>
            </div>
            {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
            <Button type="submit" disabled={pending} className="mt-6 h-11 w-full bg-neutral-950 text-white hover:bg-neutral-800">
              {pending ? "Signing in..." : "Sign in"}
            </Button>
            <p className="mt-5 text-center text-sm text-neutral-500">
              <Link href="/" className="font-medium text-neutral-950 underline-offset-4 hover:underline">Back to the public site</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

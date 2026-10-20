"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const ROUTES = [
  "/",
  "/services",
  "/contact",
  "/request-proposal",
  "/build-event",
  "/packages",
  "/venues",
  "/admin/login",
] as const;

/** Warm the Next.js router cache for main public routes. */
export function RoutePrefetch() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    const run = () => {
      if (cancelled) return;
      for (const href of ROUTES) {
        router.prefetch(href);
      }
    };

    let idleId: number | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(run);
    } else {
      timeoutId = setTimeout(run, 200);
    }

    return () => {
      cancelled = true;
      if (idleId !== undefined) window.cancelIdleCallback(idleId);
      if (timeoutId !== undefined) clearTimeout(timeoutId);
    };
  }, [router]);

  return null;
}

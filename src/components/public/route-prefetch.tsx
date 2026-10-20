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
    const idle =
      "requestIdleCallback" in window
        ? window.requestIdleCallback
        : (cb: IdleRequestCallback) => window.setTimeout(() => cb({ didTimeout: false, timeRemaining: () => 16 } as IdleDeadline), 200);

    const id = idle(() => {
      for (const href of ROUTES) {
        router.prefetch(href);
      }
    });

    return () => {
      if ("cancelIdleCallback" in window) {
        window.cancelIdleCallback(id as number);
      } else {
        window.clearTimeout(id as number);
      }
    };
  }, [router]);

  return null;
}

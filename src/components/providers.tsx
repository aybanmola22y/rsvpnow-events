"use client";

import { useEffect } from "react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useSessionStore } from "@/lib/auth/session";
import { useDemoStore } from "@/lib/store/demo-store";

export function Providers({ children }: { children: React.ReactNode }) {
  const hydrated = useDemoStore((state) => state.hydrated);

  useEffect(() => {
    useSessionStore.getState().hydrate();
    void Promise.resolve(useDemoStore.persist.rehydrate()).finally(() => {
      useDemoStore.setState({ hydrated: true });
    });
  }, []);

  return (
    <ThemeProvider attribute="class" forcedTheme="light" enableSystem={false}>
      <TooltipProvider>
        {hydrated ? (
          children
        ) : (
          <div className="flex min-h-screen items-center justify-center bg-ivory">
            <p className="font-display text-4xl text-ink">RSVPNow</p>
          </div>
        )}
        <Toaster position="top-right" richColors closeButton />
      </TooltipProvider>
    </ThemeProvider>
  );
}

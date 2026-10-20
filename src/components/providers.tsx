"use client";

import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useSessionStore } from "@/lib/auth/session";
import { useDemoStore } from "@/lib/store/demo-store";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    useSessionStore.getState().hydrate();
    void Promise.resolve(useDemoStore.persist.rehydrate()).finally(() => {
      useDemoStore.setState({ hydrated: true });
    });
  }, []);

  return (
    <TooltipProvider delayDuration={200}>
      {children}
      <Toaster position="top-right" richColors closeButton />
    </TooltipProvider>
  );
}

"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/types";
import { getSupabaseAnonKey, getSupabaseUrl, hasSupabaseCredentials } from "@/lib/supabase/env";

export function createSupabaseBrowserClient() {
  if (!hasSupabaseCredentials()) {
    throw new Error("Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }
  return createBrowserClient<Database>(getSupabaseUrl(), getSupabaseAnonKey());
}

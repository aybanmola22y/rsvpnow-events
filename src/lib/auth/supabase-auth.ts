/**
 * Supabase Auth bridge (staff login).
 * Demo session in session.ts stays active until you flip USE_SUPABASE and
 * create staff users in Supabase Auth + staff_profiles.
 */

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseEnabled } from "@/lib/supabase/env";

export async function signInStaff(email: string, password: string) {
  if (!isSupabaseEnabled()) {
    return { ok: false as const, error: "Supabase auth is not enabled." };
  }

  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) {
    return { ok: false as const, error: error?.message ?? "Sign-in failed." };
  }

  const { data: profile } = await supabase
    .from("staff_profiles")
    .select("name, email, role, status")
    .eq("id", data.user.id)
    .maybeSingle();

  if (!profile || profile.status !== "Active") {
    await supabase.auth.signOut();
    return { ok: false as const, error: "This account is not an active staff user." };
  }

  return {
    ok: true as const,
    session: {
      email: profile.email,
      name: profile.name,
      role: profile.role,
    },
  };
}

export async function signOutStaff() {
  if (!isSupabaseEnabled()) return;
  const supabase = createSupabaseBrowserClient();
  await supabase.auth.signOut();
}

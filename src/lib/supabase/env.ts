/**
 * Supabase env helpers. Safe to import from client or server.
 * The demo store stays active until URL + anon key are set and USE_SUPABASE is true.
 */

export function getSupabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
}

export function getSupabaseAnonKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
}

export function getSupabaseServiceRoleKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "";
}

/** True when project credentials exist (client can be created). */
export function hasSupabaseCredentials() {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey());
}

/**
 * Live backend switch. Requires credentials + NEXT_PUBLIC_USE_SUPABASE=true.
 * Keeps local demo behaviour until you explicitly flip the flag.
 */
export function isSupabaseEnabled() {
  return (
    hasSupabaseCredentials() &&
    process.env.NEXT_PUBLIC_USE_SUPABASE?.trim().toLowerCase() === "true"
  );
}

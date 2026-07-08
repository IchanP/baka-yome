import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let client: SupabaseClient | null = null;

/**
 * Service-role client — ADMIN / MAINTENANCE ONLY.
 *
 * This key BYPASSES Row-Level Security. Do NOT use it in the request path
 * (route handlers, server components): use createSupabaseServerClient() from
 * app/lib/supabase/server.ts instead, which acts as the logged-in user so RLS
 * enforces per-user isolation. Using this here re-introduces the RLS bypass and
 * would expose every user's data.
 */
export function getServiceClient(): SupabaseClient {
  if (!url || !serviceRoleKey) {
    throw new Error(
      "Supabase is not configured: set NEXT_PUBLIC_SUPABASE_URL and " +
        "SUPABASE_SERVICE_ROLE_KEY in .env.local (see .env.example).",
    );
  }
  if (!client) {
    client = createClient(url, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}

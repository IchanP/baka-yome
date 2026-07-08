import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Request-scoped Supabase client for Server Components and Route Handlers.
//
// This is what makes RLS "act as the logged-in user": it reads the session
// cookies and forwards the user's JWT on every PostgREST request, so Postgres
// sees `auth.uid()` = the caller and the per-user policies apply. It uses the
// ANON key (not the service-role key) precisely so RLS is NOT bypassed.
export async function createSupabaseServerClient() {
  const cookieStore = await cookies(); // async in Next 15/16

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component render, where the cookie store is
            // read-only. Safe to ignore: the middleware refreshes the session.
          }
        },
      },
    },
  );
}

import { createBrowserClient } from "@supabase/ssr";

// Browser Supabase client — for client components that need to talk to Auth
// directly (Discord sign-in, sign-out). Anon key only: never import the
// service-role key into anything that ships to the browser.
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../lib/supabase/server";

// OAuth callback: Discord (via Supabase) redirects here with a `?code=`, which
// we exchange for a session (sets the auth cookies), then land in the app.
// Lives under /auth so the middleware treats it as public.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}

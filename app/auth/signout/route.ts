import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../lib/supabase/server";

// Sign out on the server (clears the session cookies), then bounce to /login.
// 303 so the browser follows with a GET after the POST.
export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/login", request.url), { status: 303 });
}

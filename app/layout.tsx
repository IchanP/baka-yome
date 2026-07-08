import type { Metadata } from "next";
import { Inter_Tight, Shippori_Mincho_B1, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ModeProvider } from "./providers/ModeContext";
import { UserProvider, type SessionUser } from "./providers/UserContext";
import { Shell } from "./components/Shell";
import { ToastProvider } from "./providers/ToastContext";
import { createSupabaseServerClient } from "./lib/supabase/server";

const interTight = Inter_Tight({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const shipporiMincho = Shippori_Mincho_B1({
  variable: "--font-serif-ja",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Baka-Yome · Statistics",
  description: "Japanese immersion tracker",
};

export default async function RootLayout({
  children,
  toolbar,
}: Readonly<{
  children: React.ReactNode;
  toolbar: React.ReactNode;
}>) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Discord identity lives in user_metadata; fall back across the common keys.
  const meta = user?.user_metadata ?? {};
  const sessionUser: SessionUser | null = user
    ? {
        id: user.id,
        name: meta.full_name ?? meta.name ?? meta.user_name ?? null,
        avatarUrl: meta.avatar_url ?? meta.picture ?? null,
      }
    : null;

  return (
    <html
      lang="en"
      className={`${interTight.variable} ${shipporiMincho.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <ToastProvider>
          <UserProvider user={sessionUser}>
            <ModeProvider>
              <Shell toolbar={toolbar}>{children}</Shell>
            </ModeProvider>
          </UserProvider>
        </ToastProvider>
      </body>
    </html>
  );
}

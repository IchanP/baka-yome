import type { Metadata } from "next";
import { Inter_Tight, Shippori_Mincho_B1, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ModeProvider } from "./providers/ModeContext";
import { Shell } from "./components/Shell";
import { ToastProvider } from "./providers/ToastContext";

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

export default function RootLayout({
  children,
  toolbar,
}: Readonly<{
  children: React.ReactNode;
  toolbar: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${interTight.variable} ${shipporiMincho.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <ToastProvider>
          <ModeProvider>
            <Shell toolbar={toolbar}>{children}</Shell>
          </ModeProvider>
        </ToastProvider>
      </body>
    </html>
  );
}

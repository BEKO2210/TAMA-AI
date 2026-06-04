import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TAMA-AI 🥚",
  description: "Your AI-powered virtual pet — feed it, play with it, and chat with it.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-gradient-to-b from-sky-200 via-violet-100 to-pink-100 text-slate-800">
        {children}
      </body>
    </html>
  );
}

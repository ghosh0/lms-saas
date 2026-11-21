import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Learning Studio — Voice LMS",
  description: "Real-time AI voice learning environment powered by Vapi & Next.js.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full antialiased font-sans">
      <body className="min-h-full flex flex-col bg-[#050505] text-zinc-100 selection:bg-emerald-500/30 selection:text-emerald-400">
        {children}
      </body>
    </html>
  );
}

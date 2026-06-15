import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

import { Shell } from "@/components/layout/Shell";

export const metadata: Metadata = {
  title: "Project Pantheon | Agentic OS",
  description: "A private, local Agentic Operating System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased dark`}
    >
      <body className="h-full flex flex-col bg-pantheon-obsidian text-pantheon-marble overflow-hidden font-sans selection:bg-pantheon-emerald-800 selection:text-pantheon-marble">
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}

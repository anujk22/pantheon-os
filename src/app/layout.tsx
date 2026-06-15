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

import { ClientShellWrapper } from "@/components/layout/ClientShellWrapper";

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
      <body className="h-full flex flex-col bg-pantheon-bg text-pantheon-text-primary overflow-hidden font-sans selection:bg-pantheon-emerald-main selection:text-white">
        <ClientShellWrapper>{children}</ClientShellWrapper>
      </body>
    </html>
  );
}

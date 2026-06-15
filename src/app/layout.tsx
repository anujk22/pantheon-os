import type { Metadata } from "next";
import { Cinzel, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

import { ClientShellWrapper } from "@/components/layout/ClientShellWrapper";

export const metadata: Metadata = {
  title: "Pantheon OS",
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
      className={`${inter.variable} ${cinzel.variable} h-full antialiased`}
    >
      <body className="h-full flex flex-col bg-pantheon-bg text-pantheon-text-primary overflow-hidden font-sans selection:bg-pantheon-emerald-main selection:text-white">
        <ClientShellWrapper>{children}</ClientShellWrapper>
      </body>
    </html>
  );
}

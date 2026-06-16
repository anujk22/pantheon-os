"use client";

import React from "react";
import { TopBar } from "./TopBar";
import { BottomBar } from "./BottomBar";
import { LeftSidebar } from "./LeftSidebar";
import { RightSidebar } from "./RightSidebar";

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="pantheon-marble h-screen w-full overflow-hidden text-[var(--text-primary)] font-sans relative">
      <div className="absolute inset-0 z-0 pointer-events-none opacity-65 mix-blend-multiply" />
      <div className="absolute inset-x-0 top-0 h-5 z-0 border-b border-[var(--border-soft)] bg-[linear-gradient(180deg,rgba(192,138,72,0.18),transparent)]" />
      <div className="absolute inset-x-0 bottom-0 h-6 z-0 border-t border-[var(--border-soft)] bg-[linear-gradient(0deg,rgba(192,138,72,0.16),transparent)]" />

      <div className="relative z-10 flex h-full w-full gap-3 p-2 min-[1500px]:p-3">
        <LeftSidebar />

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <TopBar />

          <div className="flex min-h-0 flex-1 gap-3">
            <main className="min-w-0 flex-1 overflow-hidden">
              {children}
            </main>

            <RightSidebar />
          </div>

          <BottomBar />
        </div>
      </div>
    </div>
  );
}

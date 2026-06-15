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
      <div className="absolute inset-x-0 top-0 h-6 z-0 border-b border-[rgba(174,144,100,0.22)] bg-[linear-gradient(180deg,rgba(126,103,71,0.17),rgba(255,255,255,0))]" />
      <div className="absolute inset-x-0 bottom-0 h-7 z-0 border-t border-[rgba(174,144,100,0.22)] bg-[linear-gradient(0deg,rgba(126,103,71,0.14),rgba(255,255,255,0))]" />

      <div className="relative z-10 flex h-full w-full gap-4 p-4 min-[1500px]:p-5">
        <LeftSidebar />

        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <TopBar />

          <div className="flex min-h-0 flex-1 gap-4">
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

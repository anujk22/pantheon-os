"use client";

import React from "react";
import { LeftSidebar } from "./LeftSidebar";
import { RightSidebar } from "./RightSidebar";

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full bg-pantheon-obsidian overflow-hidden">
      <LeftSidebar />
      <main className="flex-1 flex flex-col relative overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-pantheon-onyx-light via-pantheon-obsidian to-pantheon-obsidian">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-pantheon-emerald-900/20 blur-[120px] pointer-events-none" />
        
        <div className="flex-1 overflow-y-auto z-10 relative">
          {children}
        </div>
      </main>
      <RightSidebar />
    </div>
  );
}

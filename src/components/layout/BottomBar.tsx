"use client";

import React from "react";

export function BottomBar() {
  return (
    <footer className="relative h-9 shrink-0 overflow-hidden border-t border-[rgba(174,144,100,0.24)] text-[var(--text-primary)]">
      <div className="absolute inset-0 bg-[var(--surface-soft)]" />
      <div className="relative z-10 flex h-full items-center justify-center gap-3 px-3 text-center font-serif text-[0.58rem] font-medium tracking-[0.18em] min-[720px]:gap-8 min-[720px]:text-[0.68rem] min-[720px]:tracking-[0.32em]">
        <span className="hidden text-[var(--accent-bronze)] min-[1180px]:inline">⌁</span>
        <span>LOCAL FIRST</span>
        <span className="text-[var(--accent-bronze)]">•</span>
        <span className="hidden min-[430px]:inline">PRIVATE BY DESIGN</span>
        <span className="inline min-[430px]:hidden">PRIVATE</span>
        <span className="text-[var(--accent-bronze)]">•</span>
        <span className="hidden min-[430px]:inline">YOU OWN YOUR DATA</span>
        <span className="inline min-[430px]:hidden">OWN DATA</span>
        <span className="hidden text-[var(--accent-bronze)] min-[1180px]:inline">⌁</span>
      </div>
    </footer>
  );
}

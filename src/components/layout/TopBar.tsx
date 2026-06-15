"use client";

import React from "react";
import Image from "next/image";
import { ChevronDown, Landmark, Search } from "lucide-react";

export function TopBar() {
  return (
    <header className="relative h-[126px] shrink-0 px-2 pt-3 min-[900px]:h-[112px]">
      <div className="absolute left-4 top-3 text-[var(--accent-bronze)] min-[900px]:left-[calc((100%_-_365px)/2)] min-[900px]:-translate-x-1/2">
        <Landmark className="h-6 w-6 stroke-[1.4]" />
      </div>

      <div className="absolute left-0 right-0 top-12 text-center min-[900px]:right-[365px] min-[900px]:top-10">
        <h2 className="font-serif text-[2rem] font-medium leading-none tracking-[0.028em] text-[var(--text-primary)] min-[900px]:text-[2.28rem] min-[1500px]:text-[2.58rem]">
          COMMAND LAYER
        </h2>
        <div className="mt-4 flex items-center justify-center gap-4">
          <div className="carved-rule hidden w-24 min-[640px]:block min-[1500px]:w-32" />
          <p className="max-w-[21rem] px-4 font-serif text-[0.8rem] tracking-[0.1em] text-[var(--text-primary)] min-[900px]:max-w-none min-[900px]:px-0 min-[900px]:text-[1rem] min-[1500px]:text-[1.08rem]">
            Direct your agents. Manifest results.
          </p>
          <div className="carved-rule hidden w-24 min-[640px]:block min-[1500px]:w-32" />
        </div>
      </div>

      <div className="absolute right-0 top-3 flex items-center gap-2 min-[900px]:top-5 min-[900px]:gap-3">
        <label className="relative hidden h-10 w-[230px] items-center rounded-[7px] border border-[rgba(174,144,100,0.28)] bg-[rgba(255,253,248,0.62)] px-3 shadow-[inset_0_1px_2px_rgba(72,56,38,0.05)] transition focus-within:border-[var(--accent-green)] min-[1220px]:flex min-[1500px]:w-[260px]">
          <Search className="mr-2 h-4 w-4 shrink-0 text-[var(--text-primary)]" />
          <input
            type="text"
            placeholder="Search Pantheon OS"
            className="min-w-0 flex-1 bg-transparent text-sm text-[var(--text-primary)] outline-none placeholder:text-[#6f665c]"
          />
          <span className="ml-2 rounded border border-[rgba(174,144,100,0.25)] bg-[rgba(255,255,255,0.5)] px-1.5 py-0.5 text-[11px] text-[var(--text-muted)]">
            ⌘K
          </span>
        </label>

        <div className="flex h-10 items-center gap-2 rounded-[7px] border border-[rgba(174,144,100,0.28)] bg-[rgba(255,253,248,0.62)] px-3 text-[11px] font-semibold tracking-[0.05em] text-[var(--text-primary)] min-[900px]:px-4 min-[900px]:text-xs">
          <span className="h-1.5 w-1.5 rounded-full bg-[#6f9a72]" />
          LOCAL MODE
        </div>

        <button className="hidden h-[52px] items-center gap-3 rounded-full px-1.5 pr-2 text-left transition hover:bg-[rgba(255,253,248,0.5)] min-[520px]:flex">
          <span className="relative h-12 w-12 overflow-hidden rounded-full border border-[rgba(174,144,100,0.42)] bg-[#eee7dc] shadow-[0_5px_14px_rgba(72,56,38,0.12)]">
            <Image
              src="/athena.png"
              alt="Athena advisor"
              fill
              sizes="48px"
              className="relief-avatar object-cover"
            />
          </span>
          <span className="hidden min-[1320px]:block">
            <span className="block text-xs font-bold tracking-[0.09em] text-[var(--text-primary)]">
              ATHENA
            </span>
            <span className="block text-xs text-[var(--text-muted)]">Advisor</span>
          </span>
          <ChevronDown className="hidden h-4 w-4 text-[var(--text-primary)] min-[1320px]:block" />
        </button>
      </div>
    </header>
  );
}

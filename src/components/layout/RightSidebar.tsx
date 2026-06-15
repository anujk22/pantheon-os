"use client";

import React from "react";
import Image from "next/image";
import { CalendarDays, ChevronRight, ShieldCheck, SunMedium } from "lucide-react";

const calendarItems = [
  ["9:00 AM", "Deep Work"],
  ["11:30 AM", "Budget Review Prep"],
  ["2:00 PM", "Stakeholder Sync"],
  ["4:30 PM", "Focus Block"],
];

export function RightSidebar() {
  return (
    <aside className="hidden h-full w-[316px] shrink-0 flex-col gap-2 overflow-y-auto pb-1 min-[1180px]:flex min-[1500px]:w-[348px]">
      <section className="stone-card architectural-corners relative shrink-0 overflow-hidden p-5">
        <div className="absolute right-[-18px] top-11 h-[124px] w-24 opacity-24 min-[1500px]:h-[138px] min-[1500px]:w-28">
          <Image
            src="/column.png"
            alt=""
            fill
            sizes="130px"
            className="object-cover object-left mix-blend-multiply"
          />
        </div>

        <div className="relative z-10">
          <div className="mb-3 flex items-center gap-3">
            <SunMedium className="h-5 w-5 text-[var(--accent-bronze)]" />
            <h3 className="font-serif text-[1.02rem] font-semibold tracking-[0.16em]">
              MORNING BRIEF
            </h3>
          </div>

          <h4 className="mb-2 text-sm font-semibold">Top Priorities</h4>
          <ol className="space-y-1.5 text-[13px] leading-snug text-[var(--text-primary)]">
            <li className="grid grid-cols-[18px_1fr] gap-2">
              <span>1.</span>
              <span>Deep Work: Orion Project</span>
            </li>
            <li className="grid grid-cols-[18px_1fr] gap-2">
              <span>2.</span>
              <span>Review Budget &amp; Forecasts</span>
            </li>
            <li className="grid grid-cols-[18px_1fr] gap-2">
              <span>3.</span>
              <span>Stakeholder Sync at 2 PM</span>
            </li>
          </ol>

          <div className="my-3 h-px bg-[rgba(174,144,100,0.2)]" />

          <div className="mb-3 grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 text-[13px]">
            <p className="font-semibold text-[#a63f32]">Hard Deadline</p>
            <p className="text-right text-[#a63f32]">Tomorrow 10:00 AM</p>
            <p>Budget Review</p>
          </div>

          <div className="border-t border-[rgba(174,144,100,0.18)] pt-2 text-[13px] leading-relaxed">
            <p className="font-semibold">Strategic Note</p>
            <p>Focus on high-leverage work. Protect your deep work blocks.</p>
          </div>
        </div>
      </section>

      <section className="stone-card architectural-corners p-4">
        <div className="mb-3 flex items-center gap-3">
          <CalendarDays className="h-5 w-5 text-[var(--accent-bronze)]" />
          <h3 className="font-serif text-[1.02rem] font-semibold tracking-[0.16em]">
            TODAY&apos;S CALENDAR
          </h3>
        </div>

        <div className="space-y-2">
          {calendarItems.map(([time, label]) => (
            <div key={time} className="grid grid-cols-[66px_14px_1fr] items-center gap-2 text-[13px]">
              <span>{time}</span>
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-sage)]" />
              <span>{label}</span>
            </div>
          ))}
        </div>

        <button className="mt-3 flex w-full items-center justify-between text-sm font-medium text-[var(--accent-green)] transition hover:text-[var(--text-primary)]">
          <span>View full calendar</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </section>

      <section className="stone-card architectural-corners p-4">
        <div className="mb-3 flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 text-[var(--accent-bronze)]" />
          <h3 className="font-serif text-[1.02rem] font-semibold tracking-[0.16em]">
            ACTIVE CASE
          </h3>
        </div>

        <div className="mb-3 flex items-start justify-between gap-4">
          <div>
            <h4 className="text-lg font-semibold">Orion Project</h4>
            <p className="mt-2 text-sm">
              <span className="font-semibold">Phase:</span> Discovery
            </p>
          </div>
          <span className="rounded-[5px] border border-[rgba(174,144,100,0.28)] bg-[rgba(255,253,248,0.72)] px-3 py-2 text-xs font-bold tracking-[0.08em] text-[var(--accent-green)]">
            ACTIVE
          </span>
        </div>

        <div className="mb-3 grid grid-cols-[1fr_auto] items-center gap-3">
          <div className="h-2 overflow-hidden rounded-full bg-[rgba(97,84,70,0.14)]">
            <div className="h-full w-1/3 bg-[var(--accent-green)]" />
          </div>
          <span className="text-sm text-[var(--text-muted)]">33%</span>
        </div>

        <p className="text-sm">
          <span className="font-semibold">Next:</span> Stakeholder Interviews
        </p>
      </section>
    </aside>
  );
}

"use client";

import React from "react";
import { CalendarDays, ShieldCheck, SunMedium } from "lucide-react";

export function RightSidebar() {
  return (
    <aside className="hidden h-full w-[316px] shrink-0 flex-col gap-2 overflow-y-auto pb-1 min-[1180px]:flex min-[1500px]:w-[348px]">
      <StatusCard
        icon={<SunMedium className="h-5 w-5 text-[var(--accent-bronze)]" />}
        title="MORNING BRIEF"
        heading="No brief generated"
      >
        Morning briefs are not generated automatically yet. When that workflow is
        connected, this panel will show the latest saved briefing from local storage.
      </StatusCard>

      <StatusCard
        icon={<CalendarDays className="h-5 w-5 text-[var(--accent-bronze)]" />}
        title="TODAY'S CALENDAR"
        heading="Calendar not connected"
      >
        No calendar provider is wired into this screen. Connectors should show real
        events here only after an integration is configured.
      </StatusCard>

      <StatusCard
        icon={<ShieldCheck className="h-5 w-5 text-[var(--accent-bronze)]" />}
        title="ACTIVE CASE"
        heading="No active case selected"
      >
        Cases exist only after you create or triage one from the Inbox. This rail will
        stay empty until a real case is active.
      </StatusCard>
    </aside>
  );
}

function StatusCard({
  icon,
  title,
  heading,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section className="stone-card architectural-corners p-5">
      <div className="mb-4 flex items-center gap-3">
        {icon}
        <h3 className="font-serif text-[1.02rem] font-semibold tracking-[0.16em]">
          {title}
        </h3>
      </div>
      <h4 className="text-base font-semibold text-[var(--text-primary)]">
        {heading}
      </h4>
      <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
        {children}
      </p>
    </section>
  );
}

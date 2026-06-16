"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  Archive,
  Bot,
  Boxes,
  Brain,
  Building2,
  BriefcaseBusiness,
  CalendarDays,
  Inbox,
  Landmark,
  Network,
  Settings,
} from "lucide-react";

const navItems = [
  { icon: Landmark, label: "Command Layer", href: "/", badge: null },
  { icon: Bot, label: "Agency Queue", href: "/agents", badge: null },
  { icon: CalendarDays, label: "Cadence", href: "/automations", badge: null },
  { icon: Inbox, label: "Inbox", href: "/inbox", badge: null },
  { icon: BriefcaseBusiness, label: "Cases", href: "/cases", badge: null },
  { icon: Archive, label: "Artifacts", href: "/artifacts", badge: null },
  { icon: Brain, label: "Memory", href: "/vault", badge: null },
  { icon: Network, label: "Integrations", href: "/integrations", badge: null },
  { icon: Settings, label: "Settings", href: "/settings", badge: null },
];

export function LeftSidebar() {
  const pathname = usePathname();

  return (
    <aside className="stone-panel architectural-corners hidden h-full w-[286px] shrink-0 overflow-hidden px-4 pb-4 pt-6 min-[980px]:flex min-[1500px]:w-[304px]">
      <div className="relative z-10 flex h-full w-full flex-col">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-3 flex items-center gap-3">
            <div className="relative flex h-[48px] w-[48px] items-center justify-center text-[var(--accent-bronze)]">
              <Building2 className="h-9 w-9 stroke-[1.35]" />
              <div className="absolute inset-x-1 bottom-0 h-px bg-[rgba(174,144,100,0.38)]" />
            </div>
            <h1 className="whitespace-nowrap font-serif text-[1.12rem] font-medium tracking-[0.14em] text-[var(--text-primary)] min-[1500px]:text-[1.22rem]">
              PANTHEON OS
            </h1>
          </div>
          <div className="carved-rule w-36" />
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`group flex h-[48px] items-center gap-3 rounded-[4px] border px-4 text-[14px] transition-all duration-200 ${
                  isActive
                    ? "border-[var(--border-soft)] bg-[var(--control-muted)] text-[var(--accent-green)] shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_8px_18px_rgba(66,52,34,0.06)]"
                    : "border-transparent text-[var(--text-primary)] hover:border-[var(--border-soft)] hover:bg-[var(--surface-hover)]"
                }`}
              >
                <item.icon
                  className={`h-5 w-5 shrink-0 stroke-[1.45] ${
                    isActive
                      ? "text-[var(--accent-green)]"
                      : "text-[var(--text-muted)] group-hover:text-[var(--accent-green)]"
                  }`}
                />
                <span className="min-w-0 flex-1 truncate font-medium">
                  {item.label}
                </span>
                {item.badge ? (
                  <span className="grid h-7 w-7 place-items-center rounded-full border border-[var(--border-soft)] bg-[var(--control-subtle)] text-sm text-[var(--accent-green)]">
                    {item.badge}
                  </span>
                ) : isActive ? (
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-green)]" />
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto flex flex-col items-center">
          <div className="relative mb-5 h-[158px] w-[158px]">
            <div className="absolute inset-0 rounded-full border border-[var(--border-soft)] bg-[var(--surface-hover)] shadow-[inset_0_2px_12px_rgba(104,83,57,0.12)]" />
            <div className="absolute inset-3 rounded-full border border-[var(--border-soft)] bg-[var(--control-muted)] shadow-[0_12px_24px_rgba(72,56,38,0.12)]" />
            <div className="absolute inset-6 overflow-hidden rounded-full border border-[var(--border-soft)] bg-[var(--control)]">
              <Image
                src="/athena.png"
                alt="Athena relief"
                fill
                sizes="160px"
                className="relief-avatar object-cover object-center opacity-90"
              />
            </div>
            <Boxes className="absolute -bottom-1 left-3 h-9 w-9 rotate-[-25deg] text-[rgba(174,144,100,0.28)]" />
            <Boxes className="absolute -bottom-1 right-3 h-9 w-9 rotate-[25deg] scale-x-[-1] text-[rgba(174,144,100,0.28)]" />
          </div>

          <div className="flex flex-col items-center text-center gap-1.5 w-full">
            <p className="font-serif text-[0.86rem] font-extrabold tracking-[0.23em] text-[var(--text-primary)] w-full text-center">
              LOCAL FIRST
            </p>
            <p className="font-serif text-[0.76rem] font-extrabold tracking-[0.22em] text-[var(--text-primary)] opacity-80 w-full text-center">
              PRIVATE BY DESIGN
            </p>
            <p className="font-serif text-[0.76rem] font-extrabold tracking-[0.22em] text-[var(--text-primary)] opacity-60 w-full text-center">
              YOU OWN YOUR DATA
            </p>
          </div>
          <div className="carved-rule mt-4 w-24" />
          <div className="mt-4 flex flex-col items-center gap-1 text-center">
            <p className="font-serif text-[0.72rem] font-extrabold tracking-[0.18em] text-[var(--text-primary)]">
              SYSTEM STATUS
            </p>
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[var(--success-text)]">
              Local app loaded
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

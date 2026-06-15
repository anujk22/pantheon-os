"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  Archive,
  Boxes,
  Brain,
  Building2,
  BriefcaseBusiness,
  Inbox,
  Landmark,
  Network,
  Settings,
} from "lucide-react";

const navItems = [
  { icon: Landmark, label: "Command Layer", href: "/", badge: null },
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
    <aside className="stone-panel architectural-corners hidden h-full w-[306px] shrink-0 overflow-hidden px-5 pb-5 pt-7 min-[980px]:flex min-[1500px]:w-[332px]">
      <div className="relative z-10 flex h-full w-full flex-col">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-3 flex items-center gap-4">
            <div className="relative flex h-[52px] w-[52px] items-center justify-center text-[var(--accent-bronze)]">
              <Building2 className="h-10 w-10 stroke-[1.35]" />
              <div className="absolute inset-x-1 bottom-0 h-px bg-[rgba(174,144,100,0.38)]" />
            </div>
            <h1 className="whitespace-nowrap font-serif text-[1.34rem] font-medium tracking-[0.085em] text-[var(--text-primary)] min-[1500px]:text-[1.48rem]">
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
                className={`group flex h-[52px] items-center gap-3 rounded-[8px] border px-4 text-[15px] transition-all duration-200 ${
                  isActive
                    ? "border-[rgba(174,144,100,0.34)] bg-[rgba(255,253,248,0.72)] text-[var(--accent-green)] shadow-[inset_0_1px_0_rgba(255,255,255,0.72),0_8px_18px_rgba(66,52,34,0.06)]"
                    : "border-transparent text-[var(--text-primary)] hover:border-[rgba(174,144,100,0.22)] hover:bg-[rgba(255,255,255,0.38)]"
                }`}
              >
                <item.icon
                  className={`h-5 w-5 shrink-0 stroke-[1.45] ${
                    isActive
                      ? "text-[var(--accent-green)]"
                      : "text-[rgba(34,31,27,0.64)] group-hover:text-[var(--accent-green)]"
                  }`}
                />
                <span className="min-w-0 flex-1 truncate font-medium">
                  {item.label}
                </span>
                {item.badge ? (
                  <span className="grid h-7 w-7 place-items-center rounded-full border border-[rgba(174,144,100,0.32)] bg-[rgba(255,255,255,0.52)] text-sm text-[var(--accent-green)]">
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
          <div className="relative mb-6 h-[178px] w-[178px]">
            <div className="absolute inset-0 rounded-full border border-[rgba(174,144,100,0.24)] bg-[rgba(255,255,255,0.28)] shadow-[inset_0_2px_12px_rgba(104,83,57,0.12)]" />
            <div className="absolute inset-3 rounded-full border border-[rgba(174,144,100,0.38)] bg-[rgba(246,239,228,0.88)] shadow-[0_12px_24px_rgba(72,56,38,0.12)]" />
            <div className="absolute inset-6 overflow-hidden rounded-full border border-[rgba(174,144,100,0.42)] bg-[#efe7da]">
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
        </div>
      </div>
    </aside>
  );
}

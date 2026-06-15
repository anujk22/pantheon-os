"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FolderKanban, Vault, Settings, Activity } from "lucide-react";
import { motion } from "framer-motion";

const navItems = [
  { name: "Mission Control", href: "/", icon: LayoutDashboard },
  { name: "Cases", href: "/cases", icon: FolderKanban },
  { name: "Vault", href: "/vault", icon: Vault },
];

export function LeftSidebar() {
  const pathname = usePathname();

  return (
    <motion.aside
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-64 border-r border-pantheon-emerald-900 bg-pantheon-onyx/80 backdrop-blur-xl flex flex-col justify-between h-full p-4"
    >
      <div>
        <div className="flex items-center space-x-3 mb-10 px-2">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-pantheon-emerald-500 to-pantheon-emerald-700 flex items-center justify-center border border-pantheon-emerald-400">
            <span className="font-serif font-bold text-pantheon-obsidian text-sm">P</span>
          </div>
          <h1 className="font-serif text-xl font-semibold tracking-wide text-pantheon-marble">Pantheon</h1>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-300 ${
                  isActive
                    ? "bg-pantheon-emerald-900/50 text-pantheon-emerald-400 shadow-[inset_0_0_10px_rgba(5,150,105,0.1)]"
                    : "text-pantheon-marble-muted hover:bg-pantheon-onyx-light hover:text-pantheon-marble"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="space-y-4">
        {/* Agent Status */}
        <div className="p-3 rounded-lg bg-pantheon-onyx-light border border-pantheon-emerald-900/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-pantheon-marble-muted uppercase tracking-wider">Agent Status</span>
            <Activity className="w-4 h-4 text-pantheon-emerald-500 animate-pulse" />
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-pantheon-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
            <span className="text-sm font-medium text-pantheon-emerald-400">Idle / Monitoring</span>
          </div>
        </div>

        <Link
          href="/settings"
          className="flex items-center space-x-3 px-3 py-2 rounded-lg text-pantheon-marble-muted hover:bg-pantheon-onyx-light hover:text-pantheon-marble transition-colors"
        >
          <Settings className="w-5 h-5" />
          <span className="font-medium text-sm">Settings</span>
        </Link>
      </div>
    </motion.aside>
  );
}

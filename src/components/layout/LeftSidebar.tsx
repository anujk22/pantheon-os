"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { 
  Building2, 
  Inbox,
  MessageSquare, 
  Archive, 
  Brain, 
  Users, 
  Link as LinkIcon,
  Zap,
  BarChart,
  Settings
} from "lucide-react";

export function LeftSidebar() {
  const pathname = usePathname();

  const navItems = [
    { icon: Building2, label: "Mission Control", href: "/" },
    { icon: Inbox, label: "Command Inbox", href: "/inbox" },
    { icon: MessageSquare, label: "Chat", href: "/chat" },
    { icon: Archive, label: "Artifacts", href: "/artifacts" },
    { icon: Brain, label: "Memory", href: "/vault" },
    { icon: Users, label: "Agents", href: "/agents" },
    { icon: LinkIcon, label: "Integrations", href: "/integrations" },
    { icon: Zap, label: "Automations", href: "/automations" },
    { icon: BarChart, label: "Analytics", href: "/analytics" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];

  return (
    <aside className="w-64 h-full flex flex-row shrink-0">
      
      {/* Far Left Column Graphic */}
      <div className="w-16 h-full border-r border-[#D4AF37]/20 relative overflow-hidden flex flex-col items-center py-4 bg-gradient-to-b from-white/60 to-white/20 rounded-l-2xl shadow-inner">
        <Image 
          src="/column.png" 
          alt="Ionic Column" 
          fill
          className="object-cover object-left opacity-90 mix-blend-multiply"
        />
      </div>

      {/* Nav Menu */}
      <div className="flex-1 flex flex-col p-4 bg-white/60 backdrop-blur-md rounded-r-2xl border border-white shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
        <nav className="flex-1 space-y-1.5 mt-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            
            return (
              <Link key={item.label} href={item.href}>
                <div className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all group cursor-pointer ${
                  isActive 
                    ? "bg-[#1B3B2B] text-white shadow-md border border-[#1B3B2B]" 
                    : "text-[#4A5D53] hover:bg-white/80 hover:shadow-sm border border-transparent"
                }`}>
                  <item.icon className={`w-4 h-4 ${isActive ? "text-[#C5A059]" : "text-[#4A5D53] group-hover:text-[#1B3B2B]"} transition-colors`} />
                  <span className="font-semibold text-[13px] tracking-wide">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-6">
          <div className="flex items-center p-3 bg-white/80 rounded-xl border border-white shadow-sm cursor-pointer hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-full border border-[#D4AF37] overflow-hidden bg-[#F4F4F0] flex justify-center items-center mr-3 relative">
               <Image src="/zeus.png" alt="Demigod" fill className="object-cover" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-[#1a1f1c]">Demigod</p>
              <p className="text-[10px] text-gray-500 font-serif italic">Architect Tier</p>
            </div>
          </div>
        </div>
      </div>

    </aside>
  );
}

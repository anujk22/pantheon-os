"use client";

import React from "react";
import { Leaf, BarChart2, Settings, Image as ImageIcon, Music, Code, Shield } from "lucide-react";

export function BottomBar() {
  return (
    <footer className="h-12 w-full shrink-0 flex items-center justify-between px-6 bg-gradient-to-r from-[#142A1E] via-[#1B3B2B] to-[#142A1E] rounded-2xl shadow-lg border-t border-[#D4AF37]/30 relative overflow-hidden text-white">
      
      {/* Subtle marble texture overlay */}
      <div className="absolute inset-0 bg-[url('/marble.png')] opacity-10 mix-blend-overlay pointer-events-none"></div>

      {/* Left icons */}
      <div className="flex items-center space-x-6 relative z-10 text-[#C5A059]/70">
        <button className="hover:text-[#C5A059] transition-colors"><Leaf className="w-4 h-4" /></button>
        <button className="hover:text-[#C5A059] transition-colors"><Shield className="w-4 h-4" /></button>
        <button className="hover:text-[#C5A059] transition-colors"><BarChart2 className="w-4 h-4" /></button>
        <button className="hover:text-[#C5A059] transition-colors"><Settings className="w-4 h-4" /></button>
      </div>

      {/* Center Logo */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center relative z-10 h-16 w-32 -top-2">
        <div className="w-16 h-16 rounded-full bg-gradient-to-b from-[#1B3B2B] to-[#0A1A12] border-4 border-[#F4F4F0] shadow-xl flex items-center justify-center relative overflow-hidden">
           <div className="absolute inset-0 border-2 border-[#D4AF37] rounded-full m-1"></div>
           <span className="font-serif font-bold text-white text-xl z-10">P</span>
        </div>
      </div>

      {/* Right icons & Status */}
      <div className="flex items-center space-x-6 relative z-10">
        <div className="flex items-center space-x-6 text-[#C5A059]/70 mr-8">
          <button className="hover:text-[#C5A059] transition-colors"><ImageIcon className="w-4 h-4" /></button>
          <button className="hover:text-[#C5A059] transition-colors"><Music className="w-4 h-4" /></button>
          <button className="hover:text-[#C5A059] transition-colors"><Code className="w-4 h-4" /></button>
        </div>

        <div className="flex items-center space-x-4 text-[10px] tracking-widest font-bold uppercase">
          <div className="flex items-center">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-2 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse"></div>
            <span className="text-gray-300">All Systems Nominal</span>
          </div>
          <span className="text-[#C5A059]">Uptime 99.97%</span>
        </div>
      </div>

    </footer>
  );
}

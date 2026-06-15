"use client";

import React from "react";
import { Search, Sun, Moon } from "lucide-react";
import Image from "next/image";

export function TopBar() {
  return (
    <header className="h-20 w-full flex items-center justify-between px-4 shrink-0 bg-white/40 backdrop-blur-md rounded-2xl border border-white shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
      
      {/* Logo Area */}
      <div className="flex items-center">
        <div className="w-10 h-10 mr-4 flex items-center justify-center">
          {/* Ornate P logo */}
          <div className="w-8 h-8 bg-[#1B3B2B] rounded-sm flex items-center justify-center border border-[#D4AF37]/50 shadow-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/marble.png')] opacity-20 mix-blend-overlay"></div>
            <span className="font-serif font-bold text-white text-lg relative z-10">P</span>
          </div>
        </div>
        <div className="flex flex-col">
          <h1 className="font-serif text-xl font-bold text-[#1a1f1c] tracking-widest uppercase leading-tight">Emerald Pantheon</h1>
          <span className="text-[9px] font-bold text-[#C5A059] tracking-[0.2em] uppercase">Agentic OS</span>
        </div>
      </div>

      {/* Center Title */}
      <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
         <div className="flex items-center">
            <span className="text-[#C5A059] text-2xl mr-2">🌿</span>
            <h2 className="font-serif text-3xl font-bold tracking-widest text-[#1a1f1c] uppercase">Mission Control</h2>
            <span className="text-[#C5A059] text-2xl ml-2">🌿</span>
         </div>
         <p className="text-xs font-serif italic text-[#4A5D53] mt-1">Direct your agents. Manifest results.</p>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-6">
        <div className="relative">
          <Search className="absolute left-3 top-2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search Pantheon OS" 
            className="w-64 bg-white/60 border border-white shadow-inner rounded-full py-1.5 pl-9 pr-4 text-xs outline-none focus:ring-1 focus:ring-[#1B3B2B] text-[#1a1f1c]"
          />
        </div>
        
        <div className="flex bg-white/60 rounded-full border border-white p-1 shadow-inner">
          <button className="p-1.5 bg-white shadow-sm rounded-full text-[#1B3B2B]"><Sun className="w-4 h-4" /></button>
          <button className="p-1.5 text-gray-400 hover:text-[#1B3B2B] rounded-full"><Moon className="w-4 h-4" /></button>
        </div>

        <div className="flex items-center space-x-3 bg-white/40 border border-white p-1.5 pr-4 rounded-full shadow-sm">
          <div className="text-right">
            <div className="text-xs font-bold text-[#1a1f1c] tracking-widest uppercase">Athena</div>
            <div className="text-[9px] text-gray-500 font-serif italic">Strategic Advisor</div>
          </div>
          <div className="w-8 h-8 rounded-full overflow-hidden border border-[#D4AF37] relative bg-white">
            <Image src="/athena.png" alt="Athena" fill className="object-cover" />
          </div>
        </div>
      </div>
    </header>
  );
}

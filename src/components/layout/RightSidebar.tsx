"use client";

import React from "react";
import Image from "next/image";
import { ChevronRight, ChevronLeft, Calendar as CalendarIcon } from "lucide-react";

export function RightSidebar() {
  const today = new Date().toLocaleDateString("en-US", { weekday: 'long', month: 'short', day: 'numeric' });

  return (
    <aside className="w-80 h-full flex flex-col shrink-0 space-y-4 overflow-y-auto pr-2 pb-4">
      
      <div className="mb-2 pl-2">
         <h3 className="font-bold text-[13px] tracking-widest text-[#1a1f1c] uppercase">Daily Context</h3>
      </div>

      {/* Morning Briefing Card */}
      <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-white shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] p-5 relative overflow-hidden group cursor-pointer hover:shadow-md transition-shadow">
        <div className="absolute right-0 top-0 w-32 h-full opacity-60 mix-blend-multiply transition-transform group-hover:scale-105 duration-700">
           <Image src="/apollo.png" alt="Statue" fill className="object-cover object-top" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-transparent"></div>
        
        <div className="relative z-10">
          <div className="flex items-center text-[#C5A059] mb-3">
             <span className="text-xl mr-2">☀</span>
             <h4 className="font-serif font-bold text-[#1a1f1c] text-lg">Morning Briefing</h4>
          </div>
          <p className="text-sm text-[#4A5D53] leading-relaxed mb-1">Good morning, Commander.</p>
          <p className="text-[12px] text-gray-500 max-w-[180px]">No briefing has been generated for {today} yet. Use the chat to trigger a briefing.</p>
        </div>
      </div>

      {/* Google Calendar Card */}
      <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-white shadow-sm p-4">
        <div className="flex justify-between items-center mb-4">
           <div className="flex items-center">
             <div className="w-6 h-6 bg-white rounded shadow-sm flex items-center justify-center mr-2 border border-gray-100">
                <CalendarIcon className="w-3 h-3 text-blue-500" />
             </div>
             <h4 className="font-semibold text-sm text-[#1a1f1c]">Calendar</h4>
           </div>
           <div className="flex items-center space-x-2">
             <span className="bg-gray-100 text-gray-600 text-[10px] px-2 py-1 rounded-md font-medium">Today</span>
             <ChevronLeft className="w-4 h-4 text-gray-300 cursor-not-allowed" />
             <ChevronRight className="w-4 h-4 text-gray-300 cursor-not-allowed" />
           </div>
        </div>

        <div className="py-8 flex flex-col items-center justify-center text-center opacity-70">
           <CalendarIcon className="w-8 h-8 text-gray-300 mb-2" />
           <p className="text-xs font-medium text-gray-500">No events scheduled</p>
           <p className="text-[10px] text-gray-400 mt-1">Hook up Google Calendar in Integrations</p>
        </div>
      </div>

      {/* Active Case Board */}
      <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-white shadow-sm p-4 flex-1 flex flex-col">
        <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
           <div className="flex items-center">
             <div className="text-[#D4AF37] mr-2">♞</div>
             <h4 className="font-semibold text-sm text-[#1a1f1c]">Active Case Board</h4>
           </div>
           <button className="text-[10px] font-bold text-gray-500 hover:text-[#1B3B2B] uppercase tracking-wider flex items-center">
             View in Tasks <ChevronRight className="w-3 h-3 ml-1" />
           </button>
        </div>

        <div className="grid grid-cols-3 gap-3 flex-1">
           {/* To Do */}
           <div className="flex flex-col">
             <div className="flex justify-between items-center mb-2">
               <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">To Do</span>
               <span className="text-[10px] font-medium text-gray-400">0</span>
             </div>
             <div className="flex-1 flex flex-col border border-dashed border-gray-200 rounded-lg bg-gray-50/50 p-2 items-center justify-center min-h-[100px]">
                <button className="text-[10px] text-gray-400 hover:text-[#1B3B2B] font-medium">+ Add Task</button>
             </div>
           </div>

           {/* In Progress */}
           <div className="flex flex-col">
             <div className="flex justify-between items-center mb-2">
               <span className="text-[10px] font-bold text-[#C5A059] uppercase tracking-widest">In Progress</span>
               <span className="text-[10px] font-medium text-[#C5A059]">0</span>
             </div>
             <div className="flex-1 border border-dashed border-gray-200 rounded-lg bg-gray-50/50 p-2 min-h-[100px]">
             </div>
           </div>

           {/* Done */}
           <div className="flex flex-col">
             <div className="flex justify-between items-center mb-2">
               <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Done</span>
               <span className="text-[10px] font-medium text-emerald-600">0</span>
             </div>
             <div className="flex-1 border border-dashed border-gray-200 rounded-lg bg-gray-50/50 p-2 min-h-[100px]">
             </div>
           </div>
        </div>
      </div>

    </aside>
  );
}

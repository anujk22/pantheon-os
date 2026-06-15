"use client";

import React from "react";
import { Clock, Key, Shield, Users, ChevronDown, CheckCircle2 } from "lucide-react";

const ORB_NODES = [
  { top: "18%", left: "42%", opacity: 0.92 },
  { top: "28%", left: "68%", opacity: 0.76 },
  { top: "36%", left: "24%", opacity: 0.82 },
  { top: "44%", left: "51%", opacity: 0.95 },
  { top: "54%", left: "77%", opacity: 0.68 },
  { top: "62%", left: "34%", opacity: 0.88 },
  { top: "72%", left: "58%", opacity: 0.73 },
  { top: "22%", left: "82%", opacity: 0.59 },
  { top: "78%", left: "21%", opacity: 0.64 },
  { top: "49%", left: "15%", opacity: 0.71 },
  { top: "31%", left: "48%", opacity: 0.8 },
  { top: "67%", left: "84%", opacity: 0.57 },
];

export function AgentStatus() {
  return (
    <div className="w-72 h-full flex flex-col shrink-0 space-y-4">
      
      {/* Orb Card */}
      <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-white shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] p-5 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-[13px] tracking-widest text-[#1a1f1c] uppercase">Agent Status</h3>
          <div className="flex items-center text-[10px] font-bold text-emerald-600 tracking-widest uppercase">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse"></div> Live
          </div>
        </div>

        {/* Glowing Orb */}
        <div className="w-full flex justify-center mb-8 relative">
          {/* Base pedestal */}
          <div className="absolute -bottom-4 w-40 h-8 bg-[#D4AF37]/20 rounded-[100%] blur-md"></div>
          <div className="absolute -bottom-2 w-32 h-2 bg-[#D4AF37]/50 rounded-[100%]"></div>
          
          <div className="w-48 h-48 relative rounded-full shadow-[0_0_40px_rgba(16,185,129,0.3)] bg-gradient-to-tr from-[#064E3B] via-[#10B981] to-[#34D399] flex items-center justify-center overflow-hidden border border-white/20">
             {/* Simulating 3D wireframe / nodes */}
             <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_center,_transparent_20%,_rgba(0,0,0,0.4)_100%)]"></div>
             <div className="w-full h-full bg-[url('/marble.png')] mix-blend-overlay opacity-30"></div>
             <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent mix-blend-multiply"></div>
             
             {/* Wireframe nodes */}
             {ORB_NODES.map((node, i) => (
                <div key={i} className="absolute w-2 h-2 bg-white rounded-full shadow-[0_0_10px_white]" style={node}></div>
             ))}
             {/* Mock connecting lines */}
             <svg className="absolute inset-0 w-full h-full opacity-30 stroke-white stroke-1" viewBox="0 0 100 100">
                <line x1="20" y1="30" x2="50" y2="50" />
                <line x1="50" y1="50" x2="80" y2="40" />
                <line x1="50" y1="50" x2="40" y2="80" />
             </svg>
          </div>
        </div>

        <div className="text-center border-b border-gray-200 pb-4 mb-4">
          <p className="font-serif font-bold text-[#1a1f1c] text-sm">Memory Graph</p>
          <p className="text-[10px] text-gray-500 font-serif italic">1,283 Nodes Active</p>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center text-sm">
             <div className="flex items-center text-[#4A5D53]"><Clock className="w-4 h-4 mr-3 text-[#C5A059]" /> Context Window</div>
             <div className="text-right">
               <span className="font-bold text-[#1a1f1c]">70%</span>
               <div className="text-[9px] text-gray-400">123k / 160k</div>
             </div>
          </div>
          <div className="flex justify-between items-center text-sm">
             <div className="flex items-center text-[#4A5D53]"><Shield className="w-4 h-4 mr-3 text-[#C5A059]" /> Token Usage</div>
             <div className="text-right">
               <span className="font-bold text-[#1a1f1c]">62%</span>
               <div className="text-[9px] text-gray-400">62k / 100k</div>
             </div>
          </div>
          <div className="flex justify-between items-center text-sm">
             <div className="flex items-center text-[#4A5D53]"><Key className="w-4 h-4 mr-3 text-[#C5A059]" /> Tool Access</div>
             <div className="text-right">
               <span className="font-bold text-[#1a1f1c]">9 / 12</span>
             </div>
          </div>
          <div className="flex justify-between items-center text-sm pt-2 border-t border-gray-100">
             <div className="flex items-center text-[#4A5D53]"><Users className="w-4 h-4 mr-3 text-[#C5A059]" /> Agents Online</div>
             <div className="text-right">
               <span className="font-bold text-[#1a1f1c]">5 Active</span>
             </div>
          </div>
        </div>
      </div>

      {/* Mode Selector */}
      <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-white shadow-sm p-4 flex items-center justify-between cursor-pointer hover:bg-white/80 transition-colors">
        <div className="flex items-center">
           <div className="w-10 h-10 rounded-full bg-[#1B3B2B] flex items-center justify-center mr-3 border border-[#D4AF37]/50 relative overflow-hidden">
             <div className="absolute inset-0 bg-[url('/marble.png')] mix-blend-overlay opacity-30"></div>
             <CheckCircle2 className="w-5 h-5 text-emerald-400 relative z-10" />
           </div>
           <div>
             <p className="font-serif font-bold text-[13px] text-[#1a1f1c]">Agent Mode</p>
             <p className="text-[11px] text-gray-500 font-medium">Autonomous</p>
           </div>
        </div>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </div>

    </div>
  );
}

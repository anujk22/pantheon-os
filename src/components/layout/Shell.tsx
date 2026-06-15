"use client";

import React from "react";
import { TopBar } from "./TopBar";
import { BottomBar } from "./BottomBar";
import { LeftSidebar } from "./LeftSidebar";
import { RightSidebar } from "./RightSidebar";

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen w-full bg-[#FAF9F6] text-[#1a1f1c] overflow-hidden font-sans relative">
      {/* Subtle marble background texture */}
      <div 
        className="absolute inset-0 z-0 opacity-40 pointer-events-none mix-blend-multiply"
        style={{ backgroundImage: "url('/marble.png')", backgroundSize: "cover", backgroundPosition: "center" }}
      />
      
      <div className="relative z-10 flex flex-col h-full w-full p-2 gap-2">
        {/* TOP BAR */}
        <TopBar />
        
        {/* MAIN CONTENT AREA */}
        <div className="flex flex-1 overflow-hidden gap-4 px-2 pb-2">
          
          {/* FAR LEFT: Nav Menu */}
          <LeftSidebar />
          
          {/* CENTER STAGE: Dashboard/Chat/Status */}
          <main className="flex-1 flex overflow-hidden">
            {children}
          </main>

          {/* FAR RIGHT: Daily Context */}
          <RightSidebar />
        </div>

        {/* BOTTOM BAR */}
        <BottomBar />
      </div>
    </div>
  );
}

"use client";

import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { Loader2, Plus, Globe, Wrench, Send } from "lucide-react";
import { AgentStatus } from "@/components/layout/AgentStatus";
import { useChat } from "@ai-sdk/react";

export default function DashboardPage() {
  const { messages, sendMessage, status } = useChat({ id: "mission-control" });
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isLoading = status === "submitted" || status === "streaming";

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;

    setInput("");
    await sendMessage({ text });
  };

  return (
    <div className="h-full w-full flex space-x-4">
      {/* Agent Status Zone */}
      <AgentStatus />

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col bg-white/40 backdrop-blur-md rounded-2xl border border-white shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] overflow-hidden relative">
        
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#10B981]/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 relative z-10 custom-scrollbar">
          
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-[#4A5D53] space-y-4 opacity-70">
              <div className="w-16 h-16 rounded-full border border-emerald-500 overflow-hidden shrink-0 shadow-sm relative bg-[#1B3B2B] flex items-center justify-center mb-4">
                 <Image src="/athena.png" alt="Athena" fill className="object-cover" />
              </div>
              <h2 className="text-xl font-serif">Awaiting your command, Commander.</h2>
              <p className="text-sm">Type a message to begin the integration.</p>
            </div>
          )}

          {messages.map((m, index) => (
            <div key={m.id || index} className={`flex items-start space-x-4 ${m.role === 'user' ? 'justify-end flex-row-reverse space-x-reverse' : 'w-full'}`}>
              
              {m.role === 'user' ? (
                // User Avatar
                <div className="w-10 h-10 rounded-full border border-[#D4AF37] overflow-hidden shrink-0 shadow-sm relative">
                   <Image src="/zeus.png" alt="User" fill className="object-cover" />
                </div>
              ) : (
                // Athena Avatar
                <div className="w-10 h-10 rounded-full border border-emerald-500 overflow-hidden shrink-0 shadow-sm relative bg-[#1B3B2B] flex items-center justify-center">
                   <Image src="/athena.png" alt="Athena" fill className="object-cover" />
                </div>
              )}
              
              <div className="flex-1 space-y-2">
                 {m.role !== 'user' && (
                   <div className="flex items-center space-x-3 mb-2">
                     <h4 className="font-bold text-[#1a1f1c] uppercase tracking-widest text-sm">Athena</h4>
                   </div>
                 )}
                 <div className={`p-4 shadow-sm whitespace-pre-wrap text-sm text-[#1a1f1c] ${m.role === 'user' ? 'bg-white border border-gray-100 rounded-2xl rounded-tr-sm inline-block max-w-[80%]' : 'bg-white/80 border border-emerald-100 rounded-2xl'}`}>
                    {m.parts.map((part, partIndex) =>
                      part.type === "text" ? (
                        <React.Fragment key={partIndex}>{part.text}</React.Fragment>
                      ) : null
                    )}
                 </div>
              </div>
            </div>
          ))}
          
          {isLoading && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
            <div className="flex items-start space-x-4 w-full">
              <div className="w-10 h-10 rounded-full border border-emerald-500 overflow-hidden shrink-0 shadow-sm relative bg-[#1B3B2B] flex items-center justify-center">
                 <Image src="/athena.png" alt="Athena" fill className="object-cover" />
              </div>
              <div className="flex-1 space-y-4">
                 <div className="flex items-center space-x-3">
                   <h4 className="font-bold text-[#1a1f1c] uppercase tracking-widest text-sm">Athena</h4>
                   <div className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded font-bold border border-emerald-200 flex items-center">
                     Working <Loader2 className="w-3 h-3 ml-1 animate-spin" />
                   </div>
                 </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white/80 border-t border-white backdrop-blur-md relative z-20">
          <form onSubmit={handleSubmit} className="relative flex items-center bg-white border border-gray-200 rounded-full px-2 py-2 shadow-sm focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all">
             <button type="button" className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-[#1B3B2B] hover:bg-gray-50 transition-colors mx-1">
               <Plus className="w-5 h-5" />
             </button>
             <button type="button" className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-[#1B3B2B] hover:bg-gray-50 transition-colors mx-1">
               <Globe className="w-4 h-4" />
             </button>
             <button type="button" className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-[#1B3B2B] hover:bg-gray-50 transition-colors mx-1">
               <Wrench className="w-4 h-4" />
             </button>
             <input
               type="text"
               value={input}
               onChange={(event) => setInput(event.target.value)}
               placeholder="Message Athena..."
               className="flex-1 bg-transparent outline-none text-[#1a1f1c] placeholder-gray-400 px-3 text-sm"
               disabled={isLoading}
             />
             <button type="submit" disabled={isLoading || !(input || "").trim()} className="w-10 h-10 rounded-full bg-[#1B3B2B] hover:bg-[#142A1E] text-white flex items-center justify-center transition-colors shadow-md border border-[#D4AF37]/50 ml-2 disabled:opacity-50 disabled:cursor-not-allowed">
               {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4 ml-1" />}
             </button>
          </form>
        </div>
      </div>
    </div>
  );
}

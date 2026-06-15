"use client";

import React, { useState, useRef } from "react";
import { Send, Mic, Command } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

type AgentType = "athena" | "apollo" | "ares" | "system";

interface Message {
  id: number;
  role: "user" | "assistant";
  agent?: AgentType;
  content: string;
}

export function CaseChat({ caseId }: { caseId: string }) {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, role: "assistant", agent: "athena", content: `I have compiled the initial research for case ${caseId}. How should we proceed?` }
  ]);
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [showSummonMenu, setShowSummonMenu] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSend = (overrideInput?: string) => {
    const text = overrideInput || input;
    if (!text.trim()) return;
    
    // Check if summoning an agent
    let targetAgent: AgentType = "athena"; // default
    if (text.startsWith("@apollo")) targetAgent = "apollo";
    if (text.startsWith("@ares")) targetAgent = "ares";
    
    setMessages(prev => [...prev, { id: Date.now(), role: "user", content: text }]);
    setInput("");
    setShowSummonMenu(false);

    // Mock agent response
    setTimeout(() => {
      let reply = "";
      if (targetAgent === "apollo") reply = "I am crafting the elegant code architecture for this request.";
      else if (targetAgent === "ares") reply = "I will critique this heavily. We must ensure robust error handling.";
      else reply = "I will reference the Pantheon Vault for historical context on this.";

      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        role: "assistant", 
        agent: targetAgent, 
        content: reply 
      }]);
    }, 1000);
  };

  const getAgentStyles = (agent?: AgentType) => {
    switch (agent) {
      case "athena": return { name: "Athena", img: "/athena.png", color: "border-blue-200" };
      case "apollo": return { name: "Apollo", img: "/apollo.png", color: "border-yellow-200" };
      case "ares": return { name: "Ares", img: "/ares.png", color: "border-red-200" };
      default: return { name: "System", img: "/column.png", color: "border-pantheon-border" };
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (isRecording) {
      // Simulate transcribing voice
      setTimeout(() => {
        handleSend("@apollo I need you to draft the next UI component.");
      }, 1500);
    }
  };

  return (
    <div className="flex flex-col h-full bg-pantheon-surface rounded-xl border border-pantheon-border shadow-sm overflow-hidden relative">
      <div className="p-4 border-b border-pantheon-border bg-pantheon-bg flex justify-between items-center">
        <h2 className="font-serif text-lg font-bold text-pantheon-text-primary">Council of Swarms</h2>
        <div className="flex space-x-2">
          {["athena", "apollo", "ares"].map((a) => (
             <div key={a} className="w-6 h-6 rounded-full border border-pantheon-border overflow-hidden relative" title={`Agent ${a}`}>
                <Image src={`/${a}.png`} alt={a} fill className="object-cover" />
             </div>
          ))}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar bg-pantheon-bg/50">
        {messages.map((msg) => (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div className={`max-w-[85%] flex items-start space-x-3 ${msg.role === "user" ? "flex-row-reverse space-x-reverse" : ""}`}>
              
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 shadow-sm overflow-hidden border-2 ${
                msg.role === "user" ? "border-pantheon-emerald-main bg-pantheon-emerald-light/20" : getAgentStyles(msg.agent).color
              }`}>
                {msg.role === "assistant" ? (
                  <Image src={getAgentStyles(msg.agent).img} alt="Agent" width={32} height={32} className="object-cover" />
                ) : (
                  <span className="font-bold text-pantheon-emerald-main text-xs">U</span>
                )}
              </div>

              <div className="flex flex-col">
                {msg.role === "assistant" && (
                   <span className="text-[10px] uppercase font-bold tracking-widest text-pantheon-text-secondary mb-1 ml-1">
                     {getAgentStyles(msg.agent).name}
                   </span>
                )}
                <div className={`p-3 rounded-2xl ${
                  msg.role === "assistant"
                    ? "bg-pantheon-surface border border-pantheon-border text-pantheon-text-primary shadow-sm rounded-tl-sm"
                    : "bg-pantheon-emerald-main text-white shadow-md rounded-tr-sm"
                }`}>
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        {isRecording && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center my-4">
              <div className="bg-pantheon-emerald-light/20 text-pantheon-emerald-main text-xs font-bold px-4 py-2 rounded-full flex items-center border border-pantheon-emerald-main animate-pulse">
                <Mic className="w-3 h-3 mr-2" /> Oracle Listening... (Release to Transcribe)
              </div>
           </motion.div>
        )}
      </div>

      <div className="p-4 bg-pantheon-surface border-t border-pantheon-border relative">
        <AnimatePresence>
           {showSummonMenu && (
             <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: 10 }}
               className="absolute bottom-full mb-2 left-4 bg-pantheon-surface border border-pantheon-border rounded-xl shadow-lg p-2 w-64 z-50"
             >
               <div className="text-xs font-bold text-pantheon-text-secondary uppercase mb-2 px-2">Summon Deity</div>
               {[
                 { id: "athena", label: "Athena (Research)" },
                 { id: "apollo", label: "Apollo (Code)" },
                 { id: "ares", label: "Ares (Critique)" }
               ].map(agent => (
                 <button 
                   key={agent.id}
                   className="w-full text-left px-3 py-2 text-sm text-pantheon-text-primary hover:bg-pantheon-bg rounded-lg transition-colors flex items-center"
                   onClick={() => {
                     setInput(`@${agent.id} `);
                     setShowSummonMenu(false);
                     inputRef.current?.focus();
                   }}
                 >
                   <Image src={`/${agent.id}.png`} alt={agent.id} width={20} height={20} className="rounded-full mr-2" />
                   {agent.label}
                 </button>
               ))}
             </motion.div>
           )}
        </AnimatePresence>

        <div className="relative flex items-center bg-pantheon-bg border border-pantheon-border rounded-xl px-2 py-1 shadow-inner focus-within:border-pantheon-emerald-main transition-colors">
          <button 
             onClick={() => setShowSummonMenu(!showSummonMenu)}
             className="p-2 text-pantheon-text-secondary hover:text-pantheon-emerald-main transition-colors"
          >
             <Command className="w-4 h-4" />
          </button>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              if (e.target.value === "@") setShowSummonMenu(true);
              else if (!e.target.value.startsWith("@")) setShowSummonMenu(false);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type '@' to summon a deity..."
            className="flex-1 bg-transparent outline-none text-pantheon-text-primary placeholder-pantheon-text-secondary/50 px-2 text-sm"
          />
          <button
            onMouseDown={toggleRecording}
            onMouseUp={toggleRecording}
            className={`p-2 transition-colors ${isRecording ? "text-red-500 bg-red-100 rounded-lg" : "text-pantheon-text-secondary hover:text-pantheon-emerald-main"}`}
            title="Hold to speak to the Oracle"
          >
            <Mic className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleSend()}
            className="ml-1 p-2 rounded-lg bg-pantheon-emerald-main hover:bg-pantheon-emerald-dark text-white transition-colors shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { Send, Bot, User } from "lucide-react";
import { motion } from "framer-motion";

export function CaseChat({ caseId }: { caseId: string }) {
  const [messages, setMessages] = useState([
    { id: 1, role: "assistant", content: `I'm analyzing the context for case ${caseId}. Let's get to work.` }
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { id: Date.now(), role: "user", content: input }]);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full bg-pantheon-obsidian rounded-xl border border-pantheon-emerald-900/50 overflow-hidden">
      <div className="p-4 border-b border-pantheon-emerald-900/50 bg-pantheon-onyx-light">
        <h2 className="font-serif text-lg font-semibold text-pantheon-marble">Workspace Agent</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((msg) => (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div className={`max-w-[85%] flex items-start space-x-2 ${msg.role === "user" ? "flex-row-reverse space-x-reverse" : ""}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border mt-1 ${
                msg.role === "assistant" 
                  ? "bg-pantheon-emerald-900 border-pantheon-emerald-500 text-pantheon-emerald-400" 
                  : "bg-pantheon-onyx border-pantheon-marble-muted text-pantheon-marble"
              }`}>
                {msg.role === "assistant" ? <Bot className="w-3 h-3" /> : <User className="w-3 h-3" />}
              </div>
              <div className={`p-3 rounded-xl ${
                msg.role === "assistant"
                  ? "bg-pantheon-onyx-light border border-pantheon-emerald-900/30 text-pantheon-marble"
                  : "bg-pantheon-emerald-900/20 border border-pantheon-emerald-800/50 text-pantheon-marble"
              }`}>
                <p className="text-sm">{msg.content}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="p-3 bg-pantheon-onyx-light border-t border-pantheon-emerald-900/50">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Instruct the agent..."
            className="flex-1 bg-pantheon-obsidian border border-pantheon-emerald-900/50 rounded-lg outline-none text-pantheon-marble placeholder-pantheon-marble-muted px-3 py-2 text-sm"
          />
          <button
            onClick={handleSend}
            className="ml-2 p-2 rounded-lg bg-pantheon-emerald-800 hover:bg-pantheon-emerald-700 text-pantheon-marble transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { Send, Bot, User, Cpu } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const [messages, setMessages] = useState([
    { id: 1, role: "assistant", content: "Welcome back. I have analyzed your schedule and the latest context for Project Pantheon. How can I assist you today?" }
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { id: Date.now(), role: "user", content: input }]);
    setInput("");
    // TODO: implement local LLM routing here
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto p-6">
      <header className="mb-8 mt-4 text-center">
        <h1 className="font-serif text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pantheon-marble to-pantheon-gold">Mission Control</h1>
        <p className="text-sm text-pantheon-emerald-400 mt-2 tracking-widest uppercase flex items-center justify-center">
          <Cpu className="w-4 h-4 mr-2" /> Local Agent Active
        </p>
      </header>

      <div className="flex-1 overflow-y-auto space-y-6 mb-6 pr-2 custom-scrollbar">
        {messages.map((msg) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div className={`max-w-[80%] flex items-start space-x-3 ${msg.role === "user" ? "flex-row-reverse space-x-reverse" : ""}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                msg.role === "assistant" 
                  ? "bg-pantheon-emerald-900/80 border-pantheon-emerald-500 text-pantheon-emerald-400" 
                  : "bg-pantheon-onyx border-pantheon-marble-muted text-pantheon-marble"
              }`}>
                {msg.role === "assistant" ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
              </div>
              <div className={`p-4 rounded-xl ${
                msg.role === "assistant"
                  ? "bg-pantheon-onyx-light border border-pantheon-emerald-900/50 text-pantheon-marble"
                  : "bg-pantheon-emerald-900/30 border border-pantheon-emerald-800/50 text-pantheon-marble"
              }`}>
                <p className="text-sm leading-relaxed">{msg.content}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-pantheon-emerald-500 to-pantheon-gold opacity-20 rounded-xl blur-md" />
        <div className="relative bg-pantheon-onyx border border-pantheon-emerald-900/50 rounded-xl flex items-center p-2 shadow-2xl">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Command the Pantheon..."
            className="flex-1 bg-transparent border-none outline-none text-pantheon-marble placeholder-pantheon-marble-muted px-4 py-2"
          />
          <button
            onClick={handleSend}
            className="p-2 rounded-lg bg-pantheon-emerald-800 hover:bg-pantheon-emerald-700 text-pantheon-marble transition-colors ml-2"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

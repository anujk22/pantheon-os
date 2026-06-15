"use client";

import React, { useState } from "react";
import { FileText, Code, Database, Globe, Search, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadLogs } from "@/components/module-a/UploadLogs";

const mockArtifacts = [
  { id: 1, title: "System Architecture V2", type: "text", date: "Today", excerpt: "The updated architecture utilizes a local vector DB..." },
  { id: 2, title: "Prisma Schema Scaffold", type: "code", date: "Yesterday", excerpt: "model User { id String @id }..." },
  { id: 3, title: "Chat Logs Q3", type: "data", date: "2 days ago", excerpt: "5000+ context items embedded." },
  { id: 4, title: "OAuth Callback Flow", type: "web", date: "Last week", excerpt: "Implemented Google OAuth for Canvas integration." },
  { id: 5, title: "Agentic Loop Logic", type: "code", date: "Last week", excerpt: "while(true) { await dreamCadence(); }" },
];

export default function VaultPage() {
  const [filter, setFilter] = useState<"all" | "text" | "code" | "data" | "web">("all");

  const filteredArtifacts = filter === "all" ? mockArtifacts : mockArtifacts.filter(a => a.type === filter);

  const getTypeIcon = (type: string) => {
    switch(type) {
      case "text": return <FileText className="w-5 h-5 text-pantheon-emerald-400" />;
      case "code": return <Code className="w-5 h-5 text-pantheon-emerald-400" />;
      case "data": return <Database className="w-5 h-5 text-pantheon-emerald-400" />;
      case "web": return <Globe className="w-5 h-5 text-pantheon-emerald-400" />;
      default: return <FileText className="w-5 h-5 text-pantheon-emerald-400" />;
    }
  };

  return (
    <div className="flex flex-col h-full w-full p-6 space-y-6">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="font-serif text-3xl font-bold text-pantheon-marble">The Vault</h1>
          <p className="text-sm text-pantheon-marble-muted mt-2">Your central repository for structured artifacts, code blocks, and context.</p>
        </div>
      </header>

      {/* Upload Component */}
      <UploadLogs />

      {/* Filter and Search */}
      <div className="flex items-center justify-between bg-pantheon-onyx border border-pantheon-emerald-900/50 rounded-xl p-2">
        <div className="flex space-x-1">
          {["all", "text", "code", "data", "web"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                filter === f 
                  ? "bg-pantheon-emerald-900/50 text-pantheon-emerald-400 shadow-sm" 
                  : "text-pantheon-marble-muted hover:text-pantheon-marble hover:bg-pantheon-onyx-light"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        
        <div className="relative w-64 hidden md:block">
          <input
            type="text"
            placeholder="Search artifacts..."
            className="w-full bg-pantheon-obsidian border border-pantheon-emerald-900/50 rounded-lg outline-none text-pantheon-marble placeholder-pantheon-marble-muted pl-10 pr-4 py-2 text-sm"
          />
          <Search className="w-4 h-4 text-pantheon-marble-muted absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Masonry Grid (simulated with CSS columns for simplicity) */}
      <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6 pb-6">
        <AnimatePresence>
          {filteredArtifacts.map((artifact) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              key={artifact.id}
              className="break-inside-avoid"
            >
              <div className="bg-pantheon-onyx-light border border-pantheon-emerald-900/30 rounded-xl p-5 hover:border-pantheon-emerald-600 transition-colors cursor-pointer group">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-pantheon-obsidian rounded-lg border border-pantheon-emerald-900/50">
                    {getTypeIcon(artifact.type)}
                  </div>
                  <span className="text-xs font-semibold text-pantheon-marble-muted uppercase tracking-widest">
                    {artifact.date}
                  </span>
                </div>
                <h3 className="font-serif text-lg font-semibold text-pantheon-marble mb-2 group-hover:text-pantheon-emerald-400 transition-colors">
                  {artifact.title}
                </h3>
                <p className="text-sm text-pantheon-marble-muted font-mono bg-pantheon-obsidian/50 p-3 rounded border border-pantheon-emerald-900/20">
                  {artifact.excerpt}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

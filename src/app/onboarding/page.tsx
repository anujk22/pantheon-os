"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Cpu, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";

export default function OnboardingPage() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleComplete = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      await axios.post("/api/onboarding", { name });
      router.push("/");
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-pantheon-obsidian overflow-hidden p-6 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pantheon-emerald-900/20 blur-[150px] pointer-events-none rounded-full" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-pantheon-onyx/80 backdrop-blur-xl border border-pantheon-emerald-900/50 p-8 rounded-2xl shadow-2xl relative z-10"
      >
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pantheon-emerald-500 to-pantheon-emerald-700 flex items-center justify-center border border-pantheon-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
            <span className="font-serif font-bold text-pantheon-obsidian text-3xl">P</span>
          </div>
        </div>
        
        <h1 className="font-serif text-3xl font-bold text-center text-pantheon-marble mb-2">Welcome to Pantheon</h1>
        <p className="text-center text-pantheon-marble-muted text-sm mb-8">
          Your private, local Agentic Operating System. All your data stays strictly on your machine.
        </p>

        <div className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-pantheon-emerald-400 uppercase tracking-wider mb-2">
              Commander Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="How should the agent address you?"
              className="w-full bg-pantheon-obsidian border border-pantheon-emerald-900/50 rounded-lg outline-none text-pantheon-marble placeholder-pantheon-marble-muted px-4 py-3 focus:border-pantheon-emerald-500 transition-colors"
            />
          </div>

          <div className="p-4 bg-pantheon-emerald-900/20 border border-pantheon-emerald-900/50 rounded-lg">
            <h3 className="text-sm font-medium text-pantheon-marble flex items-center mb-2">
              <Cpu className="w-4 h-4 mr-2 text-pantheon-emerald-500" />
              Local Data Directory Active
            </h3>
            <p className="text-xs text-pantheon-marble-muted leading-relaxed">
              Pantheon uses Docker to bind your Vector DB and SQLite data strictly to your <code>PANTHEON_DATA_DIR</code>. Your memories will never leave this directory.
            </p>
          </div>

          <button
            onClick={handleComplete}
            disabled={!name.trim() || loading}
            className="w-full flex justify-center items-center py-3 bg-gradient-to-r from-pantheon-emerald-600 to-pantheon-emerald-800 text-pantheon-marble rounded-lg font-medium shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all disabled:opacity-50"
          >
            {loading ? "Initializing..." : <><CheckCircle className="w-5 h-5 mr-2" /> Initialize Pantheon</>}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

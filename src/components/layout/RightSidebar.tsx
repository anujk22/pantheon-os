"use client";

import React from "react";
import { Calendar, Clock, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export function RightSidebar() {
  return (
    <motion.aside
      initial={{ x: 50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-80 border-l border-pantheon-emerald-900 bg-pantheon-onyx/80 backdrop-blur-xl flex flex-col h-full p-4 overflow-y-auto"
    >
      <h2 className="font-serif text-lg font-semibold text-pantheon-marble mb-6 flex items-center">
        <Clock className="w-5 h-5 mr-2 text-pantheon-emerald-500" />
        Daily Context
      </h2>

      {/* Morning Briefing Section */}
      <div className="mb-6">
        <h3 className="text-xs font-semibold text-pantheon-marble-muted uppercase tracking-wider mb-3">Morning Briefing</h3>
        <div className="p-4 rounded-lg bg-pantheon-onyx-light border border-pantheon-emerald-900/50 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-pantheon-gold-light" />
          <p className="text-sm text-pantheon-marble leading-relaxed">
            Good morning. You have 3 Canvas assignments due this week and a team sync at 2 PM. I have prepared the context for the Pantheon project.
          </p>
        </div>
      </div>

      {/* Deadlines Section */}
      <div className="mb-6">
        <h3 className="text-xs font-semibold text-pantheon-marble-muted uppercase tracking-wider mb-3 flex items-center">
          <AlertCircle className="w-4 h-4 mr-1" /> Deadlines
        </h3>
        <div className="space-y-2">
          {[
            { id: 1, title: "Submit OS Architecture", due: "Today, 11:59 PM", source: "Canvas" },
            { id: 2, title: "Review Vector DB Schema", due: "Tomorrow, 5:00 PM", source: "Self" },
          ].map((task) => (
            <div key={task.id} className="p-3 rounded-lg bg-pantheon-onyx-light border border-pantheon-emerald-900/30 flex justify-between items-center group hover:border-pantheon-emerald-600 transition-colors cursor-pointer">
              <div>
                <p className="text-sm font-medium text-pantheon-marble">{task.title}</p>
                <p className="text-xs text-pantheon-emerald-500 mt-1">{task.due}</p>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-pantheon-marble-muted bg-pantheon-onyx px-2 py-1 rounded">
                {task.source}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Calendar Section */}
      <div>
        <h3 className="text-xs font-semibold text-pantheon-marble-muted uppercase tracking-wider mb-3 flex items-center">
          <Calendar className="w-4 h-4 mr-1" /> Schedule
        </h3>
        <div className="space-y-3 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-pantheon-emerald-900">
          {[
            { time: "10:00 AM", event: "Deep Work Block" },
            { time: "2:00 PM", event: "Team Sync" },
          ].map((item, idx) => (
            <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-4 h-4 rounded-full border border-pantheon-emerald-500 bg-pantheon-onyx text-pantheon-marble shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2" />
              <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-2.5rem)] p-3 rounded-lg border border-pantheon-emerald-900/30 bg-pantheon-onyx-light ml-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-pantheon-emerald-400">{item.time}</span>
                </div>
                <p className="text-sm text-pantheon-marble">{item.event}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.aside>
  );
}

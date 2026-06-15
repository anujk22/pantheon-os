"use client";

import React, { useState } from "react";
import { Blocks, Check, Plus, AlertCircle } from "lucide-react";

type Integration = {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: "connected" | "disconnected";
};

const INITIAL_INTEGRATIONS: Integration[] = [
  {
    id: "github",
    name: "GitHub",
    description: "Sync repositories, issues, and PRs into the OS knowledge graph.",
    icon: "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",
    status: "disconnected",
  },
  {
    id: "notion",
    name: "Notion",
    description: "Read databases and pages to enrich context.",
    icon: "https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png",
    status: "disconnected",
  },
  {
    id: "gcal",
    name: "Google Calendar",
    description: "Sync your schedule for the Morning Briefing.",
    icon: "https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg",
    status: "disconnected",
  },
  {
    id: "linear",
    name: "Linear",
    description: "Manage issues and tasks from your Command Layer.",
    icon: "https://upload.wikimedia.org/wikipedia/commons/c/c8/Linear_logo.svg",
    status: "disconnected",
  },
];

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>(INITIAL_INTEGRATIONS);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const toggleIntegration = (id: string) => {
    setLoadingId(id);
    setTimeout(() => {
      setIntegrations((prev) =>
        prev.map((int) => {
          if (int.id === id) {
            return {
              ...int,
              status: int.status === "connected" ? "disconnected" : "connected",
            };
          }
          return int;
        })
      );
      setLoadingId(null);
    }, 800);
  };

  return (
    <div className="stone-panel architectural-corners flex h-full w-full flex-col overflow-hidden p-6">
      <header className="relative z-10 mb-8 flex items-end justify-between gap-6">
        <div>
          <h1 className="font-serif text-3xl font-semibold tracking-[0.08em] text-[var(--text-primary)]">
            INTEGRATIONS
          </h1>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Connect Pantheon OS to your external knowledge sources.
          </p>
        </div>
      </header>

      <div className="relative z-10 flex-1 overflow-y-auto custom-scrollbar pr-2">
        
        <div className="mb-6 p-4 bg-[#fff7f4]/80 border border-[#b94d3f]/25 rounded-[8px] flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-[#b94d3f] shrink-0 mt-0.5" />
          <p className="text-sm text-[#7b2d25] leading-relaxed">
            <strong>Mock Environment:</strong> OAuth flows are disabled in this build. You can toggle the buttons to preview the UI, but no external data is being ingested.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {integrations.map((int) => (
            <div
              key={int.id}
              className="stone-card architectural-corners p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-[rgba(174,144,100,0.18)] p-2 flex items-center justify-center">
                    <img src={int.icon} alt={int.name} className="w-8 h-8 object-contain" />
                  </div>
                  {int.status === "connected" && (
                    <span className="bg-[#1B3B2B]/10 text-[#1B3B2B] text-xs font-semibold px-2 py-1 rounded-[5px] flex items-center">
                      <Check className="w-3 h-3 mr-1" /> Active
                    </span>
                  )}
                </div>
                <h3 className="font-serif text-lg font-semibold text-[var(--text-primary)] mb-1">
                  {int.name}
                </h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed h-10 mb-4">
                  {int.description}
                </p>
              </div>

              <button
                onClick={() => toggleIntegration(int.id)}
                disabled={loadingId === int.id}
                className={`w-full py-2.5 rounded-[8px] font-medium text-sm transition-all flex items-center justify-center ${
                  int.status === "connected"
                    ? "bg-[rgba(255,253,248,0.72)] border border-[rgba(174,144,100,0.34)] text-[#1B3B2B] hover:bg-white"
                    : "bg-[var(--accent-green)] text-white hover:bg-[#152F22]"
                } disabled:opacity-50`}
              >
                {loadingId === int.id ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                ) : int.status === "connected" ? (
                  "Disconnect"
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" /> Connect
                  </>
                )}
              </button>
            </div>
          ))}
          
          <div className="stone-card architectural-corners p-5 flex flex-col items-center justify-center text-center border-dashed border-[rgba(174,144,100,0.4)] opacity-70">
            <Blocks className="w-10 h-10 text-[var(--text-muted)] mb-3" />
            <h3 className="font-serif text-lg font-semibold text-[var(--text-primary)] mb-1">
              Custom Plugin
            </h3>
            <p className="text-sm text-[var(--text-muted)]">
              Build your own connection using the Pantheon API.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

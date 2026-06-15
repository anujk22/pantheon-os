import React from "react";
import { CaseChat } from "@/components/module-c/CaseChat";
import { KanbanBoard } from "@/components/module-c/KanbanBoard";
import { FolderKanban } from "lucide-react";

export default async function CaseWorkspacePage({
  params,
}: {
  params: Promise<{ case_id: string }>;
}) {
  const caseId = (await params).case_id;

  return (
    <div className="flex flex-col h-full w-full">
      {/* Header */}
      <header className="p-6 border-b border-pantheon-emerald-900/50 bg-pantheon-onyx-light/50 backdrop-blur shrink-0">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-pantheon-emerald-900/30 rounded-lg border border-pantheon-emerald-800/50">
            <FolderKanban className="w-6 h-6 text-pantheon-emerald-500" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold text-pantheon-marble">Hackathon Workspace</h1>
            <p className="text-sm text-pantheon-emerald-400 font-mono mt-1">CASE ID: {caseId.toUpperCase()}</p>
          </div>
        </div>
      </header>

      {/* Workspace Area: Chat (Left) | Kanban (Right) */}
      <div className="flex-1 overflow-hidden p-6">
        <div className="flex h-full gap-6">
          {/* Chat Side */}
          <div className="w-1/3 min-w-[320px] max-w-md flex flex-col">
            <CaseChat caseId={caseId} />
          </div>

          {/* Kanban / Timeline Side */}
          <div className="flex-1 flex flex-col bg-pantheon-onyx border border-pantheon-emerald-900/50 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-pantheon-emerald-900/50 bg-pantheon-onyx-light flex items-center justify-between">
              <h2 className="font-serif text-lg font-semibold text-pantheon-marble">Task Board & Timeline</h2>
            </div>
            <div className="flex-1 overflow-hidden p-2">
              <KanbanBoard caseId={caseId} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

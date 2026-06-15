import React from "react";
import Link from "next/link";
import { FolderKanban, Plus } from "lucide-react";

export default function CasesIndexPage() {
  const mockCases = [
    { id: "hackathon-q3", title: "Q3 Hackathon Project", tasks: 12, status: "Active" },
    { id: "os-architecture", title: "Pantheon OS Architecture", tasks: 4, status: "Active" },
  ];

  return (
    <div className="flex flex-col h-full w-full p-6">
      <header className="flex justify-between items-end mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-pantheon-marble">Cases</h1>
          <p className="text-sm text-pantheon-marble-muted mt-2">Active dynamic workspaces and projects.</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-pantheon-emerald-800 hover:bg-pantheon-emerald-700 text-pantheon-marble rounded-lg font-medium transition-colors">
          <Plus className="w-4 h-4 mr-2" /> New Case
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockCases.map((c) => (
          <Link href={`/cases/${c.id}`} key={c.id}>
            <div className="bg-pantheon-onyx-light border border-pantheon-emerald-900/30 hover:border-pantheon-emerald-500 rounded-xl p-5 transition-colors cursor-pointer group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-pantheon-obsidian rounded-lg border border-pantheon-emerald-900/50 group-hover:bg-pantheon-emerald-900/30 transition-colors">
                  <FolderKanban className="w-6 h-6 text-pantheon-emerald-500" />
                </div>
                <span className="text-xs font-semibold text-pantheon-emerald-400 bg-pantheon-emerald-900/30 px-2 py-1 rounded">
                  {c.status}
                </span>
              </div>
              <h3 className="font-serif text-xl font-semibold text-pantheon-marble mb-2">
                {c.title}
              </h3>
              <p className="text-sm text-pantheon-marble-muted flex items-center">
                <span className="font-mono bg-pantheon-obsidian px-2 py-0.5 rounded text-xs mr-2">{c.tasks} TASKS</span>
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

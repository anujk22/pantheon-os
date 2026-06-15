/* eslint-disable */
"use client";

import React, { useState, useTransition } from "react";
import { Plus, Trash2, FileCode, FileText, FileSpreadsheet, Globe, Layers, Search, Eye } from "lucide-react";
import { createArtifact, deleteArtifact } from "./actions";

const TYPE_ICONS: Record<string, any> = {
  code: FileCode,
  text: FileText,
  data: FileSpreadsheet,
  web: Globe,
};

export default function ArtifactsClient({ artifacts }: { artifacts: any[] }) {
  const [isPending, startTransition] = useTransition();
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState("text");
  const [newContent, setNewContent] = useState("");
  const [search, setSearch] = useState("");
  const [selectedArtifact, setSelectedArtifact] = useState<any | null>(null);

  const filteredArtifacts = artifacts.filter(a => a.title.toLowerCase().includes(search.toLowerCase()) || a.content.toLowerCase().includes(search.toLowerCase()));

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    startTransition(() => {
      createArtifact({ title: newTitle, type: newType, content: newContent }).then(() => {
        setNewTitle("");
        setNewContent("");
        setIsAdding(false);
      });
    });
  };

  const handleDelete = (id: string) => {
    startTransition(() => {
      deleteArtifact(id);
      if (selectedArtifact?.id === id) setSelectedArtifact(null);
    });
  };

  return (
    <div className="stone-panel architectural-corners flex h-full w-full flex-col overflow-hidden p-6">
      <header className="relative z-10 mb-8 flex items-end justify-between gap-6">
        <div>
          <h1 className="font-serif text-3xl font-semibold tracking-[0.08em] text-[var(--text-primary)]">
            ARTIFACTS
          </h1>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Generated documents, code snippets, and persistent data structures.
          </p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 rounded-[8px] bg-[var(--accent-green)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#152F22]"
        >
          <Plus className="h-4 w-4" />
          Create Artifact
        </button>
      </header>

      {isAdding && (
        <div className="mb-6 stone-card p-5 architectural-corners">
          <form onSubmit={handleAdd} className="flex flex-col gap-4">
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Artifact Title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="flex-1 bg-white border border-[var(--pantheon-border)] rounded-lg outline-none text-[var(--text-primary)] px-4 py-2 text-sm focus:border-[var(--accent-green)] transition-colors"
                required
              />
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                className="w-40 bg-white border border-[var(--pantheon-border)] rounded-lg outline-none text-[var(--text-primary)] px-4 py-2 text-sm focus:border-[var(--accent-green)] transition-colors"
              >
                <option value="text">Text / Markdown</option>
                <option value="code">Source Code</option>
                <option value="data">Data / JSON</option>
                <option value="web">Web Resource</option>
              </select>
            </div>
            <textarea
              placeholder="Artifact content..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              className="w-full bg-white border border-[var(--pantheon-border)] rounded-lg outline-none text-[var(--text-primary)] px-4 py-3 focus:border-[var(--accent-green)] transition-colors text-sm min-h-[150px] font-mono resize-y"
              required
            />
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex items-center gap-2 rounded-[8px] bg-[var(--accent-green)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#152F22] disabled:opacity-50"
              >
                Save Artifact
              </button>
            </div>
          </form>
        </div>
      )}

      {selectedArtifact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-full flex flex-col overflow-hidden border border-[rgba(174,144,100,0.4)]">
            <div className="flex items-center justify-between p-4 border-b border-[rgba(174,144,100,0.18)] bg-[rgba(255,253,248,0.72)]">
              <h2 className="font-serif text-xl font-semibold text-[var(--text-primary)]">
                {selectedArtifact.title}
              </h2>
              <button onClick={() => setSelectedArtifact(null)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                Close
              </button>
            </div>
            <div className="p-6 overflow-y-auto bg-[rgba(255,253,248,0.3)] flex-1">
              <pre className="text-sm text-[var(--text-primary)] whitespace-pre-wrap font-mono bg-white p-4 rounded-lg border border-[rgba(174,144,100,0.2)]">
                {selectedArtifact.content}
              </pre>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6 flex items-center bg-white border border-[var(--pantheon-border)] rounded-lg px-4 py-2">
        <Search className="w-5 h-5 text-[var(--text-muted)] mr-2" />
        <input 
          type="text" 
          placeholder="Search artifacts..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 bg-transparent outline-none text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)]"
        />
      </div>

      <div className="relative z-10 flex-1 overflow-y-auto custom-scrollbar pr-2">
        {filteredArtifacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center opacity-70">
            <Layers className="w-10 h-10 text-[var(--text-muted)] mb-3" />
            <h3 className="font-serif text-lg font-semibold text-[var(--text-primary)]">
              No artifacts found
            </h3>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              Create documents or ask the OS to generate artifacts.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredArtifacts.map((artifact) => {
              const Icon = TYPE_ICONS[artifact.type] || FileText;
              return (
                <div key={artifact.id} className="stone-card architectural-corners p-4 flex flex-col justify-between group cursor-pointer transition hover:border-[var(--accent-green)]" onClick={() => setSelectedArtifact(artifact)}>
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-[rgba(255,253,248,0.72)] border border-[rgba(174,144,100,0.28)] flex items-center justify-center text-[var(--accent-bronze)]">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">
                        {artifact.type}
                      </span>
                    </div>
                    <h3 className="font-serif font-semibold text-[var(--text-primary)] line-clamp-2 mb-2">
                      {artifact.title}
                    </h3>
                  </div>
                  
                  <div className="flex justify-between items-center pt-3 border-t border-[rgba(174,144,100,0.18)] mt-2">
                    <span className="text-xs text-[var(--text-muted)]">
                      {new Date(artifact.createdAt).toLocaleDateString()}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(artifact.id); }}
                      disabled={isPending}
                      className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

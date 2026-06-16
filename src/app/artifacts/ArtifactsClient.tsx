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
          className="flex items-center gap-2 rounded-[8px] bg-[var(--accent-green)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--accent-green-hover)]"
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
                className="form-control flex-1 px-4 py-2 text-sm"
                required
              />
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                className="form-control w-40 px-4 py-2 text-sm"
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
              className="form-control min-h-[150px] w-full resize-y px-4 py-3 font-mono text-sm"
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
                className="flex items-center gap-2 rounded-[8px] bg-[var(--accent-green)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--accent-green-hover)] disabled:opacity-50"
              >
                Save Artifact
              </button>
            </div>
          </form>
        </div>
      )}

      {selectedArtifact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--overlay)] p-6 backdrop-blur-sm">
          <div className="flex max-h-full w-full max-w-4xl flex-col overflow-hidden rounded-[14px] border border-[var(--border-soft)] bg-[var(--surface-raised)] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--border-soft)] bg-[var(--control-muted)] p-4">
              <h2 className="font-serif text-xl font-semibold text-[var(--text-primary)]">
                {selectedArtifact.title}
              </h2>
              <button onClick={() => setSelectedArtifact(null)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                Close
              </button>
            </div>
            <div className="flex-1 overflow-y-auto bg-[var(--control-subtle)] p-6">
              <pre className="rounded-lg border border-[var(--border-soft)] bg-[var(--control)] p-4 font-mono text-sm whitespace-pre-wrap text-[var(--text-primary)]">
                {selectedArtifact.content}
              </pre>
            </div>
          </div>
        </div>
      )}

      <div className="form-control mb-6 flex items-center px-4 py-2">
        <Search className="w-5 h-5 text-[var(--text-muted)] mr-2" />
        <input 
          type="text" 
          placeholder="Search artifacts..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 bg-transparent text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-subtle)]"
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
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-soft)] bg-[var(--control-muted)] text-[var(--accent-bronze)]">
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

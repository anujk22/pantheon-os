/* eslint-disable */
"use client";

import React, { useState, useTransition } from "react";
import { Brain, Plus, Trash2, Database, Search } from "lucide-react";
import { createMemory, deleteMemory } from "./actions";

export default function VaultClient({ memories }: { memories: any[] }) {
  const [isPending, startTransition] = useTransition();
  const [isAdding, setIsAdding] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [search, setSearch] = useState("");

  const filteredMemories = memories.filter(m => m.content.toLowerCase().includes(search.toLowerCase()));

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;
    startTransition(() => {
      createMemory({ content: newContent }).then(() => {
        setNewContent("");
        setIsAdding(false);
      });
    });
  };

  const handleDelete = (id: string) => {
    startTransition(() => {
      deleteMemory(id);
    });
  };

  return (
    <div className="stone-panel architectural-corners flex h-full w-full flex-col overflow-hidden p-6">
      <header className="relative z-10 mb-8 flex items-end justify-between gap-6">
        <div>
          <h1 className="font-serif text-3xl font-semibold tracking-[0.08em] text-[var(--text-primary)]">
            VAULT
          </h1>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Your long-term agentic memory and semantic knowledge base.
          </p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 rounded-[8px] bg-[var(--accent-green)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--accent-green-hover)]"
        >
          <Plus className="h-4 w-4" />
          Add Memory
        </button>
      </header>

      {isAdding && (
        <div className="mb-6 stone-card p-5 architectural-corners">
          <form onSubmit={handleAdd} className="flex flex-col gap-4">
            <textarea
              autoFocus
              placeholder="Inject a new fact or context into Pantheon's memory..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              className="form-control min-h-[100px] w-full resize-none px-4 py-3 text-sm"
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
                Inject Memory
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="form-control mb-6 flex items-center px-4 py-2">
        <Search className="w-5 h-5 text-[var(--text-muted)] mr-2" />
        <input 
          type="text" 
          placeholder="Search memory graph..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 bg-transparent text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-subtle)]"
        />
      </div>

      <div className="relative z-10 flex-1 overflow-y-auto custom-scrollbar pr-2">
        {filteredMemories.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center opacity-70">
            <Database className="w-10 h-10 text-[var(--text-muted)] mb-3" />
            <h3 className="font-serif text-lg font-semibold text-[var(--text-primary)]">
              No memories found
            </h3>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              Add context to help Pantheon OS understand your environment.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredMemories.map((memory) => (
              <div key={memory.id} className="stone-card architectural-corners p-5 flex flex-col justify-between group">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="flex items-center text-xs font-semibold uppercase tracking-wider text-[var(--accent-bronze)]">
                      <Brain className="w-3 h-3 mr-1.5" />
                      {memory.memoryType}
                    </span>
                    <span className="rounded-[4px] border border-[var(--border-soft)] bg-[var(--control-muted)] px-2 py-0.5 text-[10px] text-[var(--text-muted)] uppercase">
                      {memory.sourceType}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-[var(--text-primary)] mb-4 whitespace-pre-wrap">
                    {memory.content}
                  </p>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-[rgba(174,144,100,0.18)]">
                  <span className="text-xs text-[var(--text-muted)]">
                    {new Date(memory.createdAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => handleDelete(memory.id)}
                    disabled={isPending}
                    className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

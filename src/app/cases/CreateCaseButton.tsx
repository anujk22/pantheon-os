"use client";

import React, { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { createCase } from "./actions";

export default function CreateCaseButton() {
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    startTransition(() => {
      createCase({ title, description }).then(() => {
        setTitle("");
        setDescription("");
        setIsOpen(false);
      });
    });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-[8px] bg-[var(--accent-green)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#152F22]"
      >
        <Plus className="h-4 w-4" />
        New Case
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-[rgba(174,144,100,0.4)]">
            <div className="flex items-center justify-between p-4 border-b border-[rgba(174,144,100,0.18)] bg-[rgba(255,253,248,0.72)]">
              <h2 className="font-serif text-xl font-semibold text-[var(--text-primary)]">
                Create New Case
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Case Title
                </label>
                <input
                  type="text"
                  autoFocus
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-white border border-[var(--pantheon-border)] rounded-lg outline-none text-[var(--text-primary)] px-4 py-2.5 focus:border-[var(--accent-green)] transition-colors text-sm"
                  placeholder="e.g. Project Phoenix"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Description <span className="text-[var(--text-muted)] font-normal">(Optional)</span>
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full bg-white border border-[var(--pantheon-border)] rounded-lg outline-none text-[var(--text-primary)] px-4 py-2.5 focus:border-[var(--accent-green)] transition-colors text-sm min-h-[100px]"
                  placeholder="What is this case about?"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-[rgba(174,144,100,0.18)]">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex items-center gap-2 rounded-[8px] bg-[var(--accent-green)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#152F22] disabled:opacity-50"
                >
                  {isPending ? "Creating..." : "Create Case"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

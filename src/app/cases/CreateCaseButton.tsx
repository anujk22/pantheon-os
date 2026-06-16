"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Plus, X } from "lucide-react";

export default function CreateCaseButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const title = String(formData.get("title") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();

    if (title.length < 2) {
      setMessage("Add a case title with at least 2 characters.");
      return;
    }

    startTransition(async () => {
      const response = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });
      const result = (await response.json()) as {
        caseId?: string;
        message?: string;
      };

      if (!response.ok || !result.caseId) {
        setMessage(result.message || "Case could not be created.");
        return;
      }

      setIsOpen(false);
      router.push(`/cases/${result.caseId}`);
      router.refresh();
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-[8px] bg-[var(--accent-green)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--accent-green-hover)]"
      >
        <Plus className="h-4 w-4" />
        New Case
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--overlay)] p-6 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-[14px] border border-[var(--border-soft)] bg-[var(--surface-raised)] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--border-soft)] bg-[var(--control-muted)] p-4">
              <h2 className="font-serif text-xl font-semibold text-[var(--text-primary)]">
                Create New Case
              </h2>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-[6px] text-[var(--text-muted)] transition hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
                aria-label="Close create case dialog"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-4">
                <label htmlFor="case-title" className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
                  Case Title
                </label>
                <input
                  id="case-title"
                  name="title"
                  type="text"
                  autoFocus
                  required
                  minLength={2}
                  className="form-control w-full px-4 py-2.5 text-sm"
                  placeholder="e.g. Project Phoenix"
                />
              </div>
              <div className="mb-6">
                <label htmlFor="case-description" className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
                  Description <span className="text-[var(--text-muted)] font-normal">(Optional)</span>
                </label>
                <textarea
                  id="case-description"
                  name="description"
                  className="form-control min-h-[100px] w-full px-4 py-2.5 text-sm"
                  placeholder="What is this case about?"
                />
              </div>
              {message ? (
                <p className="danger-callout mb-4 flex items-start gap-2 rounded-[8px] p-3 text-sm">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  {message}
                </p>
              ) : null}
              <div className="flex justify-end gap-3 border-t border-[var(--border-soft)] pt-4">
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
                  className="flex items-center gap-2 rounded-[8px] bg-[var(--accent-green)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--accent-green-hover)] disabled:opacity-50"
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

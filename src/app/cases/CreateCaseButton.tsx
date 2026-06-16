"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";

export default function CreateCaseButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  const closeDialog = () => {
    setError(null);
    setIsOpen(false);
  };

  const createCase = async (formData: FormData) => {
    setError(null);
    setIsSubmitting(true);
    const response = await fetch("/api/cases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: formData.get("title"),
        description: formData.get("description"),
      }),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;
      setError(body?.message ?? "Case could not be created.");
      setIsSubmitting(false);
      return;
    }

    const body = (await response.json()) as { caseId: string };
    router.push(`/cases/${body.caseId}`);
    router.refresh();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await createCase(new FormData(event.currentTarget));
  };

  const handleCreateClick = async () => {
    const form = formRef.current;
    if (!form || !form.reportValidity()) return;

    await createCase(new FormData(form));
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setIsOpen(true);
        }}
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
                onClick={closeDialog}
                className="grid h-8 w-8 place-items-center rounded-[6px] text-[var(--text-muted)] transition hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
                aria-label="Close create case dialog"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form
              ref={formRef}
              action="/api/cases"
              method="post"
              onSubmit={handleSubmit}
              className="p-6"
            >
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
              {error && (
                <p className="mb-4 rounded-[8px] border border-[var(--danger-border)] bg-[var(--danger-bg)] px-3 py-2 text-sm text-[var(--danger-text)]">
                  {error}
                </p>
              )}
              <div className="flex justify-end gap-3 border-t border-[var(--border-soft)] pt-4">
                <button
                  type="button"
                  onClick={closeDialog}
                  className="px-4 py-2 text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleCreateClick}
                  className="flex items-center gap-2 rounded-[8px] bg-[var(--accent-green)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--accent-green-hover)] disabled:opacity-50"
                >
                  {isSubmitting ? "Creating..." : "Create Case"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

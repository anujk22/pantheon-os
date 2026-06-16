/* eslint-disable */
"use client";

import React, { useState, useTransition } from "react";
import { Settings, RefreshCcw, AlertTriangle, Save, CheckCircle, User, MessageSquare, Brain, Palette } from "lucide-react";
import { resetOnboarding, updateSettings } from "./actions";

export default function SettingsForm({ initialData }: { initialData: any }) {
  const [isPending, startTransition] = useTransition();
  const [isSaving, startSaving] = useTransition();
  const [saved, setSaved] = useState(false);

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    image: initialData?.image || "",
    systemPrompt: initialData?.systemPrompt || "",
    responseStyle: initialData?.responseStyle || "considerate",
    memoryMode: initialData?.memoryMode || "summaries",
    themeMode: initialData?.themeMode || "system",
    llmProvider: initialData?.llmProvider || "lmstudio",
    llmBaseUrl: initialData?.llmBaseUrl || "http://127.0.0.1:1234/v1",
    llmApiKey: initialData?.llmApiKey || "",
    llmModel: initialData?.llmModel || "",
  });

  const handleReset = () => {
    startTransition(() => {
      resetOnboarding();
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(false);
    startSaving(() => {
      updateSettings(formData).then(() => {
        if (formData.themeMode === "dark" || formData.themeMode === "light") {
          document.documentElement.classList.toggle("dark", formData.themeMode === "dark");
          localStorage.setItem("theme", formData.themeMode);
        } else {
          localStorage.removeItem("theme");
        }
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      });
    });
  };

  return (
    <div className="h-full w-full flex flex-col space-y-6">
      <div className="stone-panel architectural-corners flex flex-col p-8">
        <div className="flex items-center space-x-3 mb-6 border-b border-[rgba(174,144,100,0.18)] pb-4">
          <Settings className="w-6 h-6 text-[var(--accent-green)]" />
          <h1 className="text-2xl font-serif text-[var(--text-primary)] tracking-[0.08em]">SYSTEM SETTINGS</h1>
        </div>

        <div className="space-y-8 max-w-2xl overflow-y-auto custom-scrollbar pr-4">
          
          <form onSubmit={handleSave} className="soft-surface space-y-6 rounded-[8px] p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 border-b border-[rgba(174,144,100,0.18)] pb-2">
              <User className="w-5 h-5 text-[var(--accent-bronze)]" />
              <h3 className="font-serif text-xl text-[var(--text-primary)]">User Profile</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="form-control w-full px-4 py-2.5 text-sm shadow-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-2">
                  Profile Picture URL <span className="text-[var(--text-muted)] font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={e => setFormData({ ...formData, image: e.target.value })}
                  className="form-control w-full px-4 py-2.5 text-sm shadow-sm"
                  placeholder="https://example.com/avatar.png"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 mb-4 mt-8 border-b border-[rgba(174,144,100,0.18)] pb-2 pt-4">
              <Settings className="w-5 h-5 text-[var(--accent-bronze)]" />
              <h3 className="font-serif text-xl text-[var(--text-primary)]">LLM Configuration</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-2">
                  LLM Provider
                </label>
                <select
                  value={formData.llmProvider}
                  onChange={e => setFormData({ ...formData, llmProvider: e.target.value })}
                  className="form-control w-full px-4 py-2.5 text-sm shadow-sm"
                >
                  <option value="lmstudio">LM Studio (Local)</option>
                  <option value="openai">OpenAI</option>
                  <option value="gemini">Google Gemini</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-2">
                  Model Name <span className="text-[var(--text-muted)] font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={formData.llmModel}
                  onChange={e => setFormData({ ...formData, llmModel: e.target.value })}
                  className="form-control w-full px-4 py-2.5 text-sm shadow-sm"
                  placeholder="e.g. gpt-4o, gemini-1.5-pro"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-2">
                  Base URL
                </label>
                <input
                  type="text"
                  value={formData.llmBaseUrl}
                  onChange={e => setFormData({ ...formData, llmBaseUrl: e.target.value })}
                  className="form-control w-full px-4 py-2.5 text-sm shadow-sm"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-2">
                  API Key <span className="text-[var(--text-muted)] font-normal">(Optional)</span>
                </label>
                <input
                  type="password"
                  value={formData.llmApiKey}
                  onChange={e => setFormData({ ...formData, llmApiKey: e.target.value })}
                  className="form-control w-full px-4 py-2.5 text-sm shadow-sm"
                  placeholder="Leave empty if using local unauthenticated model"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 mb-4 mt-8 border-b border-[rgba(174,144,100,0.18)] pb-2 pt-4">
              <MessageSquare className="w-5 h-5 text-[var(--accent-bronze)]" />
              <h3 className="font-serif text-xl text-[var(--text-primary)]">Agent Behavior</h3>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-2">
                Custom System Prompt
              </label>
              <textarea
                value={formData.systemPrompt}
                onChange={e => setFormData({ ...formData, systemPrompt: e.target.value })}
                className="form-control min-h-[120px] w-full resize-y px-4 py-3 text-sm shadow-sm"
                placeholder="Instruct Athena on how she should act, what rules to follow, etc."
              />
              <p className="mt-2 text-xs leading-relaxed text-[var(--text-muted)]">
                Saved instructions are injected into Athena's system prompt on every chat.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-2">
                  Response Style
                </label>
                <select
                  value={formData.responseStyle}
                  onChange={e => setFormData({ ...formData, responseStyle: e.target.value })}
                  className="form-control w-full px-4 py-2.5 text-sm shadow-sm"
                >
                  <option value="considerate">Considerate: ask first when ambiguous</option>
                  <option value="concise">Concise: short answers by default</option>
                  <option value="operator">Operator: direct execution bias</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-2">
                  Memory Mode
                </label>
                <select
                  value={formData.memoryMode}
                  onChange={e => setFormData({ ...formData, memoryMode: e.target.value })}
                  className="form-control w-full px-4 py-2.5 text-sm shadow-sm"
                >
                  <option value="summaries">Save chat summaries</option>
                  <option value="manual">Manual memory only</option>
                  <option value="off">Memory off for new chats</option>
                </select>
              </div>
            </div>

            <div className="soft-surface rounded-[8px] p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
                <Brain className="h-4 w-4 text-[var(--accent-green)]" />
                Conversation Memory
              </div>
              <p className="text-sm leading-relaxed text-[var(--text-muted)]">
                When enabled, completed chats get a compact summary attached to the conversation and saved as memory context for future chats.
              </p>
            </div>

            <div className="flex items-center gap-2 mb-4 mt-8 border-b border-[rgba(174,144,100,0.18)] pb-2 pt-4">
              <Palette className="w-5 h-5 text-[var(--accent-bronze)]" />
              <h3 className="font-serif text-xl text-[var(--text-primary)]">Interface</h3>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-2">
                Theme Preference
              </label>
              <select
                value={formData.themeMode}
                onChange={e => setFormData({ ...formData, themeMode: e.target.value })}
                className="form-control w-full px-4 py-2.5 text-sm shadow-sm"
              >
                <option value="system">Use system setting</option>
                <option value="light">Light limestone</option>
                <option value="dark">Emerald Pantheon dark</option>
              </select>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-[rgba(174,144,100,0.18)] mt-6">
              {saved ? (
                <span className="text-sm text-[var(--accent-green)] flex items-center font-medium">
                  <CheckCircle className="w-4 h-4 mr-2" /> Settings saved successfully
                </span>
              ) : (
                <span />
              )}
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center rounded-[6px] bg-[var(--accent-green)] px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[var(--accent-green-hover)] disabled:opacity-50"
              >
                {isSaving ? "Saving..." : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Settings
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Danger Zone */}
          <div className="danger-callout rounded-[8px] p-6">
            <h3 className="mb-2 flex items-center font-bold">
              <AlertTriangle className="w-5 h-5 mr-2" /> Danger Zone
            </h3>
            <p className="mb-4 text-sm">
              Resetting onboarding will clear your session and force you to re-enter your LLM provider details. Use this for testing features.
            </p>
            <button 
              onClick={handleReset}
              disabled={isPending}
              type="button"
              className="flex items-center rounded-[6px] bg-[#b94d3f] px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#7b2d25] disabled:opacity-50"
            >
              {isPending ? "Resetting..." : (
                <>
                  <RefreshCcw className="w-4 h-4 mr-2" />
                  Reset Onboarding
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

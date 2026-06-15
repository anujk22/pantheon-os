/* eslint-disable */
"use client";

import React, { useState, useTransition } from "react";
import { Settings, RefreshCcw, AlertTriangle, Save, CheckCircle, User, MessageSquare } from "lucide-react";
import { resetOnboarding, updateSettings } from "./actions";

export default function SettingsForm({ initialData }: { initialData: any }) {
  const [isPending, startTransition] = useTransition();
  const [isSaving, startSaving] = useTransition();
  const [saved, setSaved] = useState(false);

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    image: initialData?.image || "",
    systemPrompt: initialData?.systemPrompt || "",
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
          
          <form onSubmit={handleSave} className="space-y-6 bg-[rgba(255,253,248,0.58)] border border-[rgba(174,144,100,0.28)] rounded-[8px] p-6 shadow-sm">
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
                  className="w-full bg-white border border-[var(--pantheon-border)] rounded-[6px] outline-none text-[var(--text-primary)] px-4 py-2.5 focus:border-[var(--accent-green)] transition-colors text-sm shadow-sm"
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
                  className="w-full bg-white border border-[var(--pantheon-border)] rounded-[6px] outline-none text-[var(--text-primary)] px-4 py-2.5 focus:border-[var(--accent-green)] transition-colors text-sm shadow-sm"
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
                  className="w-full bg-white border border-[var(--pantheon-border)] rounded-[6px] outline-none text-[var(--text-primary)] px-4 py-2.5 focus:border-[var(--accent-green)] transition-colors text-sm shadow-sm"
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
                  className="w-full bg-white border border-[var(--pantheon-border)] rounded-[6px] outline-none text-[var(--text-primary)] px-4 py-2.5 focus:border-[var(--accent-green)] transition-colors text-sm shadow-sm"
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
                  className="w-full bg-white border border-[var(--pantheon-border)] rounded-[6px] outline-none text-[var(--text-primary)] px-4 py-2.5 focus:border-[var(--accent-green)] transition-colors text-sm shadow-sm"
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
                  className="w-full bg-white border border-[var(--pantheon-border)] rounded-[6px] outline-none text-[var(--text-primary)] px-4 py-2.5 focus:border-[var(--accent-green)] transition-colors text-sm shadow-sm"
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
                className="w-full bg-white border border-[var(--pantheon-border)] rounded-[6px] outline-none text-[var(--text-primary)] px-4 py-3 focus:border-[var(--accent-green)] transition-colors text-sm min-h-[120px] resize-y shadow-sm"
                placeholder="Instruct Athena on how she should act, what rules to follow, etc."
              />
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
                className="flex items-center bg-[var(--accent-green)] hover:bg-[#152F22] text-white px-6 py-2.5 rounded-[6px] font-medium text-sm transition-colors shadow-sm disabled:opacity-50"
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
          <div className="bg-[#fff7f4]/80 border border-[#b94d3f]/25 rounded-[8px] p-6">
            <h3 className="text-[#7b2d25] font-bold flex items-center mb-2">
              <AlertTriangle className="w-5 h-5 mr-2" /> Danger Zone
            </h3>
            <p className="text-sm text-[#b94d3f] mb-4">
              Resetting onboarding will clear your session and force you to re-enter your LLM provider details. Use this for testing features.
            </p>
            <button 
              onClick={handleReset}
              disabled={isPending}
              type="button"
              className="flex items-center bg-[#b94d3f] hover:bg-[#7b2d25] text-white px-4 py-2 rounded-[6px] font-medium text-sm transition-colors shadow-sm disabled:opacity-50"
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

import { CheckCircle, Cpu } from "lucide-react";

export default function OnboardingPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--bg-limestone)] p-6">
      <div
        className="absolute inset-0 opacity-35 pointer-events-none bg-cover bg-center"
        style={{ backgroundImage: "url('/marble.png')" }}
      />
      <div className="absolute inset-x-0 top-0 h-1 bg-[var(--accent-green)]" />

      <div className="relative w-full max-w-md rounded-2xl border border-[var(--border-stone)] bg-[var(--surface-raised)] p-8 shadow-xl">
        <div className="flex justify-center mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--border-soft)] bg-[var(--accent-green)] shadow-sm">
            <span className="font-serif text-3xl font-bold text-white">P</span>
          </div>
        </div>

        <h1 className="mb-2 text-center font-serif text-3xl font-bold text-[var(--text-primary)]">
          Welcome to Pantheon
        </h1>
        <p className="mb-8 text-center text-sm text-[var(--text-muted)]">
          Your private, local Agentic Operating System. All your data stays strictly on
          your machine.
        </p>

        <form action="/api/onboarding" method="post" className="space-y-6">
          <div>
            <label className="mb-2 block text-xs font-semibold tracking-wider text-[var(--text-primary)] uppercase">
              Your Name
            </label>
            <input
              name="name"
              type="text"
              required
              placeholder="How should the OS address you?"
              className="form-control w-full px-4 py-3 text-sm"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold tracking-wider text-[var(--text-primary)] uppercase">
              LLM Provider
            </label>
            <select
              name="llmProvider"
              defaultValue="lmstudio"
              className="form-control w-full px-4 py-3 text-sm"
            >
              <option value="lmstudio">LM Studio (Local)</option>
              <option value="openai">OpenAI</option>
              <option value="gemini">Google Gemini</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold tracking-wider text-[var(--text-primary)] uppercase">
              Base URL
            </label>
            <input
              name="llmBaseUrl"
              type="text"
              defaultValue="http://127.0.0.1:1234/v1"
              placeholder="http://127.0.0.1:1234/v1"
              className="form-control w-full px-4 py-3 text-sm"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold tracking-wider text-[var(--text-primary)] uppercase">
              API Key (optional)
            </label>
            <input
              name="llmApiKey"
              type="password"
              placeholder="Only needed for hosted providers"
              className="form-control w-full px-4 py-3 text-sm"
            />
          </div>

          <div className="soft-surface rounded-lg p-4">
            <h3 className="mb-2 flex items-center text-sm font-medium text-[var(--text-primary)]">
              <Cpu className="w-4 h-4 mr-2 text-[var(--accent-green)]" />
              Local Data Directory
            </h3>
            <p className="text-xs leading-relaxed text-[var(--text-muted)]">
              Pantheon stores SQLite and vector context locally. Cloud providers are
              optional, not required.
            </p>
          </div>

          <button
            type="submit"
            className="flex w-full items-center justify-center rounded-lg bg-[var(--accent-green)] py-3 font-medium text-white shadow-sm transition-all hover:bg-[var(--accent-green-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-green)]"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            Initialize System
          </button>
        </form>
      </div>
    </div>
  );
}

import { CheckCircle, Cpu } from "lucide-react";

export default function OnboardingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-pantheon-bg overflow-hidden p-6 relative">
      <div
        className="absolute inset-0 opacity-35 pointer-events-none bg-cover bg-center"
        style={{ backgroundImage: "url('/marble.png')" }}
      />
      <div className="absolute inset-x-0 top-0 h-1 bg-[#1B3B2B]" />

      <div className="max-w-md w-full bg-white border border-[#D8D8D0] p-8 rounded-2xl shadow-xl relative">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-pantheon-emerald-main flex items-center justify-center border border-pantheon-emerald-light shadow-sm">
            <span className="font-serif font-bold text-pantheon-surface text-3xl">P</span>
          </div>
        </div>

        <h1 className="font-serif text-3xl font-bold text-center text-pantheon-text-primary mb-2">
          Welcome to Pantheon
        </h1>
        <p className="text-center text-pantheon-text-secondary text-sm mb-8">
          Your private, local Agentic Operating System. All your data stays strictly on
          your machine.
        </p>

        <form action="/api/onboarding" method="post" className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-pantheon-text-primary uppercase tracking-wider mb-2">
              Your Name
            </label>
            <input
              name="name"
              type="text"
              required
              placeholder="How should the OS address you?"
              className="w-full bg-pantheon-bg border border-pantheon-border rounded-lg outline-none text-pantheon-text-primary placeholder-pantheon-text-secondary/70 px-4 py-3 focus:border-pantheon-emerald-main transition-colors text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-pantheon-text-primary uppercase tracking-wider mb-2">
              LLM Provider
            </label>
            <select
              name="llmProvider"
              defaultValue="lmstudio"
              className="w-full bg-pantheon-bg border border-pantheon-border rounded-lg outline-none text-pantheon-text-primary px-4 py-3 focus:border-pantheon-emerald-main transition-colors text-sm"
            >
              <option value="lmstudio">LM Studio (Local)</option>
              <option value="openai">OpenAI</option>
              <option value="gemini">Google Gemini</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-pantheon-text-primary uppercase tracking-wider mb-2">
              Base URL
            </label>
            <input
              name="llmBaseUrl"
              type="text"
              defaultValue="http://127.0.0.1:1234/v1"
              placeholder="http://127.0.0.1:1234/v1"
              className="w-full bg-pantheon-bg border border-pantheon-border rounded-lg outline-none text-pantheon-text-primary placeholder-pantheon-text-secondary/70 px-4 py-3 focus:border-pantheon-emerald-main transition-colors text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-pantheon-text-primary uppercase tracking-wider mb-2">
              API Key (optional)
            </label>
            <input
              name="llmApiKey"
              type="password"
              placeholder="Only needed for hosted providers"
              className="w-full bg-pantheon-bg border border-pantheon-border rounded-lg outline-none text-pantheon-text-primary placeholder-pantheon-text-secondary/70 px-4 py-3 focus:border-pantheon-emerald-main transition-colors text-sm"
            />
          </div>

          <div className="p-4 bg-pantheon-bg border border-pantheon-border rounded-lg">
            <h3 className="text-sm font-medium text-pantheon-text-primary flex items-center mb-2">
              <Cpu className="w-4 h-4 mr-2 text-pantheon-emerald-main" />
              Local Data Directory
            </h3>
            <p className="text-xs text-pantheon-text-secondary leading-relaxed">
              Pantheon stores SQLite and vector context locally. Cloud providers are
              optional, not required.
            </p>
          </div>

          <button
            type="submit"
            className="w-full flex justify-center items-center py-3 bg-pantheon-emerald-main hover:bg-pantheon-emerald-dark text-white rounded-lg font-medium shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-pantheon-emerald-main/25"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            Initialize System
          </button>
        </form>
      </div>
    </div>
  );
}

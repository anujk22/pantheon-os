"use client";

import React, { useTransition } from "react";
import { Settings, RefreshCcw, AlertTriangle } from "lucide-react";
import { resetOnboarding } from "./actions";

export default function SettingsPage() {
  const [isPending, startTransition] = useTransition();

  const handleReset = () => {
    startTransition(() => {
      resetOnboarding();
    });
  };

  return (
    <div className="h-full w-full flex flex-col space-y-6">
      <div className="bg-white/40 backdrop-blur-md rounded-2xl border border-white shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] p-8">
        <div className="flex items-center space-x-3 mb-6 border-b border-gray-200 pb-4">
          <Settings className="w-6 h-6 text-[#1B3B2B]" />
          <h1 className="text-2xl font-serif text-[#1a1f1c]">System Settings</h1>
        </div>

        <div className="space-y-8 max-w-2xl">
          {/* Danger Zone */}
          <div className="bg-red-50/50 border border-red-100 rounded-xl p-6">
            <h3 className="text-red-800 font-bold flex items-center mb-2">
              <AlertTriangle className="w-5 h-5 mr-2" /> Danger Zone
            </h3>
            <p className="text-sm text-red-600 mb-4">
              Resetting onboarding will clear your session and force you to re-enter your LLM provider details. Use this for testing features.
            </p>
            <button 
              onClick={handleReset}
              disabled={isPending}
              className="flex items-center bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm disabled:opacity-50"
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

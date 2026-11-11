"use client";

import { useState } from "react";
import { Sliders, ShieldCheck, Database, Key } from "lucide-react";

export default function SettingsPage() {
  const [defaultModel, setDefaultModel] = useState("gpt-4o");
  const [searchProvider, setSearchProvider] = useState("duckduckgo");
  const [maxCycles, setMaxCycles] = useState("12");
  const [autoApproveLowRisk, setAutoApproveLowRisk] = useState(true);
  const [sandboxTimeout, setSandboxTimeout] = useState("30");
  const [savedNotification, setSavedNotification] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 3000);
  };

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
        <div>
          <h1 className="text-xl font-semibold text-zinc-100 tracking-tight">Settings</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Global orchestration parameters, risk boundaries, model defaults, and security policies.
          </p>
        </div>
        {savedNotification && (
          <span className="text-xs text-emerald-400 font-mono px-2.5 py-1 rounded bg-emerald-950/40 border border-emerald-900/60">
            Changes Saved
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Model Defaults */}
        <div className="p-5 rounded-lg bg-zinc-950 border border-zinc-800/80 space-y-4">
          <div className="text-xs font-medium text-zinc-200">
            AI Model & Orchestration
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs text-zinc-400">Default Reasoning Model</label>
              <select
                value={defaultModel}
                onChange={(e) => setDefaultModel(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-200 focus:outline-none"
              >
                <option value="gpt-4o">OpenAI GPT-4o</option>
                <option value="gemini-1.5-pro">Google Gemini 1.5 Pro</option>
                <option value="claude-3-5-sonnet">Anthropic Claude 3.5 Sonnet</option>
                <option value="ollama-llama3">Ollama Llama 3 (Local Air-Gapped)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs text-zinc-400">Default Search Provider</label>
              <select
                value={searchProvider}
                onChange={(e) => setSearchProvider(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-200 focus:outline-none"
              >
                <option value="duckduckgo">DuckDuckGo Instant Search</option>
                <option value="searxng">SearXNG Metasearch Engine</option>
                <option value="tavily">Tavily Deep AI Search</option>
              </select>
            </div>
          </div>
        </div>

        {/* Security & Sandbox */}
        <div className="p-5 rounded-lg bg-zinc-950 border border-zinc-800/80 space-y-4">
          <div className="text-xs font-medium text-zinc-200">
            Execution Guard & Sandbox Limits
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs text-zinc-400">Max Subprocess Timeout (seconds)</label>
              <input
                type="number"
                value={sandboxTimeout}
                onChange={(e) => setSandboxTimeout(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-200 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs text-zinc-400">Max Cycles Before Convergence</label>
              <input
                type="number"
                value={maxCycles}
                onChange={(e) => setMaxCycles(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-200 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-900 flex items-center justify-between">
            <div>
              <div className="text-xs font-medium text-zinc-200">Auto-Approve Low-Risk Tasks</div>
              <div className="text-[11px] text-zinc-500">Only pause for confirmation when risk is evaluated as HIGH</div>
            </div>
            <input
              type="checkbox"
              checked={autoApproveLowRisk}
              onChange={(e) => setAutoApproveLowRisk(e.target.checked)}
              className="w-4 h-4 rounded border-zinc-800 bg-zinc-900 text-zinc-100 focus:ring-0"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-4 py-2 rounded-md bg-zinc-100 text-zinc-950 hover:bg-white text-xs font-medium transition-colors shadow-sm"
          >
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}

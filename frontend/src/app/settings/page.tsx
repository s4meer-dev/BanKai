"use client";

import { useState } from "react";
import { Settings, ShieldCheck, Database, Save, Sliders, Key } from "lucide-react";

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
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2b3036] pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Platform Settings</h1>
          <p className="text-sm text-gray-400 mt-1">
            Global orchestration parameters, risk boundaries, model defaults, and security configurations.
          </p>
        </div>
        {savedNotification && (
          <span className="text-xs text-emerald-400 font-mono px-3 py-1.5 rounded bg-emerald-950 border border-emerald-800">
            Settings Saved
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Model & AI Settings */}
        <div className="rounded-lg bg-[#141618] border border-[#2b3036] p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider">
            <Sliders className="w-4 h-4" />
            <span>AI Model & Orchestration Defaults</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs text-gray-300 font-mono uppercase">Default Reasoning Model</label>
              <select
                value={defaultModel}
                onChange={(e) => setDefaultModel(e.target.value)}
                className="w-full px-3 py-2 bg-[#0c0d0e] border border-[#2b3036] rounded text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="gpt-4o">OpenAI GPT-4o (Frontier Multi-Agent)</option>
                <option value="gemini-1.5-pro">Google Gemini 1.5 Pro</option>
                <option value="claude-3-5-sonnet">Anthropic Claude 3.5 Sonnet</option>
                <option value="ollama-llama3">Ollama Llama 3.3 (Local Private)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-gray-300 font-mono uppercase">Default Search Provider</label>
              <select
                value={searchProvider}
                onChange={(e) => setSearchProvider(e.target.value)}
                className="w-full px-3 py-2 bg-[#0c0d0e] border border-[#2b3036] rounded text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="duckduckgo">DuckDuckGo Search (Zero Configuration)</option>
                <option value="searxng">SearXNG Metasearch (Self-Hosted)</option>
                <option value="tavily">Tavily Deep Search</option>
                <option value="mock">Simulated Mock Search (Deterministic Testing)</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-gray-300 font-mono uppercase">Max Orchestration Cycles</label>
            <input
              type="number"
              value={maxCycles}
              onChange={(e) => setMaxCycles(e.target.value)}
              className="w-full px-3 py-2 bg-[#0c0d0e] border border-[#2b3036] rounded text-xs text-white focus:outline-none focus:border-cyan-400"
            />
            <p className="text-[11px] text-gray-500">Guarantees deterministic termination; prevents unbounded loops.</p>
          </div>
        </div>

        {/* Security & Sandbox Governance */}
        <div className="rounded-lg bg-[#141618] border border-[#2b3036] p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Execution Sandbox & Governance</span>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded bg-[#0c0d0e] border border-[#2b3036]">
              <div>
                <div className="text-xs font-semibold text-white">Auto-Approve Low-Risk Operations</div>
                <div className="text-[11px] text-gray-400">
                  Allow reading public sources and drafting proposals without pausing the workflow.
                </div>
              </div>
              <input
                type="checkbox"
                checked={autoApproveLowRisk}
                onChange={(e) => setAutoApproveLowRisk(e.target.checked)}
                className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-gray-300 font-mono uppercase">Sandbox Timeout (Seconds)</label>
              <input
                type="number"
                value={sandboxTimeout}
                onChange={(e) => setSandboxTimeout(e.target.value)}
                className="w-full px-3 py-2 bg-[#0c0d0e] border border-[#2b3036] rounded text-xs text-white focus:outline-none focus:border-cyan-400"
              />
              <p className="text-[11px] text-gray-500">Subprocesses exceeding this limit are terminated automatically.</p>
            </div>
          </div>
        </div>

        {/* Save Controls */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-5 py-2 bg-gradient-to-r from-cyan-400 to-emerald-400 text-black font-semibold text-xs rounded-md shadow-md shadow-cyan-500/10 flex items-center gap-2 hover:opacity-95"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
}


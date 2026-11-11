"use client";

import { Globe, Cpu, ShieldCheck, Zap } from "lucide-react";

interface IntegrationCard {
  name: string;
  category: string;
  description: string;
  status: "Connected" | "Configured" | "Available";
}

const integrations: IntegrationCard[] = [
  {
    name: "DuckDuckGo Search",
    category: "Search Engine",
    description: "Instant web intelligence search provider with zero API keys required.",
    status: "Connected",
  },
  {
    name: "SearXNG Metasearch",
    category: "Search Engine",
    description: "Self-hosted privacy-respecting aggregator querying 70+ search engines.",
    status: "Configured",
  },
  {
    name: "Tavily Deep Search",
    category: "Search Engine",
    description: "Advanced search API designed specifically for agentic deep research.",
    status: "Available",
  },
  {
    name: "OpenAI GPT-4o",
    category: "LLM Provider",
    description: "Frontier reasoning model for orchestration and strategic synthesis.",
    status: "Connected",
  },
  {
    name: "Google Gemini 1.5 Pro",
    category: "LLM Provider",
    description: "Long-context reasoning and multi-modal document intelligence adapter.",
    status: "Available",
  },
  {
    name: "Ollama Local Models",
    category: "LLM Provider",
    description: "Fully air-gapped, zero-cost local model execution for privacy-sensitive data.",
    status: "Available",
  },
  {
    name: "Langfuse Observability",
    category: "Telemetry",
    description: "Distributed trace spans, token expenditure, and latency profiling.",
    status: "Connected",
  },
  {
    name: "PostgreSQL & pgvector",
    category: "Database & Memory",
    description: "Relational persistence with HNSW semantic vector index for 4-tier memory.",
    status: "Connected",
  },
];

export default function IntegrationsPage() {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-zinc-800/80">
        <h1 className="text-xl font-semibold text-zinc-100 tracking-tight">Integrations & Connectors</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Connected search providers, LLM runtimes, execution sandboxes, and database drivers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {integrations.map((item, idx) => (
          <div
            key={idx}
            className="p-4 rounded-lg bg-zinc-950 border border-zinc-800/80 flex flex-col justify-between space-y-3 hover:border-zinc-700 transition-colors"
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-200">{item.name}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    item.status === "Connected"
                      ? "text-emerald-400 bg-emerald-950/40 border border-emerald-900/60"
                      : item.status === "Configured"
                      ? "text-zinc-300 bg-zinc-900 border border-zinc-800"
                      : "text-zinc-500 bg-zinc-900/50 border border-zinc-800/60"
                  }`}
                >
                  {item.status}
                </span>
              </div>
              <div className="text-[10px] text-zinc-500 font-mono">{item.category}</div>
              <p className="text-xs text-zinc-400 leading-relaxed">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

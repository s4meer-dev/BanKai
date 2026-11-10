"use client";

import { Plug, Check, Settings, Globe, Cpu, ShieldCheck, Zap } from "lucide-react";

interface IntegrationCard {
  name: string;
  category: string;
  description: string;
  status: "Connected" | "Configured" | "Available";
  icon: any;
}

const integrations: IntegrationCard[] = [
  {
    name: "DuckDuckGo Search",
    category: "Search Engine",
    description: "Instant web intelligence search provider with zero API keys required.",
    status: "Connected",
    icon: Globe,
  },
  {
    name: "SearXNG Privacy Metasearch",
    category: "Search Engine",
    description: "Self-hosted privacy-respecting aggregator querying 70+ search engines.",
    status: "Configured",
    icon: Globe,
  },
  {
    name: "Tavily Deep Search",
    category: "Search Engine",
    description: "Advanced AI search API designed specifically for agentic deep research.",
    status: "Available",
    icon: Globe,
  },
  {
    name: "OpenAI GPT-4o / O1",
    category: "LLM Provider",
    description: "Primary frontier reasoning models for orchestration and strategic synthesis.",
    status: "Connected",
    icon: Cpu,
  },
  {
    name: "Google Gemini 1.5 Pro",
    category: "LLM Provider",
    description: "Long-context reasoning and multi-modal document intelligence adapter.",
    status: "Available",
    icon: Cpu,
  },
  {
    name: "Ollama Local Models",
    category: "LLM Provider",
    description: "Zero-data-leakage local open-weights inference (Llama 3.3, Qwen 2.5).",
    status: "Configured",
    icon: Cpu,
  },
  {
    name: "BanKai AST Local Sandbox",
    category: "Code Execution",
    description: "Built-in AST security validator running in isolated subprocesses.",
    status: "Connected",
    icon: ShieldCheck,
  },
  {
    name: "E2B Cloud Micro-VMs",
    category: "Code Execution",
    description: "Secure ephemeral Linux cloud micro-VM sandboxes for complex code execution.",
    status: "Available",
    icon: ShieldCheck,
  },
  {
    name: "Langfuse Tracing",
    category: "Observability",
    description: "Open-source LLM tracing, latency monitoring, and prompt engineering.",
    status: "Connected",
    icon: Zap,
  },
  {
    name: "OpenTelemetry (OTEL)",
    category: "Observability",
    description: "Industry-standard distributed tracing and metrics telemetry hook.",
    status: "Connected",
    icon: Zap,
  },
];

export default function IntegrationsPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2b3036] pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Integrations & Connectors</h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage connected AI model providers, web search engines, isolated execution environments, and telemetry pipelines.
          </p>
        </div>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {integrations.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.name}
              className="p-5 rounded-lg bg-[#141618] border border-[#2b3036] flex flex-col justify-between space-y-4 hover:border-gray-500 transition-colors"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded bg-[#1a1d20] border border-[#2b3036] text-cyan-400">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      item.status === "Connected"
                        ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                        : item.status === "Configured"
                        ? "bg-cyan-950 text-cyan-400 border border-cyan-800"
                        : "bg-[#202428] text-gray-400 border border-[#2b3036]"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <div>
                  <h3 className="font-semibold text-sm text-white">{item.name}</h3>
                  <div className="text-[10px] text-gray-500 font-mono uppercase mt-0.5">{item.category}</div>
                </div>

                <p className="text-xs text-gray-400 leading-relaxed">{item.description}</p>
              </div>

              <div className="pt-3 border-t border-[#2b3036]/60 flex items-center justify-between text-xs">
                <span className="text-[11px] text-gray-500 font-mono">Managed via .env</span>
                <button className="text-xs text-cyan-400 hover:underline font-medium">Configure &rarr;</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

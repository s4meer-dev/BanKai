"use client";

import { useState } from "react";
import {
  Cpu,
  Search,
  TrendingUp,
  Code2,
  LineChart,
  ShieldCheck,
  Compass,
  Play,
} from "lucide-react";

interface AgentProfile {
  id: string;
  name: string;
  role: string;
  category: string;
  icon: any;
  model: string;
  latency: string;
  tokens: string;
  description: string;
  capabilities: string[];
}

const agentsList: AgentProfile[] = [
  {
    id: "orchestrator",
    name: "Orchestrator Agent",
    role: "Task Decomposition & Graph Routing",
    category: "Core Control",
    icon: Cpu,
    model: "LangGraph StateGraph",
    latency: "450ms",
    tokens: "1,240",
    description: "Evaluates objective scope, breaks problems into dependency-aware subtasks, and prevents cyclic execution loops.",
    capabilities: ["Objective Parsing", "Subtask Decomposition", "Agent Assignment", "Graph Convergence Check"],
  },
  {
    id: "research",
    name: "Research Agent",
    role: "Web Crawling & Source Extraction",
    category: "Information Gathering",
    icon: Search,
    model: "Multi-Provider (DDGS / SearXNG)",
    latency: "1,200ms",
    tokens: "3,850",
    description: "Executes deep internet searches, sanitizes HTML into clean markdown, and computes SHA-256 provenance hashes.",
    capabilities: ["Pluggable Web Search", "BeautifulSoup Parser", "SHA-256 Provenance", "Adversarial Injection Filtering"],
  },
  {
    id: "market_intel",
    name: "Market Intelligence Agent",
    role: "Competitor & Market Landscape",
    category: "Domain Intelligence",
    icon: TrendingUp,
    model: "Analytical Model",
    latency: "680ms",
    tokens: "2,100",
    description: "Analyzes TAM/SAM/SOM market size, competitor feature matrices, and pricing economics.",
    capabilities: ["SWOT Synthesis", "Competitive Matrix", "TAM/SAM/SOM Sizing", "Market Dynamics"],
  },
  {
    id: "tech_research",
    name: "Technical Research Agent",
    role: "Architecture Feasibility & Benchmarking",
    category: "Domain Intelligence",
    icon: Code2,
    model: "Engineering Evaluator",
    latency: "740ms",
    tokens: "2,400",
    description: "Performs technical trade-off matrices, benchmark comparisons, and dependency risk audits.",
    capabilities: ["Stack Comparison", "Architecture Evaluation", "Latency Profiling", "Security Auditing"],
  },
  {
    id: "data_analyst",
    name: "Data Analyst Agent",
    role: "Financial Projections & Modeling",
    category: "Domain Intelligence",
    icon: LineChart,
    model: "Quantitative Engine",
    latency: "520ms",
    tokens: "1,800",
    description: "Computes 5-year financial models, operational cost ratios, unit economics, and summary metrics.",
    capabilities: ["Financial Projection", "Unit Economics", "Margin Calculation", "Data Normalization"],
  },
  {
    id: "verification",
    name: "Verification Agent",
    role: "Cross-Source Corroboration & RQS",
    category: "Quality Governance",
    icon: ShieldCheck,
    model: "Adversarial Verifier",
    latency: "890ms",
    tokens: "3,100",
    description: "Adversarial fact-checker detecting contradictions, evaluating primary evidence, and scoring Research Quality (RQS).",
    capabilities: ["Contradiction Detection", "Corroboration Scoring", "Provenance Verification", "RQS Calculation"],
  },
  {
    id: "strategy",
    name: "Strategy Agent",
    role: "Actionable Directives & Risk Tiering",
    category: "Decision Synthesis",
    icon: Compass,
    model: "Strategic Framework",
    latency: "610ms",
    tokens: "2,050",
    description: "Transforms verified evidence into prioritized strategic initiatives with explicit risk ratings.",
    capabilities: ["Risk Classification", "Action Roadmapping", "Human Approval Gate", "Execution Plan Generation"],
  },
  {
    id: "execution",
    name: "Execution Agent",
    role: "AST Sandbox & Deliverable Generation",
    category: "Production Execution",
    icon: Play,
    model: "Sandbox Compiler",
    latency: "1,450ms",
    tokens: "4,200",
    description: "Executes AST-validated Python code and compiles professional deliverables (Excel, Word, PPTX, PDF, HTML charts).",
    capabilities: ["Excel Financial Models", "Word Research Dossiers", "Executive Slide Decks", "Interactive Plotly HTML"],
  },
];

export default function AgentsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  const categories = ["ALL", "Core Control", "Information Gathering", "Domain Intelligence", "Quality Governance", "Decision Synthesis", "Production Execution"];

  const filteredAgents = agentsList.filter((a) => {
    if (selectedCategory === "ALL") return true;
    return a.category === selectedCategory;
  });

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-zinc-800/80">
        <h1 className="text-xl font-semibold text-zinc-100 tracking-tight">Specialized Agent Fleet</h1>
        <p className="text-xs text-zinc-400 mt-1">
          8 autonomous agents operating collaboratively under LangGraph stateful orchestration.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setSelectedCategory(c)}
            className={`px-3 py-1 rounded text-xs transition-colors ${
              selectedCategory === c
                ? "bg-zinc-800 text-zinc-100 font-medium"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/60"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAgents.map((a) => {
          const Icon = a.icon;
          return (
            <div
              key={a.id}
              className="p-5 rounded-lg bg-zinc-950 border border-zinc-800/80 space-y-3 hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-medium text-zinc-100">{a.name}</h3>
                    <p className="text-[11px] text-zinc-500">{a.role}</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                  {a.category}
                </span>
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed">{a.description}</p>

              <div className="flex flex-wrap gap-1.5 pt-2">
                {a.capabilities.map((cap, i) => (
                  <span
                    key={i}
                    className="text-[10px] px-2 py-0.5 rounded bg-zinc-900/80 border border-zinc-800 text-zinc-400"
                  >
                    {cap}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-zinc-800/60 text-[10px] font-mono text-zinc-500">
                <span>Model: {a.model}</span>
                <span>Avg Latency: {a.latency}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

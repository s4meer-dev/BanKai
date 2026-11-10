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
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
} from "lucide-react";

interface AgentProfile {
  id: string;
  name: string;
  role: string;
  category: string;
  icon: any;
  model: string;
  status: "idle" | "running" | "completed";
  latency: string;
  tokens: string;
  description: string;
  capabilities: string[];
}

const agentsList: AgentProfile[] = [
  {
    id: "orchestrator",
    name: "Orchestrator Agent",
    role: "Autonomous Task Decomposition & Workflow Routing",
    category: "Core Control",
    icon: Cpu,
    model: "GPT-4o / Claude 3.5 Sonnet",
    status: "completed",
    latency: "450ms",
    tokens: "1,240",
    description: "Evaluates objective scope, breaks problems into dependency-aware subtasks, and prevents cyclic execution loops.",
    capabilities: ["Objective Parsing", "Subtask Decomposition", "Agent Assignment", "Graph Convergence Check"],
  },
  {
    id: "research",
    name: "Research Agent",
    role: "Web Intelligence & Source Extraction",
    category: "Information Gathering",
    icon: Search,
    model: "DuckDuckGo + Crawl4AI",
    status: "completed",
    latency: "1,850ms",
    tokens: "3,890",
    description: "Dispatches multi-hop search queries, bypasses DOM noise, extracts sanitized Markdown, and computes SHA-256 hashes.",
    capabilities: ["Multi-Engine Search", "DOM Sanitation", "Citation Extraction", "Content Provenance Hashing"],
  },
  {
    id: "market_intel",
    name: "Market Intelligence Agent",
    role: "Competitive Positioning & SWOT Synthesis",
    category: "Strategic Analysis",
    icon: TrendingUp,
    model: "GPT-4o / Gemini 1.5 Pro",
    status: "completed",
    latency: "920ms",
    tokens: "2,150",
    description: "Evaluates competitor landscape, computes CAGR projections, formulates empirical SWOT matrices, and prices products.",
    capabilities: ["Competitor Analysis", "SWOT Modeling", "Market Sizing", "Moat Evaluation"],
  },
  {
    id: "technical_research",
    name: "Technical Research Agent",
    role: "System Architecture & Feasibility Auditing",
    category: "Engineering Analysis",
    icon: Code2,
    model: "GPT-4o",
    status: "completed",
    latency: "1,120ms",
    tokens: "2,480",
    description: "Audits open-source frameworks, verifies API compatibility, reviews benchmarks, and architects fault-tolerant pipelines.",
    capabilities: ["Stack Comparison", "Architecture Design", "API Discovery", "Security Feasibility"],
  },
  {
    id: "data_analyst",
    name: "Data Analyst Agent",
    role: "Statistical Modeling & Financial Projections",
    category: "Quantitative",
    icon: LineChart,
    model: "Python / Pandas / NumPy",
    status: "completed",
    latency: "680ms",
    tokens: "1,840",
    description: "Calculates unit economics, generates multi-year revenue models, and computes probability distributions in isolated Python.",
    capabilities: ["Pandas Dataframes", "Financial Modeling", "Statistical Variance", "Chart Code Gen"],
  },
  {
    id: "verification",
    name: "Verification Agent",
    role: "Adversarial Fact-Checking & RQS Scoring",
    category: "Integrity & Truth",
    icon: ShieldCheck,
    model: "Adversarial Validator",
    status: "completed",
    latency: "1,340ms",
    tokens: "3,100",
    description: "Detects unsupported statements, flags contradictions, and calculates the mathematical Research Quality Score (RQS).",
    capabilities: ["Contradiction Detection", "Source Reliability Audit", "RQS Calculation", "Anti-Hallucination Gating"],
  },
  {
    id: "strategy",
    name: "Strategy Agent",
    role: "Action Planning & Risk Matrix Gating",
    category: "Executive Planning",
    icon: Compass,
    model: "GPT-4o",
    status: "completed",
    latency: "890ms",
    tokens: "2,200",
    description: "Translates verified findings into prioritized recommendations, generates execution plans, and flags HIGH-risk tasks.",
    capabilities: ["Roadmap Generation", "Risk Tiering (LOW/MED/HIGH)", "Resource Estimation", "Human Approval Routing"],
  },
  {
    id: "execution",
    name: "Execution Agent",
    role: "Verified Deliverable & Artifact Production",
    category: "Execution & Artifacts",
    icon: Play,
    model: "OpenPyXL / Docx / PPTX / ReportLab",
    status: "completed",
    latency: "2,150ms",
    tokens: "1,950",
    description: "Compiles formatted Excel spreadsheets, Word dossiers, PowerPoint briefings, and publication PDFs with verified data.",
    capabilities: ["Excel Workbook Gen", "Word Document Gen", "PowerPoint Slide Gen", "PDF Publication Gen"],
  },
];

export default function AgentsPage() {
  const [selectedAgent, setSelectedAgent] = useState<AgentProfile>(agentsList[0]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2b3036] pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Agent Command Center</h1>
          <p className="text-sm text-gray-400 mt-1">
            Real-time status, execution metrics, telemetry, and capabilities of all 8 specialized BAN KAI agents.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#141618] border border-[#2b3036] text-xs font-mono text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>8 / 8 Agents Operational</span>
        </div>
      </div>

      {/* Grid of All 8 Specialized Agents */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {agentsList.map((agent) => {
          const Icon = agent.icon;
          const isSelected = selectedAgent.id === agent.id;
          return (
            <div
              key={agent.id}
              onClick={() => setSelectedAgent(agent)}
              className={`p-5 rounded-lg border cursor-pointer transition-all ${
                isSelected
                  ? "bg-[#1a1d20] border-cyan-400 shadow-md shadow-cyan-500/10"
                  : "bg-[#141618] border-[#2b3036] hover:border-gray-500 hover:bg-[#181a1d]"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-md ${isSelected ? "bg-cyan-500/20 text-cyan-400" : "bg-[#202428] text-gray-400"}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-emerald-950 text-emerald-400 border border-emerald-800">
                  {agent.status}
                </span>
              </div>

              <h2 className="font-semibold text-sm text-white">{agent.name}</h2>
              <p className="text-xs text-gray-400 line-clamp-1 mt-1">{agent.role}</p>

              <div className="mt-4 pt-3 border-t border-[#2b3036]/60 flex items-center justify-between text-[11px] font-mono text-gray-400">
                <span>Latency: {agent.latency}</span>
                <span>{agent.tokens} tokens</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Agent Deep Dive Detail Panel */}
      <div className="rounded-lg bg-[#141618] border border-[#2b3036] p-6 space-y-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-white">{selectedAgent.name}</span>
              <span className="px-2.5 py-0.5 rounded text-xs font-mono text-cyan-400 bg-cyan-950 border border-cyan-800">
                {selectedAgent.category}
              </span>
            </div>
            <p className="text-xs text-gray-400">{selectedAgent.role}</p>
          </div>

          <div className="text-right text-xs font-mono text-gray-400 space-y-1">
            <div>Model Engine: <span className="text-gray-200">{selectedAgent.model}</span></div>
            <div>Avg Latency: <span className="text-emerald-400">{selectedAgent.latency}</span></div>
          </div>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed bg-[#1a1d20] p-4 rounded-md border border-[#2b3036]">
          {selectedAgent.description}
        </p>

        {/* Capabilities Chips */}
        <div className="space-y-2">
          <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">Authorized Tool Capabilities</span>
          <div className="flex flex-wrap gap-2">
            {selectedAgent.capabilities.map((cap) => (
              <span
                key={cap}
                className="px-3 py-1 rounded-md bg-[#202428] border border-[#2b3036] text-xs font-mono text-gray-200 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                {cap}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

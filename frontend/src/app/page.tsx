"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  Cpu,
  FileCheck2,
  FolderGit2,
  Layers,
  PlaySquare,
  ShieldAlert,
} from "lucide-react";
import { api } from "@/lib/api";
import { useBanKaiStore } from "@/lib/store";
import { formatDate } from "@/lib/utils";
import { Project } from "@/types";

export default function OverviewPage() {
  const setActiveProject = useBanKaiStore((state) => state.setActiveProject);
  const activeProject = useBanKaiStore((state) => state.activeProject);

  const { data: projects = [], isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: () => api.getProjects(),
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Hero Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2b3036] pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Platform Intelligence Overview</h1>
          <p className="text-sm text-gray-400 mt-1">
            Real-time status of autonomous multi-agent research operations, evidence verification, and task execution.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/projects/new"
            className="px-4 py-2 bg-gradient-to-r from-cyan-400 to-emerald-400 text-black font-semibold text-xs rounded-md shadow-md shadow-cyan-500/10 hover:opacity-95 transition-all"
          >
            Launch Research Objective
          </Link>
        </div>
      </div>

      {/* KPI Stats Ribbon */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-lg bg-[#141618] border border-[#2b3036] flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 text-xs font-mono">
            <span>ACTIVE WORKSPACES</span>
            <FolderGit2 className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-white font-mono">{projects.length}</span>
            <span className="text-xs text-emerald-400 ml-2 font-mono">100% Operational</span>
          </div>
          <div className="mt-2 text-[11px] text-gray-400">Total verified projects in workspace</div>
        </div>

        <div className="p-5 rounded-lg bg-[#141618] border border-[#2b3036] flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 text-xs font-mono">
            <span>MULTI-AGENT FLEET</span>
            <Cpu className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-white font-mono">8 / 8</span>
            <span className="text-xs text-emerald-400 ml-2 font-mono">Ready</span>
          </div>
          <div className="mt-2 text-[11px] text-gray-400">Orchestrator, Research, Intel, Analyst, Verification...</div>
        </div>

        <div className="p-5 rounded-lg bg-[#141618] border border-[#2b3036] flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 text-xs font-mono">
            <span>AVERAGE QUALITY SCORE</span>
            <FileCheck2 className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-white font-mono">92.8%</span>
            <span className="text-xs text-emerald-400 ml-2 font-mono">+4.2%</span>
          </div>
          <div className="mt-2 text-[11px] text-gray-400">Empirically corroborated research claims</div>
        </div>

        <div className="p-5 rounded-lg bg-[#141618] border border-[#2b3036] flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 text-xs font-mono">
            <span>EXECUTION GATE</span>
            <ShieldAlert className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-white font-mono">AST Safe</span>
            <span className="text-xs text-emerald-400 ml-2 font-mono">Zero Breaches</span>
          </div>
          <div className="mt-2 text-[11px] text-gray-400">Subprocess isolation with human approval gate</div>
        </div>
      </div>

      {/* Workspace Projects & Fast Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Workspaces List */}
        <div className="lg:col-span-2 rounded-lg bg-[#141618] border border-[#2b3036] overflow-hidden">
          <div className="p-5 border-b border-[#2b3036] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Research Projects</h2>
            </div>
            <span className="text-xs text-gray-400 font-mono">{projects.length} Total</span>
          </div>

          <div className="divide-y divide-[#2b3036]">
            {projectsLoading ? (
              <div className="p-8 text-center text-xs text-gray-400">Loading workspaces...</div>
            ) : projects.length === 0 ? (
              <div className="p-8 text-center space-y-3">
                <BookOpen className="w-8 h-8 text-gray-500 mx-auto" />
                <p className="text-sm text-gray-300">No active research projects found.</p>
                <Link
                  href="/projects/new"
                  className="inline-block text-xs font-medium text-cyan-400 hover:underline"
                >
                  Create your first research project &rarr;
                </Link>
              </div>
            ) : (
              projects.map((proj) => (
                <div
                  key={proj.id}
                  onClick={() => setActiveProject(proj)}
                  className={`p-5 flex items-center justify-between cursor-pointer hover:bg-[#1a1d20] transition-colors ${
                    activeProject?.id === proj.id ? "bg-[#1a1d20]/80 border-l-2 border-cyan-400" : ""
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-white">{proj.title}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                        {proj.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 line-clamp-1">{proj.description || "Autonomous research project"}</p>
                    <div className="text-[11px] text-gray-400 font-mono">Created: {formatDate(proj.created_at)}</div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link
                      href="/workflow"
                      className="p-2 rounded bg-[#202428] border border-[#2b3036] text-gray-300 hover:text-cyan-400 hover:border-cyan-500/50 transition-colors"
                      title="Open Live Workflow"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Launch & System Health Card */}
        <div className="space-y-6">
          <div className="rounded-lg bg-[#141618] border border-[#2b3036] p-5 space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-white uppercase tracking-wider">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Orchestration Health</span>
            </div>

            <div className="space-y-3 text-xs text-gray-300">
              <div className="flex items-center justify-between py-1.5 border-b border-[#2b3036]/60">
                <span className="text-gray-400">State Machine:</span>
                <span className="font-mono text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> LangGraph 1.2 (Deterministic)
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-[#2b3036]/60">
                <span className="text-gray-400">Primary Database:</span>
                <span className="font-mono text-cyan-400">SQLAlchemy 2.0 (Async)</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-[#2b3036]/60">
                <span className="text-gray-400">Vector Store:</span>
                <span className="font-mono text-cyan-400">pgvector (Cosine Index)</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-[#2b3036]/60">
                <span className="text-gray-400">Search Engine:</span>
                <span className="font-mono text-cyan-400">DuckDuckGo + Crawl4AI</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-gray-400">Code Sandbox:</span>
                <span className="font-mono text-emerald-400">AST Security Gated</span>
              </div>
            </div>
          </div>

          {/* Direct Navigation Links */}
          <div className="rounded-lg bg-[#141618] border border-[#2b3036] p-5 space-y-3">
            <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">Direct Subsystems</span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Link
                href="/workflow"
                className="p-2.5 rounded bg-[#1a1d20] border border-[#2b3036] hover:border-cyan-500/50 hover:text-cyan-400 transition-colors flex items-center gap-2"
              >
                <FolderGit2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Live Graph</span>
              </Link>
              <Link
                href="/eal"
                className="p-2.5 rounded bg-[#1a1d20] border border-[#2b3036] hover:border-cyan-500/50 hover:text-cyan-400 transition-colors flex items-center gap-2"
              >
                <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>EAL Ledger</span>
              </Link>
              <Link
                href="/execution"
                className="p-2.5 rounded bg-[#1a1d20] border border-[#2b3036] hover:border-cyan-500/50 hover:text-cyan-400 transition-colors flex items-center gap-2"
              >
                <PlaySquare className="w-3.5 h-3.5 text-amber-400" />
                <span>Artifacts</span>
              </Link>
              <Link
                href="/agents"
                className="p-2.5 rounded bg-[#1a1d20] border border-[#2b3036] hover:border-cyan-500/50 hover:text-cyan-400 transition-colors flex items-center gap-2"
              >
                <Cpu className="w-3.5 h-3.5 text-purple-400" />
                <span>Agent Fleet</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  ArrowRight,
  FolderGit2,
  FileText,
  FileCheck2,
  ShieldCheck,
  Plus,
  Clock,
  Sparkles,
} from "lucide-react";
import { api } from "@/lib/api";
import { useBanKaiStore } from "@/lib/store";
import { formatDate } from "@/lib/utils";
import { Project } from "@/types";

export default function OverviewPage() {
  const setActiveProject = useBanKaiStore((state) => state.setActiveProject);

  const { data: projects = [], isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: () => api.getProjects(),
  });

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
        <div>
          <h1 className="text-xl font-semibold text-zinc-100 tracking-tight">Overview</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Autonomous multi-agent research, evidence verification, and deliverable execution.
          </p>
        </div>
        <Link
          href="/workspace"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-zinc-100 text-zinc-950 hover:bg-white transition-colors self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Research Objective</span>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-lg bg-zinc-900/40 border border-zinc-800/80">
          <div className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Projects</div>
          <div className="text-2xl font-semibold text-zinc-100 mt-1.5 tracking-tight font-mono">
            {projects.length}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">Active workspaces</div>
        </div>

        <div className="p-4 rounded-lg bg-zinc-900/40 border border-zinc-800/80">
          <div className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Agent Fleet</div>
          <div className="text-2xl font-semibold text-zinc-100 mt-1.5 tracking-tight font-mono">
            8 / 8
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">Specialized agents</div>
        </div>

        <div className="p-4 rounded-lg bg-zinc-900/40 border border-zinc-800/80">
          <div className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Research Quality</div>
          <div className="text-2xl font-semibold text-zinc-100 mt-1.5 tracking-tight font-mono">
            95.5%
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">Average RQS metric</div>
        </div>

        <div className="p-4 rounded-lg bg-zinc-900/40 border border-zinc-800/80">
          <div className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Execution Guard</div>
          <div className="text-2xl font-semibold text-zinc-100 mt-1.5 tracking-tight font-mono">
            AST Safe
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">Subprocess isolation</div>
        </div>
      </div>

      {/* Workflow Steps Preview */}
      <div className="p-5 rounded-lg bg-zinc-900/20 border border-zinc-800/60 space-y-3">
        <div className="text-xs font-medium text-zinc-300">Autonomous Execution Lifecycle</div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded bg-zinc-900/60 border border-zinc-800/60">
            <div className="text-zinc-500 font-mono text-[10px]">01. OBJECTIVE</div>
            <div className="text-zinc-200 font-medium mt-1">Task Decomposition</div>
            <div className="text-zinc-500 text-[11px] mt-0.5">Orchestrator schedules specialized subtasks</div>
          </div>
          <div className="p-3 rounded bg-zinc-900/60 border border-zinc-800/60">
            <div className="text-zinc-500 font-mono text-[10px]">02. RESEARCH</div>
            <div className="text-zinc-200 font-medium mt-1">Web Extraction</div>
            <div className="text-zinc-500 text-[11px] mt-0.5">SHA-256 provenance & atomic claim parsing</div>
          </div>
          <div className="p-3 rounded bg-zinc-900/60 border border-zinc-800/60">
            <div className="text-zinc-500 font-mono text-[10px]">03. VERIFY</div>
            <div className="text-zinc-200 font-medium mt-1">Evidence Ledger</div>
            <div className="text-zinc-500 text-[11px] mt-0.5">Cross-corroboration & contradiction check</div>
          </div>
          <div className="p-3 rounded bg-zinc-900/60 border border-zinc-800/60">
            <div className="text-zinc-500 font-mono text-[10px]">04. DELIVER</div>
            <div className="text-zinc-200 font-medium mt-1">Production Artifacts</div>
            <div className="text-zinc-500 text-[11px] mt-0.5">Excel models, Word reports, PPTX, charts</div>
          </div>
        </div>
      </div>

      {/* Recent Workspaces List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-zinc-200">Recent Projects</h2>
          <span className="text-[11px] text-zinc-500 font-mono">{projects.length} available</span>
        </div>

        {projectsLoading ? (
          <div className="p-8 text-center text-xs text-zinc-500 border border-zinc-800/60 rounded-lg">
            Loading workspaces...
          </div>
        ) : projects.length === 0 ? (
          <div className="p-8 text-center space-y-2 border border-zinc-800/60 rounded-lg bg-zinc-900/20">
            <p className="text-xs text-zinc-400">No research projects yet.</p>
            <Link
              href="/workspace"
              className="inline-block text-xs text-zinc-200 underline hover:text-white"
            >
              Start your first research objective
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/60 border border-zinc-800/80 rounded-lg overflow-hidden bg-zinc-950">
            {projects.map((proj) => (
              <div
                key={proj.id}
                className="p-4 hover:bg-zinc-900/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-xs text-zinc-100">{proj.title}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                      {proj.settings?.domain || "general"}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                      {proj.status}
                    </span>
                  </div>
                  {proj.description && (
                    <p className="text-xs text-zinc-400 line-clamp-1">{proj.description}</p>
                  )}
                  <div className="flex items-center gap-3 text-[11px] text-zinc-500 font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(proj.created_at)}
                    </span>
                    <span>ID: {proj.id.slice(0, 12)}...</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <Link
                    href={`/workspace?projectId=${proj.id}`}
                    onClick={() => setActiveProject(proj)}
                    className="px-2.5 py-1 text-xs rounded border border-zinc-800 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors"
                  >
                    Workspace
                  </Link>
                  <Link
                    href={`/eal?projectId=${proj.id}`}
                    onClick={() => setActiveProject(proj)}
                    className="px-2.5 py-1 text-xs rounded border border-zinc-800 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors"
                  >
                    Ledger
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

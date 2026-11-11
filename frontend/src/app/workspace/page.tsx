"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  Loader2,
  ExternalLink,
  Download,
  FileSpreadsheet,
  FileText,
  Presentation,
  FileCode,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Filter,
} from "lucide-react";
import { api } from "@/lib/api";
import { useBanKaiStore } from "@/lib/store";
import { useSSE } from "@/hooks/useSSE";
import { Artifact, Project, ResearchClaim, ResearchSource } from "@/types";

function WorkspaceContent() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const paramProjectId = searchParams.get("projectId");

  const activeProject = useBanKaiStore((state) => state.activeProject);
  const setActiveProject = useBanKaiStore((state) => state.setActiveProject);
  const liveEvents = useBanKaiStore((state) => state.liveEvents);
  const activeAgent = useBanKaiStore((state) => state.activeAgent);

  const [objectiveInput, setObjectiveInput] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("general");
  const [selectedDepth, setSelectedDepth] = useState("standard");
  const [isDispatching, setIsDispatching] = useState(false);
  const [activeTab, setActiveTab] = useState<"deliverables" | "claims" | "sources">("deliverables");

  // Fetch projects list
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: () => api.getProjects(),
  });

  // Sync active project from URL param or default
  useEffect(() => {
    if (paramProjectId && projects.length > 0) {
      const matched = projects.find((p) => p.id === paramProjectId);
      if (matched && matched.id !== activeProject?.id) {
        setActiveProject(matched);
      }
    } else if (!activeProject && projects.length > 0) {
      setActiveProject(projects[0]);
    }
  }, [paramProjectId, projects, activeProject, setActiveProject]);

  // Connect SSE for active project
  useSSE(activeProject?.id);

  // Fetch claims, sources, and artifacts for active project
  const currentProjId = activeProject?.id;

  const { data: claims = [] } = useQuery<ResearchClaim[]>({
    queryKey: ["claims", currentProjId],
    queryFn: () => (currentProjId ? api.getClaims(currentProjId) : Promise.resolve([])),
    enabled: !!currentProjId,
    refetchInterval: 3000,
  });

  const { data: sources = [] } = useQuery<ResearchSource[]>({
    queryKey: ["sources", currentProjId],
    queryFn: () => (currentProjId ? api.getSources(currentProjId) : Promise.resolve([])),
    enabled: !!currentProjId,
    refetchInterval: 3000,
  });

  const { data: artifacts = [] } = useQuery<Artifact[]>({
    queryKey: ["artifacts", currentProjId],
    queryFn: () => (currentProjId ? api.getArtifacts(currentProjId) : Promise.resolve([])),
    enabled: !!currentProjId,
    refetchInterval: 3000,
  });

  const handleLaunchWorkflow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!objectiveInput.trim()) return;

    setIsDispatching(true);
    try {
      // Create new project for the fresh objective
      const newProj = await api.createProject({
        title: objectiveInput.slice(0, 60),
        description: objectiveInput,
        settings: { domain: selectedDomain, depth: selectedDepth },
      });
      const targetProjectId: string = newProj.id;
      setActiveProject(newProj);
      queryClient.invalidateQueries({ queryKey: ["projects"] });

      // Run workflow
      await api.runWorkflow({
        project_id: targetProjectId,
        objective: objectiveInput,
        domain: selectedDomain,
        depth: selectedDepth,
      });

      setObjectiveInput("");
    } catch (err: any) {
      alert(`Error launching research: ${err.message}`);
    } finally {
      setIsDispatching(false);
    }
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case "xlsx":
        return <FileSpreadsheet className="w-4 h-4 text-emerald-400" />;
      case "docx":
      case "pdf":
        return <FileText className="w-4 h-4 text-blue-400" />;
      case "pptx":
        return <Presentation className="w-4 h-4 text-amber-400" />;
      default:
        return <FileCode className="w-4 h-4 text-zinc-400" />;
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header and Project Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
        <div>
          <h1 className="text-xl font-semibold text-zinc-100 tracking-tight">Workspace</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Define objectives, orchestrate research across 8 agents, and download verified deliverables.
          </p>
        </div>

        {projects.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500 font-mono">Workspace:</span>
            <select
              value={activeProject?.id || ""}
              onChange={(e) => {
                const found = projects.find((p) => p.id === e.target.value);
                if (found) setActiveProject(found);
              }}
              className="px-2.5 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Objective Input Form */}
      <div className="p-5 rounded-lg bg-zinc-900/30 border border-zinc-800/80 space-y-4">
        <form onSubmit={handleLaunchWorkflow} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Research Objective
            </label>
            <textarea
              value={objectiveInput}
              onChange={(e) => setObjectiveInput(e.target.value)}
              placeholder="e.g., What are graph neural networks and their state-of-the-art benchmarks in 2026?"
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-md bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-zinc-800/60">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                <span>Domain:</span>
                <select
                  value={selectedDomain}
                  onChange={(e) => setSelectedDomain(e.target.value)}
                  className="px-2 py-1 rounded bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none"
                >
                  <option value="general">General</option>
                  <option value="technical">Technical</option>
                  <option value="business">Business / Market</option>
                  <option value="finance">Finance</option>
                  <option value="academic">Academic</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                <span>Depth:</span>
                <select
                  value={selectedDepth}
                  onChange={(e) => setSelectedDepth(e.target.value)}
                  className="px-2 py-1 rounded bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none"
                >
                  <option value="standard">Standard (8 Sources)</option>
                  <option value="quick">Quick (4 Sources)</option>
                  <option value="comprehensive">Comprehensive (16 Sources)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isDispatching || !objectiveInput.trim()}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-medium bg-zinc-100 text-zinc-950 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isDispatching ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Orchestrating...</span>
                </>
              ) : (
                <>
                  <Search className="w-3.5 h-3.5" />
                  <span>Start Autonomous Research</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Live Agent Timeline */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
            <h2 className="text-xs font-medium text-zinc-300 uppercase tracking-wider">Agent Activity</h2>
            {activeAgent && (
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-900/60 px-1.5 py-0.5 rounded">
                {activeAgent}
              </span>
            )}
          </div>

          <div className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-800/80 max-h-[480px] overflow-y-auto space-y-3">
            {liveEvents.length === 0 ? (
              <div className="py-12 text-center text-xs text-zinc-500">
                Live agent stream will appear here when an objective is running.
              </div>
            ) : (
              liveEvents.slice(-12).map((ev, idx) => (
                <div key={idx} className="text-xs space-y-1 pb-2 border-b border-zinc-900 last:border-none">
                  <div className="flex items-center justify-between font-mono text-[10px] text-zinc-500">
                    <span className="text-zinc-300 font-medium">{ev.agent_name || "System"}</span>
                    <span>{new Date(ev.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-zinc-400 text-[11px] leading-relaxed">{ev.message}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Tabbed Outputs (Deliverables / Claims / Sources) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Tab Headers */}
          <div className="flex items-center gap-1 pb-2 border-b border-zinc-800/80">
            <button
              onClick={() => setActiveTab("deliverables")}
              className={`px-3 py-1 rounded text-xs transition-colors ${
                activeTab === "deliverables"
                  ? "bg-zinc-800 text-zinc-100 font-medium"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Deliverables ({artifacts.length})
            </button>
            <button
              onClick={() => setActiveTab("claims")}
              className={`px-3 py-1 rounded text-xs transition-colors ${
                activeTab === "claims"
                  ? "bg-zinc-800 text-zinc-100 font-medium"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Verified Claims ({claims.length})
            </button>
            <button
              onClick={() => setActiveTab("sources")}
              className={`px-3 py-1 rounded text-xs transition-colors ${
                activeTab === "sources"
                  ? "bg-zinc-800 text-zinc-100 font-medium"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Sources ({sources.length})
            </button>
          </div>

          {/* Tab 1: Deliverables */}
          {activeTab === "deliverables" && (
            <div className="space-y-3">
              {artifacts.length === 0 ? (
                <div className="p-8 text-center text-xs text-zinc-500 border border-zinc-800/60 rounded-lg bg-zinc-950">
                  No deliverables compiled yet. Run a research objective to generate Excel models, reports, and slide decks.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {artifacts.map((a) => (
                    <div
                      key={a.id}
                      className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-800/80 flex flex-col justify-between space-y-3 hover:border-zinc-700 transition-colors"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="p-2 rounded bg-zinc-900 border border-zinc-800">
                          {getFileIcon(a.file_type)}
                        </div>
                        <div className="space-y-0.5 overflow-hidden">
                          <div className="text-xs font-medium text-zinc-200 truncate" title={a.name}>
                            {a.name}
                          </div>
                          <div className="text-[10px] font-mono text-zinc-500">
                            {a.file_type.toUpperCase()} • {roundBytes(a.file_size_bytes)}
                          </div>
                        </div>
                      </div>

                      <a
                        href={`http://localhost:8000/api/v1/execution/artifacts/${a.id}/download`}
                        download
                        className="inline-flex items-center justify-center gap-1.5 w-full py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-200 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Verified Claims */}
          {activeTab === "claims" && (
            <div className="space-y-3">
              {claims.length === 0 ? (
                <div className="p-8 text-center text-xs text-zinc-500 border border-zinc-800/60 rounded-lg bg-zinc-950">
                  No claims extracted yet.
                </div>
              ) : (
                <div className="divide-y divide-zinc-800/60 border border-zinc-800/80 rounded-lg overflow-hidden bg-zinc-950">
                  {claims.map((c, i) => (
                    <div key={c.id || i} className="p-3.5 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-zinc-500">CLAIM #{i + 1}</span>
                        <span className="text-emerald-400 bg-emerald-950/40 border border-emerald-900/60 px-1.5 py-0.5 rounded">
                          {Math.round((c.confidence_score || 0.85) * 100)}% Confidence
                        </span>
                      </div>
                      <p className="text-xs text-zinc-200 leading-relaxed">{c.claim_text}</p>
                      {c.evidence_excerpt && c.evidence_excerpt !== c.claim_text && (
                        <p className="text-[11px] text-zinc-500 italic">
                          Evidence: &ldquo;{c.evidence_excerpt}&rdquo;
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Sources */}
          {activeTab === "sources" && (
            <div className="space-y-3">
              {sources.length === 0 ? (
                <div className="p-8 text-center text-xs text-zinc-500 border border-zinc-800/60 rounded-lg bg-zinc-950">
                  No sources recorded yet.
                </div>
              ) : (
                <div className="divide-y divide-zinc-800/60 border border-zinc-800/80 rounded-lg overflow-hidden bg-zinc-950">
                  {sources.map((s, i) => (
                    <div key={s.id || i} className="p-3.5 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-zinc-200 truncate max-w-[400px]">
                          {s.title}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-400">
                          Reliability: {Math.round((s.reliability_score || 0.8) * 100)}%
                        </span>
                      </div>
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-zinc-500 hover:text-zinc-300 flex items-center gap-1 font-mono truncate"
                      >
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{s.url}</span>
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function roundBytes(bytes: number): string {
  if (!bytes) return "0 KB";
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export default function WorkspacePage() {
  return (
    <Suspense fallback={<div className="p-8 max-w-7xl mx-auto text-zinc-500 font-mono text-xs">Loading workspace...</div>}>
      <WorkspaceContent />
    </Suspense>
  );
}

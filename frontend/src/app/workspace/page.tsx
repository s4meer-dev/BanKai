"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  Sparkles,
  Loader2,
  CheckCircle2,
  ExternalLink,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  FileText,
} from "lucide-react";
import { api } from "@/lib/api";
import { useBanKaiStore } from "@/lib/store";
import { useSSE } from "@/hooks/useSSE";
import { Project, ResearchClaim, ResearchSource } from "@/types";

export default function WorkspacePage() {
  const queryClient = useQueryClient();
  const activeProject = useBanKaiStore((state) => state.activeProject);
  const setActiveProject = useBanKaiStore((state) => state.setActiveProject);
  const liveEvents = useBanKaiStore((state) => state.liveEvents);
  const activeAgent = useBanKaiStore((state) => state.activeAgent);

  const [objectiveInput, setObjectiveInput] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("general");
  const [selectedDepth, setSelectedDepth] = useState("standard");
  const [isDispatching, setIsDispatching] = useState(false);

  // Connect SSE for active project
  useSSE(activeProject?.id);

  // Fetch projects list
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: () => api.getProjects(),
  });

  // Fetch claims and sources for active project
  const { data: claims = [] } = useQuery<ResearchClaim[]>({
    queryKey: ["claims", activeProject?.id],
    queryFn: () => api.getClaims(activeProject!.id),
    enabled: !!activeProject?.id,
    refetchInterval: 3000,
  });

  const { data: sources = [] } = useQuery<ResearchSource[]>({
    queryKey: ["sources", activeProject?.id],
    queryFn: () => api.getSources(activeProject!.id),
    enabled: !!activeProject?.id,
    refetchInterval: 3000,
  });

  const handleLaunchWorkflow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!objectiveInput.trim()) return;

    setIsDispatching(true);
    try {
      let targetProjectId = activeProject?.id;

      // If no active project, create one first
      if (!targetProjectId) {
        const newProj = await api.createProject({
          title: objectiveInput.slice(0, 50),
          description: objectiveInput,
          settings: { domain: selectedDomain, depth: selectedDepth },
        });
        targetProjectId = newProj.id;
        setActiveProject(newProj);
        queryClient.invalidateQueries({ queryKey: ["projects"] });
      }

      if (!targetProjectId) return;

      // Dispatch LangGraph workflow
      await api.runWorkflow({
        project_id: targetProjectId,
        objective: objectiveInput,
        domain: selectedDomain,
        depth: selectedDepth,
      });

      setObjectiveInput("");
    } catch (err: any) {
      alert(`Error launching workflow: ${err.message}`);
    } finally {
      setIsDispatching(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header and Project Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2b3036] pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Research Workspace</h1>
          <p className="text-sm text-gray-400 mt-1">
            Dispatch autonomous multi-agent research operations with real-time claim extraction and verification.
          </p>
        </div>

        {/* Project Selector Dropdown */}
        <div className="flex items-center gap-3">
          <label className="text-xs text-gray-400 font-mono">WORKSPACE:</label>
          <select
            value={activeProject?.id || ""}
            onChange={(e) => {
              const p = projects.find((x) => x.id === e.target.value);
              if (p) setActiveProject(p);
            }}
            className="px-3 py-1.5 bg-[#141618] border border-[#2b3036] rounded-md text-xs text-gray-200 focus:outline-none focus:border-cyan-400"
          >
            <option value="">Select Existing Project...</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Research Objective Input Prompt */}
      <div className="rounded-xl bg-gradient-to-b from-[#1a1d20] to-[#141618] border border-[#2b3036] p-6 shadow-xl shadow-cyan-500/5">
        <form onSubmit={handleLaunchWorkflow} className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Autonomous Research Dispatcher</span>
          </div>

          <div className="relative">
            <input
              type="text"
              value={objectiveInput}
              onChange={(e) => setObjectiveInput(e.target.value)}
              placeholder="Enter complex research objective (e.g., 'Analyze market trends, technical feasibility, and competitors for an AI SaaS platform in 2026')..."
              className="w-full pl-4 pr-36 py-3.5 bg-[#0c0d0e] border border-[#2b3036] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-sans"
            />
            <button
              type="submit"
              disabled={isDispatching || !objectiveInput.trim()}
              className="absolute right-2 top-2 px-5 py-2 bg-gradient-to-r from-cyan-400 to-emerald-400 text-black font-semibold text-xs rounded-md disabled:opacity-50 hover:opacity-95 transition-all flex items-center gap-1.5 shadow-md shadow-cyan-500/20"
            >
              {isDispatching ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Dispatching...</span>
                </>
              ) : (
                <>
                  <span>Execute Research</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>

          {/* Options: Domain & Depth */}
          <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <span className="font-mono text-gray-400">Domain:</span>
              <div className="flex items-center gap-1 bg-[#0c0d0e] p-1 rounded-md border border-[#2b3036]">
                {["general", "market", "technical", "academic"].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setSelectedDomain(d)}
                    className={`px-2.5 py-1 rounded text-[11px] capitalize transition-colors ${
                      selectedDomain === d ? "bg-[#202428] text-cyan-400 font-semibold" : "text-gray-400 hover:text-gray-200"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono text-gray-400">Depth:</span>
              <div className="flex items-center gap-1 bg-[#0c0d0e] p-1 rounded-md border border-[#2b3036]">
                {["quick", "standard", "deep"].map((dp) => (
                  <button
                    key={dp}
                    type="button"
                    onClick={() => setSelectedDepth(dp)}
                    className={`px-2.5 py-1 rounded text-[11px] capitalize transition-colors ${
                      selectedDepth === dp ? "bg-[#202428] text-emerald-400 font-semibold" : "text-gray-400 hover:text-gray-200"
                    }`}
                  >
                    {dp}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Dual Pane: Live Event Telemetry Stream & Extracted Evidence */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Real-time Telemetry Stream */}
        <div className="rounded-lg bg-[#141618] border border-[#2b3036] overflow-hidden flex flex-col h-[520px]">
          <div className="p-4 border-b border-[#2b3036] flex items-center justify-between bg-[#101214]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-white">Live Event Stream</h2>
            </div>
            <span className="text-[11px] font-mono text-gray-400">{liveEvents.length} Events Logged</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-xs">
            {liveEvents.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-400">
                Awaiting workflow execution events...
              </div>
            ) : (
              liveEvents.map((ev, i) => (
                <div key={ev.event_id || i} className="p-2.5 rounded bg-[#1a1d20] border border-[#2b3036]/60 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-cyan-400 font-bold">[{ev.event_type}]</span>
                    <span className="text-gray-400 text-[10px]">{ev.agent_id || "Orchestrator"}</span>
                  </div>
                  <div className="text-gray-300 text-[11px] break-all">
                    {ev.payload?.claim_text || ev.payload?.title || JSON.stringify(ev.payload)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Live Extracted Claims Feed */}
        <div className="rounded-lg bg-[#141618] border border-[#2b3036] overflow-hidden flex flex-col h-[520px]">
          <div className="p-4 border-b border-[#2b3036] flex items-center justify-between bg-[#101214]">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-white">Verified Research Claims</h2>
            </div>
            <span className="text-[11px] font-mono text-gray-400">{claims.length} Claims</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {claims.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-400 text-xs">
                No claims extracted yet for this workspace. Launch a research objective to start gathering evidence.
              </div>
            ) : (
              claims.map((claim) => (
                <div key={claim.id} className="p-3.5 rounded-lg bg-[#1a1d20] border border-[#2b3036] space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
                        claim.verification_status === "VERIFIED"
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                          : "bg-cyan-950 text-cyan-400 border border-cyan-800"
                      }`}
                    >
                      {claim.verification_status}
                    </span>
                    <span className="text-[11px] font-mono text-gray-400">
                      Confidence: {(claim.confidence_score * 100).toFixed(0)}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-200 leading-relaxed">{claim.claim_text}</p>
                  <div className="text-[10px] text-gray-400 flex items-center gap-1.5 font-mono">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>Evidence Excerpt:</span>
                    <span className="truncate italic max-w-xs">{claim.evidence_excerpt}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

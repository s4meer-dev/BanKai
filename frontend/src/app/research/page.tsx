"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  BookOpenCheck,
  Globe,
  ExternalLink,
  ShieldCheck,
  CheckCircle,
} from "lucide-react";
import { api } from "@/lib/api";
import { useBanKaiStore } from "@/lib/store";
import { Project, ResearchClaim, ResearchSource } from "@/types";

function ResearchIntelligenceContent() {
  const searchParams = useSearchParams();
  const paramProjectId = searchParams.get("projectId");

  const activeProject = useBanKaiStore((state) => state.activeProject);
  const setActiveProject = useBanKaiStore((state) => state.setActiveProject);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Fetch projects list
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: () => api.getProjects(),
  });

  useEffect(() => {
    if (paramProjectId && projects.length > 0) {
      const match = projects.find((p) => p.id === paramProjectId);
      if (match && match.id !== activeProject?.id) {
        setActiveProject(match);
      }
    } else if (!activeProject && projects.length > 0) {
      setActiveProject(projects[0]);
    }
  }, [paramProjectId, projects, activeProject, setActiveProject]);

  const currentProjId = activeProject?.id;

  const { data: claims = [], isLoading: claimsLoading } = useQuery<ResearchClaim[]>({
    queryKey: ["claims", currentProjId],
    queryFn: () => (currentProjId ? api.getClaims(currentProjId) : Promise.resolve([])),
    enabled: !!currentProjId,
  });

  const { data: sources = [], isLoading: sourcesLoading } = useQuery<ResearchSource[]>({
    queryKey: ["sources", currentProjId],
    queryFn: () => (currentProjId ? api.getSources(currentProjId) : Promise.resolve([])),
    enabled: !!currentProjId,
  });

  const filteredClaims = claims.filter((c) => {
    if (statusFilter === "ALL") return true;
    return c.verification_status === statusFilter;
  });

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
        <div>
          <h1 className="text-xl font-semibold text-zinc-100 tracking-tight">Sources & Verified Claims</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Empirical claim extraction, source reliability ratings, citation provenance, and contradiction detection.
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
              className="px-2.5 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 focus:outline-none"
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

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5">
        {["ALL", "VERIFIED", "PARTIALLY_VERIFIED", "DISPUTED", "UNVERIFIED"].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1 rounded text-xs transition-colors ${
              statusFilter === st
                ? "bg-zinc-800 text-zinc-100 font-medium"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/60"
            }`}
          >
            {st.replace("_", " ")}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Claims */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-medium text-zinc-300 uppercase tracking-wider">
              Claims ({filteredClaims.length})
            </h2>
          </div>

          {claimsLoading ? (
            <div className="p-8 text-center text-xs text-zinc-500 border border-zinc-800/60 rounded-lg">
              Loading claims...
            </div>
          ) : filteredClaims.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-500 border border-zinc-800/60 rounded-lg bg-zinc-950">
              No claims match the selected filter.
            </div>
          ) : (
            <div className="divide-y divide-zinc-800/60 border border-zinc-800/80 rounded-lg overflow-hidden bg-zinc-950">
              {filteredClaims.map((c, i) => (
                <div key={c.id || i} className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-zinc-500">CLAIM #{i + 1}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded font-medium ${
                        c.verification_status === "VERIFIED"
                          ? "text-emerald-400 bg-emerald-950/40 border border-emerald-900/60"
                          : c.verification_status === "DISPUTED"
                          ? "text-red-400 bg-red-950/40 border border-red-900/60"
                          : "text-zinc-400 bg-zinc-900 border border-zinc-800"
                      }`}
                    >
                      {c.verification_status} • {Math.round((c.confidence_score || 0.8) * 100)}%
                    </span>
                  </div>
                  <p className="text-xs text-zinc-200 leading-relaxed">{c.claim_text}</p>
                  {c.evidence_excerpt && (
                    <p className="text-[11px] text-zinc-500 italic">
                      &ldquo;{c.evidence_excerpt}&rdquo;
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: Sources */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-medium text-zinc-300 uppercase tracking-wider">
              Web Sources ({sources.length})
            </h2>
          </div>

          {sourcesLoading ? (
            <div className="p-8 text-center text-xs text-zinc-500 border border-zinc-800/60 rounded-lg">
              Loading sources...
            </div>
          ) : sources.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-500 border border-zinc-800/60 rounded-lg bg-zinc-950">
              No sources recorded yet.
            </div>
          ) : (
            <div className="space-y-2.5">
              {sources.map((s) => (
                <div
                  key={s.id}
                  className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-800/80 space-y-1.5"
                >
                  <div className="text-xs font-medium text-zinc-200">{s.title}</div>
                  <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                    <span>{s.publisher || "Web Source"}</span>
                    <span>Reliability: {Math.round((s.reliability_score || 0.8) * 100)}%</span>
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
      </div>
    </div>
  );
}

export default function ResearchIntelligencePage() {
  return (
    <Suspense fallback={<div className="p-8 max-w-7xl mx-auto text-zinc-500 font-mono text-xs">Loading research intelligence...</div>}>
      <ResearchIntelligenceContent />
    </Suspense>
  );
}

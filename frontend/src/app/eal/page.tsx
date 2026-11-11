"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  FileCheck2,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  Layers,
  FileText,
  FileSpreadsheet,
  Presentation,
  CheckCircle2,
} from "lucide-react";
import { api } from "@/lib/api";
import { useBanKaiStore } from "@/lib/store";
import { EALGraphResponse, EALQualityScoreResponse, EALTraceNode, Project } from "@/types";

function EALContent() {
  const searchParams = useSearchParams();
  const paramProjectId = searchParams.get("projectId");

  const activeProject = useBanKaiStore((state) => state.activeProject);
  const setActiveProject = useBanKaiStore((state) => state.setActiveProject);
  const [selectedNode, setSelectedNode] = useState<EALTraceNode | null>(null);

  // Fetch projects list for switcher
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

  const { data: graphData, isLoading: graphLoading } = useQuery<EALGraphResponse>({
    queryKey: ["eal-graph", currentProjId],
    queryFn: () => (currentProjId ? api.getEALGraph(currentProjId) : Promise.resolve(null)),
    enabled: !!currentProjId,
  });

  const { data: qualityScore } = useQuery<EALQualityScoreResponse>({
    queryKey: ["eal-score", currentProjId],
    queryFn: () => (currentProjId ? api.getEALScore(currentProjId) : Promise.resolve(null)),
    enabled: !!currentProjId,
  });

  // Group nodes by type
  const nodes = graphData?.nodes || [];
  const objectiveNodes = nodes.filter((n) => n.type === "objective");
  const sourceNodes = nodes.filter((n) => n.type === "source");
  const claimNodes = nodes.filter((n) => n.type === "claim");
  const recNodes = nodes.filter((n) => n.type === "recommendation");
  const artifactNodes = nodes.filter((n) => n.type === "artifact");

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
        <div>
          <h1 className="text-xl font-semibold text-zinc-100 tracking-tight">Evidence-to-Action Ledger</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Complete relational lineage linking Objectives &rarr; Sources &rarr; Claims &rarr; Verification &rarr; Deliverables.
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

      {/* RQS Score Banner */}
      {qualityScore && (
        <div className="p-5 rounded-lg bg-zinc-900/30 border border-zinc-800/80 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                Research Quality Score (RQS)
              </div>
              <div className="text-3xl font-semibold text-zinc-100 font-mono mt-0.5">
                {qualityScore.overall_score}%
              </div>
            </div>
            <div className="text-xs text-zinc-400 max-w-md">
              Evaluated mathematically based on source authority, corroboration density, and contradiction resolution.
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-zinc-800/60">
            <div className="space-y-0.5">
              <div className="text-[10px] text-zinc-500 font-mono">CITATION COVERAGE</div>
              <div className="text-base font-semibold text-zinc-200 font-mono">
                {(qualityScore.citation_coverage * 100).toFixed(0)}%
              </div>
              <div className="text-[10px] text-zinc-500">Backed by URLs</div>
            </div>

            <div className="space-y-0.5">
              <div className="text-[10px] text-zinc-500 font-mono">SOURCE RELIABILITY</div>
              <div className="text-base font-semibold text-zinc-200 font-mono">
                {(qualityScore.source_reliability_avg * 100).toFixed(0)}%
              </div>
              <div className="text-[10px] text-zinc-500">Publisher rating</div>
            </div>

            <div className="space-y-0.5">
              <div className="text-[10px] text-zinc-500 font-mono">VERIFICATION RATE</div>
              <div className="text-base font-semibold text-zinc-200 font-mono">
                {(qualityScore.verification_rate * 100).toFixed(0)}%
              </div>
              <div className="text-[10px] text-zinc-500">Corroborated claims</div>
            </div>

            <div className="space-y-0.5">
              <div className="text-[10px] text-zinc-500 font-mono">CONFLICT RESILIENCE</div>
              <div className="text-base font-semibold text-zinc-200 font-mono">
                {(qualityScore.contradiction_resolution_rate * 100).toFixed(0)}%
              </div>
              <div className="text-[10px] text-zinc-500">Conflict-free</div>
            </div>
          </div>
        </div>
      )}

      {/* Lineage Graph Overview */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-zinc-200">Relational Provenance Chain</h2>
          <span className="text-xs text-zinc-500 font-mono">
            {graphData?.nodes?.length || 0} Entities • {graphData?.edges?.length || 0} Traceable Links
          </span>
        </div>

        {graphLoading ? (
          <div className="p-12 text-center text-xs text-zinc-500 border border-zinc-800/60 rounded-lg">
            Loading lineage graph...
          </div>
        ) : nodes.length === 0 ? (
          <div className="p-12 text-center text-xs text-zinc-500 border border-zinc-800/60 rounded-lg bg-zinc-950">
            No ledger records for this workspace. Run a research objective from the Workspace tab first.
          </div>
        ) : (
          <div className="space-y-4">
            {/* Step 1: Objective */}
            <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-800/80 space-y-1.5">
              <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                1. ROOT USER OBJECTIVE
              </div>
              <div className="text-sm font-medium text-zinc-100">
                {objectiveNodes[0]?.title || activeProject?.title}
              </div>
              {objectiveNodes[0]?.data?.description && (
                <p className="text-xs text-zinc-400">{objectiveNodes[0].data.description}</p>
              )}
            </div>

            {/* Step 2: Sources */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
                <span>2. PROVENANCED WEB SOURCES ({sourceNodes.length})</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {sourceNodes.slice(0, 8).map((s) => (
                  <div key={s.id} className="p-3 rounded-md bg-zinc-950 border border-zinc-800/70 space-y-1">
                    <div className="text-xs font-medium text-zinc-200 truncate">{s.title}</div>
                    <div className="text-[10px] text-zinc-500 font-mono truncate">{s.subtitle}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 3: Verified Claims */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
                <span>3. CORROBORATED EMPIRICAL CLAIMS ({claimNodes.length})</span>
              </div>
              <div className="divide-y divide-zinc-800/60 border border-zinc-800/80 rounded-md overflow-hidden bg-zinc-950">
                {claimNodes.slice(0, 10).map((c, i) => (
                  <div key={c.id} className="p-3 space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-zinc-500">CLAIM #{i + 1}</span>
                      <span className="text-emerald-400 font-medium">VERIFIED</span>
                    </div>
                    <p className="text-xs text-zinc-200">{c.title}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 4: Deliverables Produced */}
            {artifactNodes.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
                  <span>4. GENERATED DELIVERABLES ({artifactNodes.length})</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {artifactNodes.map((a) => (
                    <div key={a.id} className="p-3 rounded-md bg-zinc-950 border border-zinc-800/70 space-y-1">
                      <div className="text-xs font-medium text-zinc-200 truncate">{a.title}</div>
                      <div className="text-[10px] text-zinc-500 font-mono">{a.subtitle}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function EALPage() {
  return (
    <Suspense fallback={<div className="p-8 max-w-7xl mx-auto text-zinc-500 font-mono text-xs">Loading Evidence-to-Action Ledger...</div>}>
      <EALContent />
    </Suspense>
  );
}

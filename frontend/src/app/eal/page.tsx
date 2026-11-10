"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FileCheck2,
  ShieldCheck,
  GitBranch,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Layers,
  Sparkles,
} from "lucide-react";
import { api } from "@/lib/api";
import { useBanKaiStore } from "@/lib/store";
import { EALGraphResponse, EALQualityScoreResponse, EALTraceNode } from "@/types";

export default function EALPage() {
  const activeProject = useBanKaiStore((state) => state.activeProject);
  const [selectedNode, setSelectedNode] = useState<EALTraceNode | null>(null);

  const { data: graphData, isLoading: graphLoading } = useQuery<EALGraphResponse>({
    queryKey: ["eal-graph", activeProject?.id],
    queryFn: () => api.getEALGraph(activeProject!.id),
    enabled: !!activeProject?.id,
  });

  const { data: qualityScore } = useQuery<EALQualityScoreResponse>({
    queryKey: ["eal-score", activeProject?.id],
    queryFn: () => api.getEALScore(activeProject!.id),
    enabled: !!activeProject?.id,
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2b3036] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
              SIGNATURE CAPABILITY
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-white">Evidence-to-Action Ledger (EAL)</h1>
          </div>
          <p className="text-sm text-gray-400 mt-1">
            Complete mathematical and relational lineage from User Objective &rarr; Claims &rarr; Verification &rarr; Strategy &rarr; Execution.
          </p>
        </div>

        {qualityScore && (
          <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-[#141618] border border-[#2b3036]">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <div className="text-[10px] text-gray-400 font-mono">RESEARCH QUALITY SCORE</div>
              <div className="text-lg font-bold font-mono text-white">{qualityScore.overall_score}%</div>
            </div>
          </div>
        )}
      </div>

      {/* Quality Score Radar Metrics */}
      {qualityScore && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-[#141618] border border-[#2b3036] space-y-1">
            <div className="text-xs text-gray-400 font-mono">CITATION COVERAGE</div>
            <div className="text-xl font-bold text-white font-mono">
              {(qualityScore.citation_coverage * 100).toFixed(0)}%
            </div>
            <div className="text-[10px] text-gray-500">Claims with primary source URLs</div>
          </div>

          <div className="p-4 rounded-lg bg-[#141618] border border-[#2b3036] space-y-1">
            <div className="text-xs text-gray-400 font-mono">SOURCE RELIABILITY</div>
            <div className="text-xl font-bold text-white font-mono">
              {(qualityScore.source_reliability_avg * 100).toFixed(0)}%
            </div>
            <div className="text-[10px] text-gray-500">Mean publisher reputation index</div>
          </div>

          <div className="p-4 rounded-lg bg-[#141618] border border-[#2b3036] space-y-1">
            <div className="text-xs text-gray-400 font-mono">VERIFICATION RATE</div>
            <div className="text-xl font-bold text-white font-mono">
              {(qualityScore.verification_rate * 100).toFixed(0)}%
            </div>
            <div className="text-[10px] text-gray-500">Corroborated by independent evidence</div>
          </div>

          <div className="p-4 rounded-lg bg-[#141618] border border-[#2b3036] space-y-1">
            <div className="text-xs text-gray-400 font-mono">CONTRADICTION RESOLUTION</div>
            <div className="text-xl font-bold text-white font-mono">
              {(qualityScore.contradiction_resolution_rate * 100).toFixed(0)}%
            </div>
            <div className="text-[10px] text-gray-500">Absence of conflicting assertions</div>
          </div>
        </div>
      )}

      {/* Lineage Node Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graph Nodes List grouped by entity type */}
        <div className="lg:col-span-2 rounded-lg bg-[#141618] border border-[#2b3036] overflow-hidden flex flex-col">
          <div className="p-4 border-b border-[#2b3036] flex items-center justify-between bg-[#101214]">
            <div className="flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-cyan-400" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-white">Lineage Chain Nodes</h2>
            </div>
            <span className="text-[11px] font-mono text-gray-400">{graphData?.nodes.length || 0} Entities</span>
          </div>

          <div className="divide-y divide-[#2b3036] overflow-y-auto max-h-[600px]">
            {graphLoading ? (
              <div className="p-8 text-center text-xs text-gray-400">Traversing ledger lineage...</div>
            ) : !graphData || graphData.nodes.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400">
                No ledger records registered for this workspace yet. Execute a workflow to populate the EAL graph.
              </div>
            ) : (
              graphData.nodes.map((node) => (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className={`p-4 flex items-center justify-between cursor-pointer hover:bg-[#1a1d20] transition-colors ${
                    selectedNode?.id === node.id ? "bg-[#1a1d20] border-l-2 border-cyan-400" : ""
                  }`}
                >
                  <div className="space-y-1 max-w-[80%]">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#202428] text-gray-300 border border-[#2b3036]">
                        {node.type}
                      </span>
                      <span className="font-semibold text-xs text-white truncate">{node.title}</span>
                    </div>
                    {node.subtitle && <p className="text-[11px] text-gray-400 truncate">{node.subtitle}</p>}
                  </div>

                  <ArrowRight className="w-4 h-4 text-gray-500" />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Node Inspection Inspector Drawer */}
        <div className="rounded-lg bg-[#141618] border border-[#2b3036] p-5 space-y-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Entity Inspector</span>
          </div>

          {selectedNode ? (
            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-gray-400 uppercase">Entity Title</span>
                <div className="font-semibold text-white">{selectedNode.title}</div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-mono text-gray-400 uppercase">Type & Subtitle</span>
                <div className="text-gray-300">{selectedNode.subtitle || selectedNode.type}</div>
              </div>

              {selectedNode.status && (
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-gray-400 uppercase">Verified State</span>
                  <div className="font-mono text-emerald-400 font-bold">{selectedNode.status}</div>
                </div>
              )}

              <div className="space-y-1">
                <span className="text-[10px] font-mono text-gray-400 uppercase">Audit Metadata</span>
                <pre className="p-3 rounded bg-[#0c0d0e] border border-[#2b3036] font-mono text-[11px] text-gray-300 overflow-x-auto max-h-60">
                  {JSON.stringify(selectedNode.data, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div className="text-center text-xs text-gray-400 py-12">
              Select any node from the lineage chain on the left to inspect its cryptographic provenance and evidence link.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


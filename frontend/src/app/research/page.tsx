"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BookOpenCheck,
  Globe,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  Filter,
  CheckCircle,
} from "lucide-react";
import { api } from "@/lib/api";
import { useBanKaiStore } from "@/lib/store";
import { ResearchClaim, ResearchSource } from "@/types";

export default function ResearchIntelligencePage() {
  const activeProject = useBanKaiStore((state) => state.activeProject);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const { data: claims = [], isLoading: claimsLoading } = useQuery<ResearchClaim[]>({
    queryKey: ["claims", activeProject?.id],
    queryFn: () => api.getClaims(activeProject!.id),
    enabled: !!activeProject?.id,
  });

  const { data: sources = [], isLoading: sourcesLoading } = useQuery<ResearchSource[]>({
    queryKey: ["sources", activeProject?.id],
    queryFn: () => api.getSources(activeProject!.id),
    enabled: !!activeProject?.id,
  });

  const filteredClaims = claims.filter((c) => {
    if (statusFilter === "ALL") return true;
    return c.verification_status === statusFilter;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2b3036] pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Research Intelligence & Evidence</h1>
          <p className="text-sm text-gray-400 mt-1">
            Empirical claim extraction, source reliability ratings, citation provenance, and contradiction detection.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {["ALL", "VERIFIED", "PARTIALLY_VERIFIED", "DISPUTED", "UNVERIFIED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-md text-xs font-mono transition-colors ${
                statusFilter === st
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50"
                  : "bg-[#141618] text-gray-400 border border-[#2b3036] hover:bg-[#1a1d20]"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Grid: Claims & Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Claims Table */}
        <div className="lg:col-span-2 rounded-lg bg-[#141618] border border-[#2b3036] overflow-hidden flex flex-col">
          <div className="p-4 border-b border-[#2b3036] flex items-center justify-between bg-[#101214]">
            <div className="flex items-center gap-2">
              <BookOpenCheck className="w-4 h-4 text-cyan-400" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-white">Extracted Claims & Evidence</h2>
            </div>
            <span className="text-[11px] font-mono text-gray-400">{filteredClaims.length} Claims Listed</span>
          </div>

          <div className="divide-y divide-[#2b3036] overflow-y-auto max-h-[600px]">
            {claimsLoading ? (
              <div className="p-8 text-center text-xs text-gray-400">Loading claims...</div>
            ) : filteredClaims.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400">
                No research claims recorded. Launch an objective in the Research Workspace to populate claims.
              </div>
            ) : (
              filteredClaims.map((claim) => (
                <div key={claim.id} className="p-4 space-y-2 hover:bg-[#181a1d] transition-colors">
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        claim.verification_status === "VERIFIED"
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                          : claim.verification_status === "DISPUTED"
                          ? "bg-red-950 text-red-400 border border-red-800"
                          : "bg-cyan-950 text-cyan-400 border border-cyan-800"
                      }`}
                    >
                      {claim.verification_status}
                    </span>
                    <span className="text-[11px] font-mono text-gray-400">
                      Confidence: {(claim.confidence_score * 100).toFixed(0)}%
                    </span>
                  </div>

                  <p className="text-xs text-gray-200 leading-relaxed font-sans">{claim.claim_text}</p>

                  <div className="p-2.5 rounded bg-[#1a1d20] border border-[#2b3036]/60 text-[11px] text-gray-300 font-mono space-y-1">
                    <div className="text-[10px] text-gray-400 uppercase">Evidence Excerpt:</div>
                    <div className="italic text-gray-300">&ldquo;{claim.evidence_excerpt}&rdquo;</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sources List */}
        <div className="rounded-lg bg-[#141618] border border-[#2b3036] overflow-hidden flex flex-col">
          <div className="p-4 border-b border-[#2b3036] flex items-center justify-between bg-[#101214]">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-400" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-white">Primary Web Sources</h2>
            </div>
            <span className="text-[11px] font-mono text-gray-400">{sources.length} Sources</span>
          </div>

          <div className="divide-y divide-[#2b3036] overflow-y-auto max-h-[600px]">
            {sourcesLoading ? (
              <div className="p-8 text-center text-xs text-gray-400">Loading sources...</div>
            ) : sources.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400">No primary sources registered yet.</div>
            ) : (
              sources.map((src) => (
                <div key={src.id} className="p-4 space-y-2 hover:bg-[#181a1d] transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-white truncate max-w-[200px]">{src.title}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-emerald-400 bg-emerald-950 border border-emerald-800">
                      {(src.reliability_score * 100).toFixed(0)}% Rel.
                    </span>
                  </div>

                  <p className="text-[11px] text-gray-400 line-clamp-2">{src.summary}</p>

                  <div className="pt-1 flex items-center justify-between text-[10px] font-mono text-gray-500">
                    <span className="truncate max-w-[180px]">{src.publisher || "Web Source"}</span>
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:underline flex items-center gap-1"
                    >
                      Visit <ExternalLink className="w-3 h-3" />
                    </a>
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

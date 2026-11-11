"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Database,
  Search,
  Plus,
  Trash2,
  Clock,
  Loader2,
} from "lucide-react";
import { api } from "@/lib/api";
import { useBanKaiStore } from "@/lib/store";
import { MemoryItem, Project } from "@/types";

function MemoryCenterContent() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const paramProjectId = searchParams.get("projectId");

  const activeProject = useBanKaiStore((state) => state.activeProject);
  const setActiveProject = useBanKaiStore((state) => state.setActiveProject);

  const [activeTier, setActiveTier] = useState<string>("ALL");
  const [semanticQuery, setSemanticQuery] = useState("");
  const [searchResults, setSearchResults] = useState<MemoryItem[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // New Memory Form State
  const [newKey, setNewKey] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newTier, setNewTier] = useState("knowledge");
  const [isAdding, setIsAdding] = useState(false);

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

  const { data: memories = [], isLoading: memoriesLoading } = useQuery<MemoryItem[]>({
    queryKey: ["memories", currentProjId],
    queryFn: () => api.getMemories(currentProjId),
  });

  const handleSemanticSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!semanticQuery.trim()) {
      setSearchResults(null);
      return;
    }
    setIsSearching(true);
    try {
      const res = await api.queryMemory(semanticQuery, currentProjId);
      setSearchResults(res);
    } catch (err: any) {
      alert(`Search error: ${err.message}`);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCreateMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim() || !newContent.trim()) return;
    try {
      await api.createMemory({
        key: newKey,
        content: newContent,
        tier: newTier,
        project_id: currentProjId,
        metadata_json: { created_via: "web_ui" },
      });
      setNewKey("");
      setNewContent("");
      setIsAdding(false);
      queryClient.invalidateQueries({ queryKey: ["memories", currentProjId] });
    } catch (err: any) {
      alert(`Error storing memory: ${err.message}`);
    }
  };

  const displayMemories = searchResults || memories;
  const filteredMemories = displayMemories.filter((m) => {
    if (activeTier === "ALL") return true;
    return m.tier.toLowerCase() === activeTier.toLowerCase();
  });

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
        <div>
          <h1 className="text-xl font-semibold text-zinc-100 tracking-tight">Memory Engine</h1>
          <p className="text-xs text-zinc-400 mt-1">
            4-tier persistent semantic memory (Session, Project, User, Knowledge) with pgvector retrieval.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-zinc-100 text-zinc-950 hover:bg-white transition-colors self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{isAdding ? "Cancel" : "Store Memory"}</span>
        </button>
      </div>

      {/* New Memory Drawer */}
      {isAdding && (
        <form onSubmit={handleCreateMemory} className="p-4 rounded-lg bg-zinc-900/40 border border-zinc-800/80 space-y-3">
          <div className="text-xs font-medium text-zinc-200">Store Persistent Fact or Insight</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Memory Key (e.g. rust_wasm_edge_latency)"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              className="px-3 py-1.5 rounded bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none"
            />
            <select
              value={newTier}
              onChange={(e) => setNewTier(e.target.value)}
              className="px-3 py-1.5 rounded bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none"
            >
              <option value="knowledge">Knowledge Tier</option>
              <option value="project">Project Tier</option>
              <option value="session">Session Tier</option>
              <option value="user">User Tier</option>
            </select>
            <button
              type="submit"
              className="px-3 py-1.5 rounded bg-zinc-100 text-zinc-950 hover:bg-white text-xs font-medium transition-colors"
            >
              Save Fact
            </button>
          </div>
          <textarea
            placeholder="Fact content or empirical finding to embed into semantic vector space..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 rounded bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none"
          />
        </form>
      )}

      {/* Semantic Search Bar */}
      <form onSubmit={handleSemanticSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Semantic vector query across stored findings..."
            value={semanticQuery}
            onChange={(e) => setSemanticQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-md bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700"
          />
        </div>
        <button
          type="submit"
          disabled={isSearching}
          className="px-4 py-2 rounded-md bg-zinc-100 text-zinc-950 hover:bg-white text-xs font-medium disabled:opacity-50 transition-colors"
        >
          {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Search Vectors"}
        </button>
      </form>

      {/* Tier Filter Tabs */}
      <div className="flex items-center gap-1.5 pb-2 border-b border-zinc-800/80">
        {["ALL", "KNOWLEDGE", "PROJECT", "SESSION", "USER"].map((t) => (
          <button
            key={t}
            onClick={() => setActiveTier(t)}
            className={`px-3 py-1 rounded text-xs transition-colors ${
              activeTier === t
                ? "bg-zinc-800 text-zinc-100 font-medium"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Memory Cards */}
      <div className="space-y-3">
        {memoriesLoading ? (
          <div className="p-8 text-center text-xs text-zinc-500 border border-zinc-800/60 rounded-lg">
            Loading memory items...
          </div>
        ) : filteredMemories.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-500 border border-zinc-800/60 rounded-lg bg-zinc-950">
            No memories stored in this tier yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredMemories.map((m) => (
              <div
                key={m.id}
                className="p-4 rounded-lg bg-zinc-950 border border-zinc-800/80 space-y-2 hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-zinc-400 font-medium">{m.key}</span>
                  <span className="text-zinc-500 uppercase px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800">
                    {m.tier}
                  </span>
                </div>
                <p className="text-xs text-zinc-200 leading-relaxed">{m.content}</p>
                {m.relevance_score !== undefined && (
                  <div className="text-[10px] text-zinc-500 font-mono pt-1 border-t border-zinc-900">
                    Relevance Score: {Math.round(m.relevance_score * 100)}%
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function MemoryCenterPage() {
  return (
    <Suspense fallback={<div className="p-8 max-w-7xl mx-auto text-zinc-500 font-mono text-xs">Loading memory ledger...</div>}>
      <MemoryCenterContent />
    </Suspense>
  );
}

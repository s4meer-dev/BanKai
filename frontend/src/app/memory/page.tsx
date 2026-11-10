"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Database,
  Search,
  Plus,
  Trash2,
  Sparkles,
  Layers,
  Clock,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { api } from "@/lib/api";
import { useBanKaiStore } from "@/lib/store";
import { MemoryItem } from "@/types";

export default function MemoryCenterPage() {
  const queryClient = useQueryClient();
  const activeProject = useBanKaiStore((state) => state.activeProject);

  const [activeTier, setActiveTier] = useState<string>("ALL");
  const [semanticQuery, setSemanticQuery] = useState("");
  const [searchResults, setSearchResults] = useState<MemoryItem[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // New Memory Modal State
  const [newKey, setNewKey] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newTier, setNewTier] = useState("knowledge");
  const [isAdding, setIsAdding] = useState(false);

  const { data: memories = [], isLoading: memoriesLoading } = useQuery<MemoryItem[]>({
    queryKey: ["memories", activeProject?.id],
    queryFn: () => api.getMemories(activeProject?.id),
  });

  const handleSemanticSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!semanticQuery.trim()) {
      setSearchResults(null);
      return;
    }
    setIsSearching(true);
    try {
      const res = await api.queryMemory(semanticQuery, activeProject?.id);
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
        project_id: activeProject?.id,
        relevance_score: 1.0,
      });
      setNewKey("");
      setNewContent("");
      setIsAdding(false);
      queryClient.invalidateQueries({ queryKey: ["memories"] });
    } catch (err: any) {
      alert(`Error storing memory: ${err.message}`);
    }
  };

  const handleDeleteMemory = async (id: string) => {
    try {
      await api.deleteMemory(id);
      queryClient.invalidateQueries({ queryKey: ["memories"] });
    } catch (err: any) {
      alert(`Error deleting memory: ${err.message}`);
    }
  };

  const displayedMemories = searchResults !== null ? searchResults : memories.filter((m) => {
    if (activeTier === "ALL") return true;
    return m.tier === activeTier;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2b3036] pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Persistent Memory Center</h1>
          <p className="text-sm text-gray-400 mt-1">
            4-tier persistent knowledge base with pgvector semantic similarity search and relevance thresholding.
          </p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 bg-gradient-to-r from-cyan-400 to-emerald-400 text-black font-semibold text-xs rounded-md shadow-md shadow-cyan-500/10 flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add Explicit Memory</span>
        </button>
      </div>

      {/* Semantic Search Bar */}
      <div className="rounded-xl bg-[#141618] border border-[#2b3036] p-4">
        <form onSubmit={handleSemanticSearch} className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={semanticQuery}
              onChange={(e) => setSemanticQuery(e.target.value)}
              placeholder="Search persistent knowledge semantically using pgvector cosine similarity..."
              className="w-full pl-10 pr-4 py-2 bg-[#0c0d0e] border border-[#2b3036] rounded-md text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="px-4 py-2 bg-[#202428] border border-[#2b3036] hover:border-cyan-500/50 text-xs font-semibold text-white rounded-md flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isSearching ? "Searching..." : "Vector Search"}</span>
          </button>
          {searchResults !== null && (
            <button
              type="button"
              onClick={() => {
                setSearchResults(null);
                setSemanticQuery("");
              }}
              className="px-3 py-2 text-xs text-gray-400 hover:text-white"
            >
              Reset
            </button>
          )}
        </form>
      </div>

      {/* Add Memory Form Accordion */}
      {isAdding && (
        <form onSubmit={handleCreateMemory} className="p-5 rounded-lg bg-[#141618] border border-[#2b3036] space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-white font-mono">Store Explicit Memory Item</span>
            <span className="text-[10px] text-gray-500 font-mono">Automatic deduplication applied</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              required
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              placeholder="Memory Key / Identifier (e.g. strategic_constraint_2026)"
              className="px-3 py-2 bg-[#0c0d0e] border border-[#2b3036] rounded-md text-xs text-white focus:outline-none focus:border-cyan-400"
            />
            <select
              value={newTier}
              onChange={(e) => setNewTier(e.target.value)}
              className="px-3 py-2 bg-[#0c0d0e] border border-[#2b3036] rounded-md text-xs text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="knowledge">Knowledge Tier (Global Semantic Search)</option>
              <option value="project">Project Tier (Workspace Bound)</option>
              <option value="user">User Preferences Tier</option>
              <option value="session">Session Tier</option>
            </select>
          </div>

          <textarea
            required
            rows={3}
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="Verified memory facts, constraints, user preferences, or conclusions..."
            className="w-full px-3 py-2 bg-[#0c0d0e] border border-[#2b3036] rounded-md text-xs text-white focus:outline-none focus:border-cyan-400"
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 text-xs text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-cyan-400 text-black font-semibold text-xs rounded-md shadow-md"
            >
              Save Memory
            </button>
          </div>
        </form>
      )}

      {/* Tier Switcher Filters */}
      <div className="flex items-center gap-2 border-b border-[#2b3036] pb-3">
        {["ALL", "knowledge", "project", "user", "session"].map((tier) => (
          <button
            key={tier}
            onClick={() => setActiveTier(tier)}
            className={`px-3 py-1 rounded-md text-xs font-mono uppercase transition-colors ${
              activeTier === tier
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {tier}
          </button>
        ))}
      </div>

      {/* Memory Items Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {memoriesLoading ? (
          <div className="col-span-3 p-8 text-center text-xs text-gray-400">Loading persistent memory...</div>
        ) : displayedMemories.length === 0 ? (
          <div className="col-span-3 p-8 text-center text-xs text-gray-400">
            No memories match the current filter.
          </div>
        ) : (
          displayedMemories.map((mem) => (
            <div
              key={mem.id}
              className="p-4 rounded-lg bg-[#141618] border border-[#2b3036] flex flex-col justify-between space-y-3 hover:border-gray-500 transition-colors"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#202428] text-cyan-400 border border-[#2b3036]">
                    {mem.tier}
                  </span>
                  {mem.similarity !== undefined && (
                    <span className="text-[10px] font-mono text-emerald-400">
                      Sim: {(mem.similarity * 100).toFixed(1)}%
                    </span>
                  )}
                </div>
                <div className="font-semibold text-xs text-white">{mem.key}</div>
                <p className="text-xs text-gray-300 leading-relaxed font-sans">{mem.content}</p>
              </div>

              <div className="pt-2 border-t border-[#2b3036]/60 flex items-center justify-between text-[10px] text-gray-500 font-mono">
                <span>Rel: {mem.relevance_score * 100}%</span>
                <button
                  onClick={() => handleDeleteMemory(mem.id)}
                  className="text-gray-500 hover:text-red-400 transition-colors"
                  title="Delete Memory"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

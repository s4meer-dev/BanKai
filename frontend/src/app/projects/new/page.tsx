"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { PlusCircle, Sparkles, ArrowRight, ShieldCheck, Cpu } from "lucide-react";
import { api } from "@/lib/api";
import { useBanKaiStore } from "@/lib/store";

export default function NewProjectPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setActiveProject = useBanKaiStore((state) => state.setActiveProject);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [domain, setDomain] = useState("general");
  const [depth, setDepth] = useState("standard");
  const [autoApproveLowRisk, setAutoApproveLowRisk] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const project = await api.createProject({
        title,
        description,
        settings: {
          domain,
          depth,
          auto_approve_low_risk: autoApproveLowRisk,
        },
      });

      setActiveProject(project);
      queryClient.invalidateQueries({ queryKey: ["projects"] });

      // Trigger initial orchestration workflow
      await api.runWorkflow({
        project_id: project.id,
        objective: description || title,
        domain,
        depth,
      });

      router.push("/workflow");
    } catch (err: any) {
      alert(`Error creating project: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div className="border-b border-[#2b3036] pb-6">
        <h1 className="text-2xl font-bold tracking-tight text-white">Initialize Research Workspace</h1>
        <p className="text-sm text-gray-400 mt-1">
          Configure a high-assurance multi-agent workspace for autonomous deep research, factual verification, and execution.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title Input */}
        <div className="space-y-2">
          <label className="text-xs font-mono text-gray-300 uppercase tracking-wider">Project Title *</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Enterprise Multi-Agent AI Feasibility Study 2026"
            className="w-full px-4 py-2.5 bg-[#141618] border border-[#2b3036] rounded-md text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

        {/* Objective & Description */}
        <div className="space-y-2">
          <label className="text-xs font-mono text-gray-300 uppercase tracking-wider">Research Objective & Scope</label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the core objective, required evidence standards, industry domain, and expected deliverable formats..."
            className="w-full px-4 py-2.5 bg-[#141618] border border-[#2b3036] rounded-md text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

        {/* Domain Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-mono text-gray-300 uppercase tracking-wider">Target Domain</label>
            <select
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#141618] border border-[#2b3036] rounded-md text-sm text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="general">Cross-Domain General Intelligence</option>
              <option value="market">Market Intelligence & Competitive Analysis</option>
              <option value="technical">Technical Architecture & Engineering Feasibility</option>
              <option value="data">Quantitative Data & Financial Feasibility</option>
              <option value="academic">Academic & Scientific Literature</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono text-gray-300 uppercase tracking-wider">Research Depth</label>
            <select
              value={depth}
              onChange={(e) => setDepth(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#141618] border border-[#2b3036] rounded-md text-sm text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="quick">Quick Discovery (3-5 primary sources)</option>
              <option value="standard">Standard Rigor (8-12 sources, deep verification)</option>
              <option value="deep">Exhaustive Multi-Hop (Complete EAL graph with deliverable suite)</option>
            </select>
          </div>
        </div>

        {/* Safety & Approval Checkbox */}
        <div className="p-4 rounded-lg bg-[#141618] border border-[#2b3036] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <div className="text-xs font-semibold text-white">Auto-approve Low-Risk Operations</div>
              <div className="text-[11px] text-gray-400">
                High-risk actions (code execution, external mutations) will still require explicit human approval.
              </div>
            </div>
          </div>
          <input
            type="checkbox"
            checked={autoApproveLowRisk}
            onChange={(e) => setAutoApproveLowRisk(e.target.checked)}
            className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSubmitting || !title.trim()}
            className="px-6 py-2.5 bg-gradient-to-r from-cyan-400 to-emerald-400 text-black font-semibold text-xs rounded-md disabled:opacity-50 hover:opacity-95 transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/10"
          >
            {isSubmitting ? "Orchestrating Fleet..." : "Launch Multi-Agent Workflow"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}

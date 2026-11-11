"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, ArrowRight, Loader2 } from "lucide-react";
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

      // Run workflow
      await api.runWorkflow({
        project_id: project.id,
        objective: description || title,
        domain,
        depth,
      });

      router.push(`/workspace?projectId=${project.id}`);
    } catch (err: any) {
      alert(`Error initializing workspace: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-zinc-800/80">
        <h1 className="text-xl font-semibold text-zinc-100 tracking-tight">Create Research Project</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Set up a new workspace with autonomous agent orchestration and evidence tracking.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-zinc-300">
            Project Title
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Graph Neural Networks Benchmark Study"
            className="w-full px-3.5 py-2 rounded-md bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-zinc-300">
            Core Objective & Scope
          </label>
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what the agents should investigate, evaluate, or model..."
            className="w-full px-3.5 py-2 rounded-md bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-300">
              Domain
            </label>
            <select
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none"
            >
              <option value="general">General Research</option>
              <option value="technical">Technical / Software Architecture</option>
              <option value="business">Business / Market Intelligence</option>
              <option value="finance">Financial Modeling</option>
              <option value="academic">Academic Literature</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-300">
              Research Depth
            </label>
            <select
              value={depth}
              onChange={(e) => setDepth(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none"
            >
              <option value="standard">Standard (8 Sources)</option>
              <option value="quick">Quick Exploration (4 Sources)</option>
              <option value="comprehensive">Comprehensive (16 Sources)</option>
            </select>
          </div>
        </div>

        <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-3 py-1.5 rounded-md text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting || !title.trim()}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-medium bg-zinc-100 text-zinc-950 hover:bg-white disabled:opacity-50 transition-colors shadow-sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Launching...</span>
              </>
            ) : (
              <>
                <span>Create & Begin Research</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

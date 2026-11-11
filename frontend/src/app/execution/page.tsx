"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  FileSpreadsheet,
  FileText,
  Presentation,
  Download,
  Terminal,
  Play,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ShieldCheck,
  FileCode,
} from "lucide-react";
import { api } from "@/lib/api";
import { useBanKaiStore } from "@/lib/store";
import { Artifact, Project } from "@/types";

function ExecutionCenterContent() {
  const searchParams = useSearchParams();
  const paramProjectId = searchParams.get("projectId");

  const activeProject = useBanKaiStore((state) => state.activeProject);
  const setActiveProject = useBanKaiStore((state) => state.setActiveProject);

  const [sandboxCode, setSandboxCode] = useState(
    "# Enter Python calculations or data analysis:\nimport numpy as np\n\nprojections = np.array([250, 780, 2100, 5400, 11200])\nprint(f'Total 5-Year Projections: ${projections.sum():,}k')\nprint(f'Average Annual Growth: {projections.mean():.1f}k')\n"
  );
  const [sandboxOutput, setSandboxOutput] = useState<any>(null);
  const [isExecuting, setIsExecuting] = useState(false);

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

  const { data: artifacts = [], isLoading: artifactsLoading } = useQuery<Artifact[]>({
    queryKey: ["artifacts", currentProjId],
    queryFn: () => (currentProjId ? api.getArtifacts(currentProjId) : Promise.resolve([])),
    enabled: !!currentProjId,
  });

  const handleRunSandbox = async () => {
    setIsExecuting(true);
    try {
      const res = await api.runSandboxCode(sandboxCode);
      setSandboxOutput(res);
    } catch (err: any) {
      setSandboxOutput({ status: "FAILED", stderr: err.message, stdout: "" });
    } finally {
      setIsExecuting(false);
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
        <div>
          <h1 className="text-xl font-semibold text-zinc-100 tracking-tight">Execution Sandbox</h1>
          <p className="text-xs text-zinc-400 mt-1">
            AST-validated Python execution environment and compiled research deliverables.
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Code Sandbox */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-medium text-zinc-300 uppercase tracking-wider">
              Python Scratchpad
            </h2>
            <span className="text-[10px] font-mono text-zinc-500">AST Policy: OS/Subprocess Blocked</span>
          </div>

          <div className="rounded-lg border border-zinc-800/80 overflow-hidden bg-zinc-950">
            <textarea
              value={sandboxCode}
              onChange={(e) => setSandboxCode(e.target.value)}
              rows={9}
              className="w-full p-4 font-mono text-xs text-zinc-200 bg-transparent resize-none focus:outline-none"
              spellCheck={false}
            />

            <div className="px-4 py-2.5 bg-zinc-900/60 border-t border-zinc-800/80 flex items-center justify-between">
              <span className="text-[11px] text-zinc-500 font-mono">Isolated Subprocess</span>
              <button
                onClick={handleRunSandbox}
                disabled={isExecuting}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium bg-zinc-100 text-zinc-950 hover:bg-white disabled:opacity-50 transition-colors"
              >
                {isExecuting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Running...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>Execute Code</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Execution Output */}
          {sandboxOutput && (
            <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-800/80 space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between text-[11px] pb-1 border-b border-zinc-800/60">
                <span className="text-zinc-500">OUTPUT</span>
                <span className={sandboxOutput.status === "SUCCESS" ? "text-emerald-400" : "text-red-400"}>
                  {sandboxOutput.status} • {sandboxOutput.duration_ms}ms
                </span>
              </div>
              {sandboxOutput.stdout && (
                <pre className="text-zinc-300 whitespace-pre-wrap">{sandboxOutput.stdout}</pre>
              )}
              {sandboxOutput.stderr && (
                <pre className="text-red-400 whitespace-pre-wrap">{sandboxOutput.stderr}</pre>
              )}
            </div>
          )}
        </div>

        {/* Right: Compiled Deliverables */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-medium text-zinc-300 uppercase tracking-wider">
              Generated Deliverables ({artifacts.length})
            </h2>
          </div>

          {artifactsLoading ? (
            <div className="p-8 text-center text-xs text-zinc-500 border border-zinc-800/60 rounded-lg">
              Loading artifacts...
            </div>
          ) : artifacts.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-500 border border-zinc-800/60 rounded-lg bg-zinc-950">
              No artifacts found for this workspace. Run an objective in the Workspace tab to generate Excel models, dossiers, and presentation slides.
            </div>
          ) : (
            <div className="space-y-2.5">
              {artifacts.map((a) => (
                <div
                  key={a.id}
                  className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-800/80 flex items-center justify-between gap-3 hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="p-2 rounded bg-zinc-900 border border-zinc-800">
                      {getFileIcon(a.file_type)}
                    </div>
                    <div className="space-y-0.5 overflow-hidden">
                      <div className="text-xs font-medium text-zinc-200 truncate" title={a.name}>
                        {a.name}
                      </div>
                      <div className="text-[10px] font-mono text-zinc-500">
                        {a.file_type.toUpperCase()} • {(a.file_size_bytes / 1024).toFixed(1)} KB
                      </div>
                    </div>
                  </div>

                  <a
                    href={`http://localhost:8000/api/v1/execution/artifacts/${a.id}/download`}
                    download
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-200 transition-colors flex-shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
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

export default function ExecutionCenterPage() {
  return (
    <Suspense fallback={<div className="p-8 max-w-7xl mx-auto text-zinc-500 font-mono text-xs">Loading execution center...</div>}>
      <ExecutionCenterContent />
    </Suspense>
  );
}

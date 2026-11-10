"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  PlaySquare,
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
} from "lucide-react";
import { api } from "@/lib/api";
import { useBanKaiStore } from "@/lib/store";
import { Artifact } from "@/types";

export default function ExecutionCenterPage() {
  const activeProject = useBanKaiStore((state) => state.activeProject);
  const [sandboxCode, setSandboxCode] = useState(
    "# Enter Python calculation or data analysis:\nimport numpy as np\nimport pandas as pd\n\nrevenue = np.array([250, 780, 2100, 5400, 11200])\nprint(f'Total 5-Year Revenue: ${revenue.sum():,}k')\n"
  );
  const [sandboxOutput, setSandboxOutput] = useState<any>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const { data: artifacts = [], isLoading: artifactsLoading } = useQuery<Artifact[]>({
    queryKey: ["artifacts", activeProject?.id],
    queryFn: () => api.getArtifacts(activeProject!.id),
    enabled: !!activeProject?.id,
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
        return <FileSpreadsheet className="w-5 h-5 text-emerald-400" />;
      case "docx":
      case "pdf":
        return <FileText className="w-5 h-5 text-cyan-400" />;
      case "pptx":
        return <Presentation className="w-5 h-5 text-amber-400" />;
      default:
        return <FileText className="w-5 h-5 text-purple-400" />;
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2b3036] pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Execution Center & Artifacts</h1>
          <p className="text-sm text-gray-400 mt-1">
            Generated production deliverables, executive briefings, and isolated AST Python execution environment.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#141618] border border-[#2b3036] text-xs font-mono text-emerald-400">
          <ShieldCheck className="w-4 h-4" />
          <span>AST Sandbox Isolation Active</span>
        </div>
      </div>

      {/* Grid: Generated Deliverables & Live Code Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Generated Artifacts Deliverables */}
        <div className="rounded-lg bg-[#141618] border border-[#2b3036] overflow-hidden flex flex-col h-[560px]">
          <div className="p-4 border-b border-[#2b3036] flex items-center justify-between bg-[#101214]">
            <div className="flex items-center gap-2">
              <PlaySquare className="w-4 h-4 text-cyan-400" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-white">Generated Deliverable Files</h2>
            </div>
            <span className="text-[11px] font-mono text-gray-400">{artifacts.length} Files</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[#2b3036]">
            {artifactsLoading ? (
              <div className="p-8 text-center text-xs text-gray-400">Loading artifacts...</div>
            ) : artifacts.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400">
                No deliverables generated yet. Launch a workflow to compile Excel models, Word dossiers, PowerPoint decks, and PDFs.
              </div>
            ) : (
              artifacts.map((art) => (
                <div key={art.id} className="p-4 flex items-center justify-between hover:bg-[#1a1d20] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded bg-[#202428] border border-[#2b3036]">{getFileIcon(art.file_type)}</div>
                    <div>
                      <div className="font-semibold text-xs text-white truncate max-w-xs">{art.name}</div>
                      <div className="text-[11px] font-mono text-gray-400">
                        {art.file_type.toUpperCase()} &bull; {(art.file_size_bytes / 1024).toFixed(1)} KB
                      </div>
                    </div>
                  </div>

                  <a
                    href={`http://localhost:8000/api/v1/execution/artifacts/${art.id}/download`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#202428] border border-[#2b3036] hover:border-cyan-500/50 text-xs text-gray-200 hover:text-cyan-400 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Live Python Sandbox Terminal */}
        <div className="rounded-lg bg-[#141618] border border-[#2b3036] overflow-hidden flex flex-col h-[560px]">
          <div className="p-4 border-b border-[#2b3036] flex items-center justify-between bg-[#101214]">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-white">Isolated Python Sandbox</h2>
            </div>
            <button
              onClick={handleRunSandbox}
              disabled={isExecuting}
              className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-cyan-400 to-emerald-400 text-black font-semibold text-xs rounded shadow-md disabled:opacity-50"
            >
              {isExecuting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-black" />}
              <span>Execute AST</span>
            </button>
          </div>

          <div className="flex-1 flex flex-col">
            <textarea
              value={sandboxCode}
              onChange={(e) => setSandboxCode(e.target.value)}
              className="flex-1 p-4 bg-[#0c0d0e] text-xs font-mono text-cyan-300 resize-none focus:outline-none"
              placeholder="Write Python code here..."
            />

            {/* Output Panel */}
            <div className="h-44 border-t border-[#2b3036] bg-[#141618] p-3 overflow-y-auto font-mono text-xs space-y-1">
              <div className="text-[10px] text-gray-500 uppercase">Sandbox Output:</div>
              {sandboxOutput ? (
                <div>
                  <div
                    className={`font-semibold text-[11px] ${
                      sandboxOutput.status === "SUCCESS"
                        ? "text-emerald-400"
                        : sandboxOutput.status === "SECURITY_VIOLATION"
                        ? "text-amber-400"
                        : "text-red-400"
                    }`}
                  >
                    [{sandboxOutput.status}] Duration: {sandboxOutput.duration_ms}ms
                  </div>
                  {sandboxOutput.stdout && <pre className="text-gray-200 mt-1 whitespace-pre-wrap">{sandboxOutput.stdout}</pre>}
                  {sandboxOutput.stderr && <pre className="text-red-300 mt-1 whitespace-pre-wrap">{sandboxOutput.stderr}</pre>}
                </div>
              ) : (
                <div className="text-gray-500">Run code to see stdout/stderr captured safely from isolated subprocess.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useQuery } from "@tanstack/react-query";
import {
  GitFork,
  Activity,
  Terminal,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { api } from "@/lib/api";
import { useBanKaiStore } from "@/lib/store";
import { useSSE } from "@/hooks/useSSE";
import { Project } from "@/types";

const nodeBaseStyle = {
  background: "#121215",
  color: "#f4f4f5",
  border: "1px solid #27272a",
  borderRadius: "6px",
  padding: "12px 14px",
  width: 175,
  fontSize: "12px",
};

const initialWorkflowNodes: Node[] = [
  {
    id: "orchestrator",
    position: { x: 40, y: 150 },
    data: { label: "1. Orchestrator", sub: "Decompose Objective", status: "completed" },
    style: { ...nodeBaseStyle, border: "1px solid #3f3f46" },
  },
  {
    id: "research",
    position: { x: 260, y: 150 },
    data: { label: "2. Research Agent", sub: "Deep Web Crawl", status: "completed" },
    style: { ...nodeBaseStyle, border: "1px solid #3f3f46" },
  },
  {
    id: "market_intel",
    position: { x: 480, y: 50 },
    data: { label: "3. Market Intel", sub: "Competitor & SWOT", status: "completed" },
    style: nodeBaseStyle,
  },
  {
    id: "tech_research",
    position: { x: 480, y: 150 },
    data: { label: "4. Tech Research", sub: "Stack & Benchmarks", status: "completed" },
    style: nodeBaseStyle,
  },
  {
    id: "data_analyst",
    position: { x: 480, y: 250 },
    data: { label: "5. Data Analyst", sub: "Financial Modeling", status: "completed" },
    style: nodeBaseStyle,
  },
  {
    id: "verification",
    position: { x: 700, y: 150 },
    data: { label: "6. Verification", sub: "Fact Check & RQS", status: "completed" },
    style: nodeBaseStyle,
  },
  {
    id: "strategy",
    position: { x: 920, y: 150 },
    data: { label: "7. Strategy Agent", sub: "Actionable Roadmap", status: "completed" },
    style: nodeBaseStyle,
  },
  {
    id: "approval_gate",
    position: { x: 1140, y: 150 },
    data: { label: "Approval Gate", sub: "Human-in-the-Loop", status: "completed" },
    style: { ...nodeBaseStyle, border: "1px dashed #52525b" },
  },
  {
    id: "execution",
    position: { x: 1360, y: 150 },
    data: { label: "8. Execution Agent", sub: "Compiled Deliverables", status: "completed" },
    style: { ...nodeBaseStyle, border: "1px solid #3f3f46" },
  },
];

const initialWorkflowEdges: Edge[] = [
  { id: "e1", source: "orchestrator", target: "research", animated: true, style: { stroke: "#52525b" } },
  { id: "e2", source: "research", target: "market_intel", style: { stroke: "#3f3f46" } },
  { id: "e3", source: "research", target: "tech_research", style: { stroke: "#3f3f46" } },
  { id: "e4", source: "research", target: "data_analyst", style: { stroke: "#3f3f46" } },
  { id: "e5", source: "market_intel", target: "verification", style: { stroke: "#3f3f46" } },
  { id: "e6", source: "tech_research", target: "verification", style: { stroke: "#3f3f46" } },
  { id: "e7", source: "data_analyst", target: "verification", style: { stroke: "#3f3f46" } },
  { id: "e8", source: "verification", target: "strategy", animated: true, style: { stroke: "#52525b" } },
  { id: "e9", source: "strategy", target: "approval_gate", style: { stroke: "#3f3f46" } },
  { id: "e10", source: "approval_gate", target: "execution", animated: true, style: { stroke: "#52525b" } },
];

function WorkflowContent() {
  const searchParams = useSearchParams();
  const paramProjectId = searchParams.get("projectId");

  const activeProject = useBanKaiStore((state) => state.activeProject);
  const setActiveProject = useBanKaiStore((state) => state.setActiveProject);
  const liveEvents = useBanKaiStore((state) => state.liveEvents);
  const activeAgent = useBanKaiStore((state) => state.activeAgent);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialWorkflowNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialWorkflowEdges);

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

  // Connect SSE
  useSSE(activeProject?.id);

  // Update node highlight based on active agent
  useEffect(() => {
    if (!activeAgent) return;
    setNodes((prevNodes) =>
      prevNodes.map((n) => {
        const labelStr = String((n.data as any)?.label || "");
        const isCurrent =
          n.id.toLowerCase() === activeAgent.toLowerCase().replace("agent", "") ||
          labelStr.toLowerCase().includes(activeAgent.toLowerCase());
        return {
          ...n,
          style: {
            ...n.style,
            border: isCurrent ? "1px solid #ffffff" : "1px solid #27272a",
            background: isCurrent ? "#18181b" : "#121215",
          },
        };
      })
    );
  }, [activeAgent, setNodes]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
        <div>
          <h1 className="text-xl font-semibold text-zinc-100 tracking-tight">Live Workflow Graph</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Stateful multi-agent execution pipeline orchestrated via LangGraph StateGraph.
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

      {/* React Flow Canvas and Stream Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 h-[520px] rounded-lg border border-zinc-800/80 overflow-hidden bg-zinc-950">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            fitView
          >
            <Background color="#27272a" gap={20} size={1} />
            <Controls />
            <MiniMap
              nodeColor={() => "#27272a"}
              maskColor="rgba(9, 9, 11, 0.85)"
              className="!bg-zinc-950 !border-zinc-800"
            />
          </ReactFlow>
        </div>

        {/* Live SSE Feed */}
        <div className="lg:col-span-1 h-[520px] flex flex-col rounded-lg border border-zinc-800/80 bg-zinc-950 p-4 space-y-3 overflow-hidden">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
            <span className="text-xs font-medium text-zinc-300 uppercase tracking-wider">Event Stream</span>
            <span className="text-[10px] font-mono text-zinc-500">{liveEvents.length} events</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5">
            {liveEvents.length === 0 ? (
              <div className="py-16 text-center text-xs text-zinc-500">
                Awaiting workflow execution events...
              </div>
            ) : (
              liveEvents.slice(-15).map((ev, i) => (
                <div key={i} className="text-xs space-y-0.5 pb-2 border-b border-zinc-900 last:border-none">
                  <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                    <span className="text-zinc-300">{ev.agent_name || "Agent"}</span>
                    <span>{new Date(ev.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-zinc-400 text-[11px] leading-relaxed">{ev.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WorkflowPage() {
  return (
    <Suspense fallback={<div className="p-8 max-w-7xl mx-auto text-zinc-500 font-mono text-xs">Loading workflow graph...</div>}>
      <WorkflowContent />
    </Suspense>
  );
}

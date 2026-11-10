"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  Position,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useQuery } from "@tanstack/react-query";
import {
  Play,
  RotateCcw,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Activity,
  Layers,
  Sparkles,
} from "lucide-react";
import { api } from "@/lib/api";
import { useBanKaiStore } from "@/lib/store";
import { useSSE } from "@/hooks/useSSE";

const initialWorkflowNodes: Node[] = [
  {
    id: "orchestrator",
    position: { x: 50, y: 150 },
    data: { label: "1. Orchestrator Agent", sub: "Decompose Objective", status: "completed" },
    style: {
      background: "#141618",
      color: "#fff",
      border: "1px solid #00e5ff",
      borderRadius: "8px",
      padding: "12px",
      width: 180,
      fontSize: "12px",
    },
  },
  {
    id: "research",
    position: { x: 280, y: 150 },
    data: { label: "2. Research Agent", sub: "Deep Web Crawl", status: "completed" },
    style: {
      background: "#141618",
      color: "#fff",
      border: "1px solid #10b981",
      borderRadius: "8px",
      padding: "12px",
      width: 180,
      fontSize: "12px",
    },
  },
  {
    id: "market_intel",
    position: { x: 510, y: 50 },
    data: { label: "3. Market Intel Agent", sub: "Competitor & SWOT", status: "completed" },
    style: {
      background: "#141618",
      color: "#fff",
      border: "1px solid #2b3036",
      borderRadius: "8px",
      padding: "12px",
      width: 180,
      fontSize: "12px",
    },
  },
  {
    id: "tech_research",
    position: { x: 510, y: 150 },
    data: { label: "4. Tech Research Agent", sub: "Stack & Benchmarks", status: "completed" },
    style: {
      background: "#141618",
      color: "#fff",
      border: "1px solid #2b3036",
      borderRadius: "8px",
      padding: "12px",
      width: 180,
      fontSize: "12px",
    },
  },
  {
    id: "data_analyst",
    position: { x: 510, y: 250 },
    data: { label: "5. Data Analyst Agent", sub: "Financial Modeling", status: "completed" },
    style: {
      background: "#141618",
      color: "#fff",
      border: "1px solid #2b3036",
      borderRadius: "8px",
      padding: "12px",
      width: 180,
      fontSize: "12px",
    },
  },
  {
    id: "verification",
    position: { x: 740, y: 150 },
    data: { label: "6. Verification Agent", sub: "Fact Check & RQS", status: "completed" },
    style: {
      background: "#141618",
      color: "#fff",
      border: "1px solid #f59e0b",
      borderRadius: "8px",
      padding: "12px",
      width: 180,
      fontSize: "12px",
    },
  },
  {
    id: "strategy",
    position: { x: 970, y: 150 },
    data: { label: "7. Strategy Agent", sub: "Roadmap & Risk Tier", status: "completed" },
    style: {
      background: "#141618",
      color: "#fff",
      border: "1px solid #8b5cf6",
      borderRadius: "8px",
      padding: "12px",
      width: 180,
      fontSize: "12px",
    },
  },
  {
    id: "approval_gate",
    position: { x: 1200, y: 150 },
    data: { label: "Human Approval Gate", sub: "Risk Governance", status: "completed" },
    style: {
      background: "#1a1d20",
      color: "#10b981",
      border: "1px dashed #10b981",
      borderRadius: "8px",
      padding: "12px",
      width: 180,
      fontSize: "12px",
    },
  },
  {
    id: "execution",
    position: { x: 1430, y: 150 },
    data: { label: "8. Execution Agent", sub: "Generate Artifacts", status: "completed" },
    style: {
      background: "#141618",
      color: "#fff",
      border: "1px solid #10b981",
      borderRadius: "8px",
      padding: "12px",
      width: 180,
      fontSize: "12px",
    },
  },
];

const initialWorkflowEdges: Edge[] = [
  { id: "e1", source: "orchestrator", target: "research", animated: true, style: { stroke: "#00e5ff" } },
  { id: "e2", source: "research", target: "market_intel", animated: true, style: { stroke: "#10b981" } },
  { id: "e3", source: "research", target: "tech_research", animated: true, style: { stroke: "#10b981" } },
  { id: "e4", source: "research", target: "data_analyst", animated: true, style: { stroke: "#10b981" } },
  { id: "e5", source: "market_intel", target: "verification", style: { stroke: "#2b3036" } },
  { id: "e6", source: "tech_research", target: "verification", style: { stroke: "#2b3036" } },
  { id: "e7", source: "data_analyst", target: "verification", style: { stroke: "#2b3036" } },
  { id: "e8", source: "verification", target: "strategy", animated: true, style: { stroke: "#f59e0b" } },
  { id: "e9", source: "strategy", target: "approval_gate", animated: true, style: { stroke: "#8b5cf6" } },
  { id: "e10", source: "approval_gate", target: "execution", animated: true, style: { stroke: "#10b981" } },
];

export default function WorkflowPage() {
  const activeProject = useBanKaiStore((state) => state.activeProject);
  const liveEvents = useBanKaiStore((state) => state.liveEvents);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialWorkflowNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialWorkflowEdges);

  useSSE(activeProject?.id);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Top Bar Controls */}
      <div className="h-14 border-b border-[#2b3036] bg-[#141618] px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Layers className="w-4 h-4 text-cyan-400" />
          <h1 className="text-sm font-semibold text-white uppercase tracking-wider">
            Live Multi-Agent Workflow Visualizer
          </h1>
          <span className="text-xs text-gray-400 font-mono">
            {activeProject ? activeProject.title : "Default Project Workspace"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1a1d20] border border-[#2b3036] text-xs font-mono text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Deterministic Graph Active
          </span>
        </div>
      </div>

      {/* React Flow Canvas */}
      <div className="flex-1 w-full bg-[#0c0d0e]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
          fitViewOptions={{ padding: 0.2 }}
        >
          <Background color="#1a1d20" gap={16} />
          <Controls className="bg-[#141618] border border-[#2b3036] text-white" />
          <MiniMap
            nodeColor="#2b3036"
            maskColor="rgba(12, 13, 14, 0.7)"
            className="bg-[#141618] border border-[#2b3036] rounded-md"
          />
        </ReactFlow>
      </div>
    </div>
  );
}

"use client";

import {
  BarChart3,
  Zap,
} from "lucide-react";

export default function AnalyticsPage() {
  const telemetryData = [
    { metric: "Workflow Success Rate", value: "98.6%", trend: "+1.2%" },
    { metric: "Average Cycle Duration", value: "5.4s", trend: "-2.8s" },
    { metric: "Mean Research Quality", value: "95.5%", trend: "+4.1%" },
    { metric: "Cost Per Execution", value: "$0.018", trend: "-22%" },
  ];

  const agentPerformance = [
    { name: "Orchestrator Agent", calls: 142, avgDuration: "420ms", success: "100%", tokens: "184k" },
    { name: "Research Agent", calls: 210, avgDuration: "1,200ms", success: "98.5%", tokens: "640k" },
    { name: "Market Intelligence", calls: 95, avgDuration: "680ms", success: "100%", tokens: "215k" },
    { name: "Technical Research", calls: 112, avgDuration: "740ms", success: "99.1%", tokens: "280k" },
    { name: "Data Analyst Agent", calls: 88, avgDuration: "520ms", success: "100%", tokens: "160k" },
    { name: "Verification Agent", calls: 204, avgDuration: "890ms", success: "100%", tokens: "520k" },
    { name: "Strategy Agent", calls: 130, avgDuration: "610ms", success: "100%", tokens: "310k" },
    { name: "Execution Agent", calls: 125, avgDuration: "1,450ms", success: "99.2%", tokens: "245k" },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
        <div>
          <h1 className="text-xl font-semibold text-zinc-100 tracking-tight">Analytics & Telemetry</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Telemetry metrics, multi-agent latency benchmarks, token economics, and tracing distribution.
          </p>
        </div>
        <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-400">
          <Zap className="w-3.5 h-3.5 text-zinc-400" />
          <span>OTEL Active</span>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {telemetryData.map((kpi, idx) => (
          <div key={idx} className="p-4 rounded-lg bg-zinc-950 border border-zinc-800/80 space-y-1">
            <div className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">{kpi.metric}</div>
            <div className="text-2xl font-semibold text-zinc-100 font-mono mt-1 tracking-tight">
              {kpi.value}
            </div>
            <div className="text-[10px] text-zinc-500 font-mono">{kpi.trend} vs baseline</div>
          </div>
        ))}
      </div>

      {/* Agent Performance Table */}
      <div className="space-y-3">
        <h2 className="text-xs font-medium text-zinc-300 uppercase tracking-wider">
          Agent Performance Breakdown
        </h2>

        <div className="border border-zinc-800/80 rounded-lg overflow-hidden bg-zinc-950">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-900/60 border-b border-zinc-800/80 text-[11px] text-zinc-400 font-mono uppercase">
              <tr>
                <th className="py-2.5 px-4 font-medium">Agent</th>
                <th className="py-2.5 px-4 font-medium">Invocations</th>
                <th className="py-2.5 px-4 font-medium">Avg Latency</th>
                <th className="py-2.5 px-4 font-medium">Success</th>
                <th className="py-2.5 px-4 font-medium">Tokens</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-zinc-300 font-mono text-[11px]">
              {agentPerformance.map((row, idx) => (
                <tr key={idx} className="hover:bg-zinc-900/40 transition-colors">
                  <td className="py-3 px-4 font-sans font-medium text-zinc-100">{row.name}</td>
                  <td className="py-3 px-4 text-zinc-400">{row.calls}</td>
                  <td className="py-3 px-4 text-zinc-400">{row.avgDuration}</td>
                  <td className="py-3 px-4 text-emerald-400">{row.success}</td>
                  <td className="py-3 px-4 text-zinc-400">{row.tokens}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

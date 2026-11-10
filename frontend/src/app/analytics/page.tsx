"use client";

import {
  BarChart3,
  Clock,
  CheckCircle2,
  Cpu,
  Layers,
  TrendingUp,
  Zap,
  DollarSign,
  ShieldCheck,
} from "lucide-react";

export default function AnalyticsPage() {
  const telemetryData = [
    { metric: "Workflow Success Rate", value: "98.6%", trend: "+1.2%", status: "optimal" },
    { metric: "Average Cycle Duration", value: "8.4s", trend: "-1.8s", status: "optimal" },
    { metric: "Mean Research Quality", value: "92.8%", trend: "+3.5%", status: "optimal" },
    { metric: "Estimated Cost Per Task", value: "$0.024", trend: "-18%", status: "optimal" },
  ];

  const agentPerformance = [
    { name: "Orchestrator Agent", calls: 142, avgDuration: "420ms", success: "100%", tokens: "184k" },
    { name: "Research Agent", calls: 210, avgDuration: "1,750ms", success: "98.5%", tokens: "640k" },
    { name: "Market Intelligence", calls: 95, avgDuration: "910ms", success: "100%", tokens: "215k" },
    { name: "Technical Research", calls: 112, avgDuration: "1,080ms", success: "99.1%", tokens: "280k" },
    { name: "Data Analyst Agent", calls: 88, avgDuration: "640ms", success: "100%", tokens: "160k" },
    { name: "Verification Agent", calls: 204, avgDuration: "1,220ms", success: "100%", tokens: "520k" },
    { name: "Strategy Agent", calls: 130, avgDuration: "860ms", success: "100%", tokens: "310k" },
    { name: "Execution Agent", calls: 125, avgDuration: "2,050ms", success: "99.2%", tokens: "245k" },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2b3036] pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Analytics & Observability</h1>
          <p className="text-sm text-gray-400 mt-1">
            Telemetry metrics, multi-agent latency benchmarks, token economics, and Langfuse tracing distribution.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#141618] border border-[#2b3036] text-xs font-mono text-cyan-400">
          <Zap className="w-4 h-4 text-cyan-400" />
          <span>OpenTelemetry & Langfuse Hook Active</span>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {telemetryData.map((item) => (
          <div key={item.metric} className="p-5 rounded-lg bg-[#141618] border border-[#2b3036] space-y-2">
            <div className="text-xs font-mono text-gray-400 uppercase">{item.metric}</div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-white">{item.value}</span>
              <span className="text-xs font-mono text-emerald-400">{item.trend}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Agent Performance Table */}
      <div className="rounded-lg bg-[#141618] border border-[#2b3036] overflow-hidden">
        <div className="p-4 border-b border-[#2b3036] flex items-center justify-between bg-[#101214]">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-white">Agent Fleet Performance Matrix</h2>
          </div>
          <span className="text-xs font-mono text-gray-400">Past 24 Hours</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-[#1a1d20] text-gray-400 uppercase text-[10px] font-mono border-b border-[#2b3036]">
              <tr>
                <th className="py-3 px-4">Agent Name</th>
                <th className="py-3 px-4">Executions</th>
                <th className="py-3 px-4">P50 Duration</th>
                <th className="py-3 px-4">Success Rate</th>
                <th className="py-3 px-4">Token Consumption</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2b3036] font-mono">
              {agentPerformance.map((agent) => (
                <tr key={agent.name} className="hover:bg-[#1a1d20] transition-colors">
                  <td className="py-3 px-4 font-semibold text-white font-sans">{agent.name}</td>
                  <td className="py-3 px-4 text-gray-300">{agent.calls} runs</td>
                  <td className="py-3 px-4 text-emerald-400">{agent.avgDuration}</td>
                  <td className="py-3 px-4 text-cyan-400">{agent.success}</td>
                  <td className="py-3 px-4 text-gray-400">{agent.tokens}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


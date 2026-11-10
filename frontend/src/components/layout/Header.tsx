"use client";

import Link from "next/link";
import { Plus, Radio, Activity, Terminal } from "lucide-react";
import { useBanKaiStore } from "@/lib/store";

export function Header() {
  const activeAgent = useBanKaiStore((state) => state.activeAgent);
  const isConnectedSSE = useBanKaiStore((state) => state.isConnectedSSE);

  return (
    <header className="h-16 border-b border-[#2b3036] bg-[#141618] px-8 flex items-center justify-between select-none">
      {/* Telemetry Indicator */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1a1d20] border border-[#2b3036] text-xs">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-gray-400">Agent Status:</span>
          <span className="font-mono font-medium text-gray-200">
            {activeAgent ? `${activeAgent} (Active)` : "Ready"}
          </span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1a1d20] border border-[#2b3036] text-xs">
          <Radio className={`w-3.5 h-3.5 ${isConnectedSSE ? "text-emerald-400 animate-pulse" : "text-gray-500"}`} />
          <span className="text-gray-400">Event Stream:</span>
          <span className="font-mono text-gray-200">{isConnectedSSE ? "SSE Connected" : "Connecting"}</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center gap-3">
        <Link
          href="/workflow"
          className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium text-gray-300 bg-[#1a1d20] border border-[#2b3036] hover:bg-[#202428] hover:text-white transition-colors"
        >
          <Terminal className="w-3.5 h-3.5 text-gray-400" />
          <span>Live Console</span>
        </Link>

        <Link
          href="/projects/new"
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold text-black bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 shadow-md shadow-cyan-500/10 transition-all"
        >
          <Plus className="w-4 h-4 text-black" />
          <span>New Research Objective</span>
        </Link>
      </div>
    </header>
  );
}

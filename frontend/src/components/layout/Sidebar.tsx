"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  PlusCircle,
  Cpu,
  GitFork,
  BookOpenCheck,
  FileCheck2,
  PlaySquare,
  Database,
  BarChart3,
  Plug,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { useBanKaiStore } from "@/lib/store";

const navItems = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/workspace", label: "Research Workspace", icon: Search },
  { href: "/projects/new", label: "New Project", icon: PlusCircle },
  { href: "/agents", label: "Agent Command Center", icon: Cpu },
  { href: "/workflow", label: "Live Workflow", icon: GitFork },
  { href: "/research", label: "Research Intelligence", icon: BookOpenCheck },
  { href: "/eal", label: "Evidence Ledger (EAL)", icon: FileCheck2 },
  { href: "/execution", label: "Execution Center", icon: PlaySquare },
  { href: "/memory", label: "Memory Center", icon: Database },
  { href: "/analytics", label: "Analytics & Telemetry", icon: BarChart3 },
  { href: "/integrations", label: "Integrations", icon: Plug },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const activeProject = useBanKaiStore((state) => state.activeProject);
  const isConnectedSSE = useBanKaiStore((state) => state.isConnectedSSE);

  return (
    <aside className="w-64 border-r border-[#2b3036] bg-[#141618] flex flex-col h-screen select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-[#2b3036] gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center font-bold text-black text-sm tracking-tighter shadow-lg shadow-cyan-500/20">
          BK
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-sm tracking-wide text-white uppercase">BAN KAI</span>
          <span className="text-[10px] text-gray-400 font-mono tracking-wider">AI RESEARCH & EXECUTION</span>
        </div>
      </div>

      {/* Active Project Banner */}
      <div className="px-4 py-3 border-b border-[#2b3036]/60 bg-[#1a1d20]/50">
        <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
          <span className="font-mono text-[11px]">ACTIVE WORKSPACE</span>
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isConnectedSSE ? "bg-emerald-400 animate-pulse" : "bg-gray-500"}`} />
            <span className="text-[10px] text-gray-400">{isConnectedSSE ? "LIVE" : "SYNC"}</span>
          </div>
        </div>
        <div className="text-xs font-medium text-gray-200 truncate">
          {activeProject ? activeProject.title : "Default Workspace"}
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                isActive
                  ? "bg-[#202428] text-cyan-400 border border-[#2b3036] shadow-sm shadow-cyan-500/5 font-semibold"
                  : "text-gray-400 hover:text-gray-200 hover:bg-[#1a1d20]"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-cyan-400" : "text-gray-400"}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Security & System Info Footer */}
      <div className="p-4 border-t border-[#2b3036] text-[11px] text-gray-400 flex items-center justify-between bg-[#101214]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>AST Sandbox Secured</span>
        </div>
        <span className="font-mono text-[10px] text-gray-500">v0.1.0</span>
      </div>
    </aside>
  );
}

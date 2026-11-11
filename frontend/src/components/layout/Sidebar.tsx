"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  PlusCircle,
  GitFork,
  BookOpenCheck,
  FileCheck2,
  Terminal,
  Database,
  BarChart3,
  Plug,
  Settings,
  FolderGit2,
} from "lucide-react";
import { useBanKaiStore } from "@/lib/store";

const mainNav = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/workspace", label: "Workspace", icon: Search },
  { href: "/projects/new", label: "New Project", icon: PlusCircle },
];

const intelligenceNav = [
  { href: "/workflow", label: "Workflow Graph", icon: GitFork },
  { href: "/eal", label: "Evidence Ledger", icon: FileCheck2 },
  { href: "/research", label: "Sources & Claims", icon: BookOpenCheck },
  { href: "/execution", label: "Execution Sandbox", icon: Terminal },
  { href: "/memory", label: "Memory Engine", icon: Database },
];

const systemNav = [
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/integrations", label: "Integrations", icon: Plug },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const activeProject = useBanKaiStore((state) => state.activeProject);
  const isConnectedSSE = useBanKaiStore((state) => state.isConnectedSSE);

  const renderNavGroup = (title: string, items: typeof mainNav) => (
    <div className="space-y-1">
      <div className="px-3 pb-1 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
        {title}
      </div>
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2.5 px-3 py-1.5 rounded-md text-xs transition-colors ${
              isActive
                ? "bg-zinc-800/80 text-zinc-100 font-medium"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? "text-zinc-200" : "text-zinc-500"}`} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );

  return (
    <aside className="w-60 border-r border-zinc-800/80 bg-zinc-950 flex flex-col h-screen select-none text-zinc-200">
      {/* Brand Header */}
      <div className="h-14 flex items-center px-5 border-b border-zinc-800/80 justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded bg-zinc-100 text-zinc-950 flex items-center justify-center font-bold text-xs tracking-tight">
            B
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-semibold text-sm tracking-tight text-zinc-100">BanKai</span>
            <span className="text-[10px] text-zinc-500 font-mono">v0.1</span>
          </div>
        </Link>
        <div className="flex items-center gap-1.5" title={isConnectedSSE ? "Real-time SSE active" : "Reconnecting"}>
          <span className={`w-1.5 h-1.5 rounded-full ${isConnectedSSE ? "bg-emerald-500" : "bg-zinc-600"}`} />
        </div>
      </div>

      {/* Active Project Card */}
      {activeProject && (
        <div className="px-4 py-2.5 border-b border-zinc-800/60 bg-zinc-900/30">
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">Current Workspace</div>
          <div className="text-xs text-zinc-200 font-medium truncate mt-0.5" title={activeProject.title}>
            {activeProject.title}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-2 py-4 space-y-5">
        {renderNavGroup("Core", mainNav)}
        {renderNavGroup("Intelligence", intelligenceNav)}
        {renderNavGroup("System", systemNav)}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500">
        <span>8 Agents Ready</span>
        <span className="font-mono">Local AST Safe</span>
      </div>
    </aside>
  );
}

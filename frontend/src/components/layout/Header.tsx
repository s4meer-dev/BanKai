"use client";

import Link from "next/link";
import { Plus, Terminal, ExternalLink } from "lucide-react";
import { useBanKaiStore } from "@/lib/store";

export function Header() {
  const activeAgent = useBanKaiStore((state) => state.activeAgent);
  const activeProject = useBanKaiStore((state) => state.activeProject);

  return (
    <header className="h-14 border-b border-zinc-800/80 bg-zinc-950 px-6 flex items-center justify-between select-none">
      {/* Left: Active Status Context */}
      <div className="flex items-center gap-3 text-xs">
        <div className="flex items-center gap-2 text-zinc-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Status:</span>
          <span className="text-zinc-200 font-medium font-mono">
            {activeAgent ? `${activeAgent} running` : "Idle"}
          </span>
        </div>

        {activeProject && (
          <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-zinc-800 text-zinc-400">
            <span>Project:</span>
            <span className="text-zinc-300 font-medium truncate max-w-[200px]">
              {activeProject.title}
            </span>
          </div>
        )}
      </div>

      {/* Right: Quick Actions */}
      <div className="flex items-center gap-2.5">
        <Link
          href="/workflow"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-colors"
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Live Graph</span>
        </Link>

        <a
          href="http://localhost:8000/docs"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
        >
          <span>API Docs</span>
          <ExternalLink className="w-3 h-3 text-zinc-500" />
        </a>

        <Link
          href="/workspace"
          className="flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium text-zinc-950 bg-zinc-100 hover:bg-white transition-colors shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Objective</span>
        </Link>
      </div>
    </header>
  );
}

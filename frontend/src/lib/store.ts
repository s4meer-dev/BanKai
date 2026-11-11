import { create } from "zustand";
import { Project, WorkflowEvent } from "@/types";

interface BanKaiState {
  activeProject: Project | null;
  projects: Project[];
  activeWorkflowId: string | null;
  liveEvents: WorkflowEvent[];
  activeAgent: string | null;
  isConnectedSSE: boolean;

  setActiveProject: (project: Project | null) => void;
  setProjects: (projects: Project[]) => void;
  setActiveWorkflowId: (id: string | null) => void;
  addLiveEvent: (event: WorkflowEvent) => void;
  clearLiveEvents: () => void;
  setActiveAgent: (agent: string | null) => void;
  setIsConnectedSSE: (connected: boolean) => void;
}

export const useBanKaiStore = create<BanKaiState>((set) => ({
  activeProject: null,
  projects: [],
  activeWorkflowId: null,
  liveEvents: [],
  activeAgent: null,
  isConnectedSSE: false,

  setActiveProject: (project) => set({ activeProject: project }),
  setProjects: (projects) => set({ projects }),
  setActiveWorkflowId: (id) => set({ activeWorkflowId: id }),
  addLiveEvent: (event) =>
    set((state) => ({
      liveEvents: [event, ...state.liveEvents].slice(0, 100),
      activeAgent: event.agent_id || state.activeAgent,
    })),
  clearLiveEvents: () => set({ liveEvents: [] }),
  setActiveAgent: (agent) => set({ activeAgent: agent }),
  setIsConnectedSSE: (connected) => set({ isConnectedSSE: connected }),
}));


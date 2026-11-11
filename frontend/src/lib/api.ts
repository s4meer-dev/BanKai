const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function fetchAPI<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `HTTP Error ${response.status}`;
    try {
      const errData = await response.json();
      errorMsg = errData.detail || errorMsg;
    } catch {
      // ignored
    }
    throw new Error(errorMsg);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// API methods
export const api = {
  // Projects
  getProjects: () => fetchAPI("/api/v1/projects"),
  getProject: (id: string) => fetchAPI(`/api/v1/projects/${id}`),
  createProject: (data: { title: string; description?: string; settings?: any }) =>
    fetchAPI("/api/v1/projects", { method: "POST", body: JSON.stringify(data) }),
  deleteProject: (id: string) => fetchAPI(`/api/v1/projects/${id}`, { method: "DELETE" }),

  // Tasks
  getTasks: (projectId: string) => fetchAPI(`/api/v1/tasks?project_id=${projectId}`),

  // Workflows
  runWorkflow: (data: { project_id: string; objective: string; domain?: string; depth?: string }) =>
    fetchAPI("/api/v1/workflows/run", { method: "POST", body: JSON.stringify(data) }),
  getWorkflowStatus: (workflowId: string) => fetchAPI(`/api/v1/workflows/${workflowId}`),
  approveWorkflow: (workflowId: string, approved: boolean, comments?: string) =>
    fetchAPI(`/api/v1/workflows/${workflowId}/approve`, {
      method: "POST",
      body: JSON.stringify({ approved, comments }),
    }),

  // Research
  getClaims: (projectId: string) => fetchAPI(`/api/v1/research/claims?project_id=${projectId}`),
  getSources: (projectId: string) => fetchAPI(`/api/v1/research/sources?project_id=${projectId}`),

  // Evidence-to-Action Ledger
  getEALGraph: (projectId: string) => fetchAPI(`/api/v1/eal/${projectId}`),
  getEALScore: (projectId: string) => fetchAPI(`/api/v1/eal/${projectId}/score`),

  // Execution & Artifacts
  getArtifacts: (projectId: string) => fetchAPI(`/api/v1/execution/artifacts?project_id=${projectId}`),
  runSandboxCode: (code: string) =>
    fetchAPI("/api/v1/execution/sandbox", { method: "POST", body: JSON.stringify({ code }) }),

  // Memory
  getMemories: (projectId?: string) =>
    fetchAPI(`/api/v1/memory${projectId ? `?project_id=${projectId}` : ""}`),
  queryMemory: (query: string, projectId?: string) =>
    fetchAPI("/api/v1/memory/query", {
      method: "POST",
      body: JSON.stringify({ query, project_id: projectId, min_similarity: 0.1 }),
    }),
  createMemory: (data: any) =>
    fetchAPI("/api/v1/memory", { method: "POST", body: JSON.stringify(data) }),
  deleteMemory: (id: string) => fetchAPI(`/api/v1/memory/${id}`, { method: "DELETE" }),
};


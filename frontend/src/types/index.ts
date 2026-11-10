export interface Project {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  status: string;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
  task_count?: number;
  claim_count?: number;
  recommendation_count?: number;
  artifact_count?: number;
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  assigned_agent: string;
  status: "pending" | "in_progress" | "completed" | "failed" | "blocked";
  priority: "low" | "medium" | "high" | "critical";
  dependencies: string[];
  input_data: Record<string, any>;
  result_summary: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ResearchSource {
  id: string;
  project_id: string;
  url: string;
  title: string;
  publisher?: string;
  published_date?: string;
  content_hash: string;
  summary?: string;
  reliability_score: number;
  created_at: string;
}

export interface ResearchClaim {
  id: string;
  project_id: string;
  task_id?: string;
  source_id: string;
  claim_text: string;
  evidence_excerpt: string;
  confidence_score: number;
  verification_status: "UNVERIFIED" | "VERIFIED" | "PARTIALLY_VERIFIED" | "DISPUTED" | "INSUFFICIENT_EVIDENCE";
  created_at: string;
}

export interface EALTraceNode {
  id: string;
  type: "objective" | "task" | "claim" | "source" | "verification" | "recommendation" | "plan" | "action" | "artifact";
  title: string;
  subtitle?: string;
  status?: string;
  data: Record<string, any>;
}

export interface EALTraceEdge {
  id: string;
  source: string;
  target: string;
  relation: string;
}

export interface EALGraphResponse {
  project_id: string;
  nodes: EALTraceNode[];
  edges: EALTraceEdge[];
  quality_score: number;
  total_claims: number;
  verified_claims: number;
  contradicted_claims: number;
}

export interface EALQualityScoreResponse {
  project_id: string;
  overall_score: number;
  citation_coverage: number;
  source_reliability_avg: number;
  verification_rate: number;
  contradiction_resolution_rate: number;
  recency_score: number;
  scoring_notes: string[];
}

export interface Artifact {
  id: string;
  project_id: string;
  execution_action_id?: string;
  name: string;
  file_path: string;
  file_type: string;
  file_size_bytes: number;
  download_url?: string;
  created_at: string;
}

export interface MemoryItem {
  id: string;
  project_id?: string;
  user_id?: string;
  tier: "session" | "project" | "user" | "knowledge";
  key: string;
  content: string;
  similarity?: number;
  metadata_json: Record<string, any>;
  relevance_score: number;
  created_at: string;
}

export interface WorkflowEvent {
  event_id: string;
  event_type: string;
  project_id: string;
  workflow_id: string;
  task_id?: string;
  agent_id?: string;
  timestamp: string;
  payload: Record<string, any>;
}

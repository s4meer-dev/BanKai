# BAN KAI System Architecture

BAN KAI is an autonomous Multi-Agent AI Research and Execution Platform designed for rigorous research, factual verification, strategic planning, and human-supervised task execution.

---

## 1. High-Level Architecture Diagram

```mermaid
flowchart TD
    subgraph ClientLayer["Frontend Client (Next.js 15 + React Flow)"]
        UI["12 Specialized Views\n(Overview, Research, EAL, Workflow, Memory, etc.)"]
        StateSync["TanStack Query + Zustand"]
        EventStream["WebSocket / SSE Stream Listener"]
    end

    subgraph APILayer["FastAPI Gateway"]
        AuthMiddleware["Auth & Rate Limiting"]
        ProjectRouter["/api/v1/projects"]
        WorkflowRouter["/api/v1/workflows"]
        EALRouter["/api/v1/eal (Ledger)"]
        MemoryRouter["/api/v1/memory"]
        ExecutionRouter["/api/v1/execution"]
        SSEEndpoint["/api/v1/events/stream"]
    end

    subgraph OrchestrationLayer["LangGraph Multi-Agent Orchestrator"]
        State["Typed Workflow State (AgentState)"]
        Checkpointer["PostgreSQL / SQLite Checkpointer"]
        
        A1["1. Orchestrator Agent"]
        A2["2. Research Agent"]
        A3["3. Market Intel Agent"]
        A4["4. Tech Research Agent"]
        A5["5. Data Analyst Agent"]
        A6["6. Verification Agent"]
        A7["7. Strategy Agent"]
        A8["8. Execution Agent"]
    end

    subgraph CoreEngines["Core Functional Engines"]
        ResearchEngine["Unified Research Engine\n(Crawl4AI, Playwright, Search Providers)"]
        EALEngine["Evidence-to-Action Ledger Engine\n(Full Traceability Graph)"]
        MemoryEngine["Persistent Memory Engine\n(PostgreSQL + pgvector / Semantic Search)"]
        ExecutionEngine["Isolated Execution Engine\n(AST Sandbox, Python, File Generators)"]
    end

    subgraph DataLayer["Storage & Telemetry"]
        PG["PostgreSQL 16 + pgvector"]
        Redis["Redis (Task Queue / Cache)"]
        Langfuse["Langfuse Tracing & Telemetry"]
    end

    UI --> StateSync
    UI --> EventStream
    StateSync --> APILayer
    EventStream <--> SSEEndpoint

    APILayer --> OrchestrationLayer
    OrchestrationLayer --> CoreEngines
    CoreEngines --> DataLayer
    OrchestrationLayer --> Checkpointer
    Checkpointer --> PG
```

---

## 2. The 8 Specialized Agents & Responsibilities

```mermaid
flowchart LR
    UserObjective["User Objective"] --> A1["1. Orchestrator Agent"]
    
    subgraph ResearchPhase["Information Gathering & Analysis"]
        A1 --> A2["2. Research Agent"]
        A1 --> A3["3. Market Intel Agent"]
        A1 --> A4["4. Technical Research Agent"]
        A1 --> A5["5. Data Analyst Agent"]
    end

    ResearchPhase --> A6["6. Verification Agent"]
    A6 -->|Contradictions or Low Evidence| A1
    A6 -->|Verified Claims & Quality Score| A7["7. Strategy Agent"]
    
    A7 --> HumanApproval{"Human Approval Gate\n(Risk Assessment)"}
    HumanApproval -->|Approved| A8["8. Execution Agent"]
    HumanApproval -->|Rejected / Revised| A7
    
    A8 --> MemorySync["Memory Engine & Artifact Output"]
    MemorySync --> FinalDeliverable["Final Verified Deliverables & EAL Ledger"]
```

### Agent Detailed Specifications

1. **Orchestrator Agent:**
   - Evaluates objective scope and complexity.
   - Decomposes into structured, dependency-aware subtasks.
   - Assigns subtasks to specialized agents.
   - Monitors execution state, handles retries, and aggregates outputs.
   - Decides deterministically when research is sufficient or if recursive queries are needed.

2. **Research Agent:**
   - Executes multi-query search across web engines.
   - Extracts clean Markdown, metadata, and publication details.
   - Formulates atomic factual claims linked to precise source citations.

3. **Market Intelligence Agent:**
   - Conducts competitor teardowns, market sizing, industry trends, and SWOT analyses.
   - Identifies market opportunities and customer segments with empirical evidence.

4. **Technical Research Agent:**
   - Evaluates technical feasibility, software architectures, GitHub repositories, and API ecosystems.
   - Compares frameworks and produces benchmark-backed technical recommendations.

5. **Data Analyst Agent:**
   - Cleans, parses, and analyzes CSV, Excel, and JSON datasets.
   - Computes statistical summaries, financial modeling, and metric distributions.
   - Executes data transformations in the isolated execution sandbox.

6. **Verification Agent:**
   - Cross-references extracted claims against independent sources.
   - Flags contradictions, unsupported statements, and outdated claims.
   - Calculates the **Research Quality Score (RQS)** and assigns verified status (`VERIFIED`, `PARTIALLY_VERIFIED`, `DISPUTED`, `UNVERIFIED`, `INSUFFICIENT_EVIDENCE`).

7. **Strategy Agent:**
   - Synthesizes verified claims into strategic, actionable recommendations.
   - Produces risk assessments, resource estimates, and chronological execution roadmaps.
   - Assigns risk levels (`LOW`, `MEDIUM`, `HIGH`) to proposed actions.

8. **Execution Agent:**
   - Executes approved tasks only.
   - Generates production deliverables (Excel models, PDF summaries, Word docs, PowerPoint decks, Plotly charts).
   - Validates generated outputs against expected schemas before final delivery.

---

## 3. Evidence-to-Action Ledger (EAL)

The Evidence-to-Action Ledger is BAN KAI's signature differentiator: it guarantees mathematical and relational traceability for every output.

```mermaid
classDiagram
    class UserObjective {
        +UUID id
        +String title
        +String description
        +DateTime created_at
    }

    class ResearchTask {
        +UUID id
        +UUID objective_id
        +String agent_type
        +String task_description
        +String status
    }

    class SourceRecord {
        +UUID id
        +String url
        +String title
        +String publisher
        +DateTime published_date
        +String content_hash
        +Float reliability_score
    }

    class ResearchClaim {
        +UUID id
        +UUID task_id
        +String claim_text
        +String evidence_excerpt
        +Float confidence_score
        +String verification_status
    }

    class VerificationResult {
        +UUID id
        +UUID claim_id
        +String status
        +String rationale
        +List~UUID~ corroborated_sources
        +List~UUID~ conflicting_sources
    }

    class Recommendation {
        +UUID id
        +String title
        +String details
        +String risk_level
        +List~UUID~ supporting_claim_ids
    }

    class ExecutionPlan {
        +UUID id
        +UUID recommendation_id
        +String action_type
        +JSON params
        +String approval_status
    }

    class ExecutionAction {
        +UUID id
        +UUID plan_id
        +String tool_used
        +String output_path
        +String execution_status
        +JSON audit_log
    }

    UserObjective "1" --> "*" ResearchTask
    ResearchTask "1" --> "*" ResearchClaim
    SourceRecord "1" --> "*" ResearchClaim : cites
    ResearchClaim "1" --> "1" VerificationResult
    VerificationResult "1" --> "*" Recommendation : substantiates
    Recommendation "1" --> "*" ExecutionPlan : generates
    ExecutionPlan "1" --> "*" ExecutionAction : executes
```

---

## 4. Persistent Memory Engine Architecture

The Memory Engine maintains 4 distinct memory tiers:
1. **Session Memory:** Volatile, per-workflow execution state and intermediate message log.
2. **Project Memory:** Persistent context, decisions, and goals specific to a project workspace.
3. **Explicit User Memory:** User preferences, organizational constraints, and persistent guidelines.
4. **Knowledge Memory:** Verified claims, historical research corpora, and cross-project findings stored with vector embeddings for semantic retrieval.

```mermaid
flowchart TD
    InputData["Agent Findings / User Preferences"] --> MemoryEvaluator["Memory Extraction & Relevance Evaluator"]
    MemoryEvaluator -->|Below Threshold| Discard["Drop (Prevents Context Pollution)"]
    MemoryEvaluator -->|High Value| TierRouter{"Classify Tier"}
    
    TierRouter -->|Session| SM["Session State"]
    TierRouter -->|Project| PM["Project Context Table"]
    TierRouter -->|User Prefs| UM["User Preferences Table"]
    TierRouter -->|Verified Knowledge| KM["pgvector Knowledge Embeddings"]
    
    KM --> Deduplication["Deduplication & Similarity Filter (Cosine Distance < 0.15)"]
    Deduplication --> VectorStore[("PostgreSQL + pgvector")]
```

---

## 5. Execution Sandbox & Security Architecture

```mermaid
flowchart LR
    StrategyOutput["Strategy Plan Task"] --> RiskCheck{"Risk Level Assessment"}
    RiskCheck -->|Low: Draft/Read| AutoApproval["Automatic Permission Check"]
    RiskCheck -->|Medium: File Gen| AutoApproval
    RiskCheck -->|High: External API/Email/Data Mod| HumanPrompt["Human Approval UI Gate"]
    
    HumanPrompt -->|User Approves| ExecRouter["Execution Router"]
    AutoApproval --> ExecRouter
    HumanPrompt -->|User Denies| AbortTask["Cancel Execution Task"]

    ExecRouter --> SandboxMode{"Execution Engine Mode"}
    
    subgraph LocalSandbox["BanKai Secure Local Sandbox"]
        AST["Python AST Security Validator\n(Denies os.system, eval, forbidden sys calls)"]
        SubprocessGuard["Restricted Subprocess Runner\n(Timeout: 30s, Memory Limit: 512MB, No Network)"]
        SandboxFS["Isolated Project Scratch Dir"]
        AST --> SubprocessGuard --> SandboxFS
    end

    subgraph E2BMode["E2B Cloud Sandbox (Optional)"]
        E2BVM["Isolated Micro-VM"]
    end

    SandboxMode -->|Local Mode| AST
    SandboxMode -->|Cloud Mode| E2BVM
    
    LocalSandbox --> ArtifactManager["Artifact Validator & Generator\n(XLSX, DOCX, PPTX, PDF, CSV)"]
    E2BMode --> ArtifactManager
    ArtifactManager --> EALAuditLog["Append to EAL Audit Trail"]
```

---

## 6. Real-time Event Streaming Architecture

```mermaid
sequenceDiagram
    participant UI as Next.js UI / React Flow
    participant API as FastAPI SSE / WS Gateway
    participant Orchestrator as LangGraph Orchestrator
    participant Agent as Specialized Agent
    participant DB as PostgreSQL

    UI->>API: Connect to /api/v1/events/stream?project_id={id}
    API-->>UI: EventSource Connected (HTTP 200 chunked)
    
    UI->>API: POST /api/v1/workflows/run {objective}
    API->>Orchestrator: Dispatch workflow graph
    
    Orchestrator->>API: emit("agent.started", {agent: "Orchestrator", task: "Decomposing"})
    API-->>UI: data: {"event": "agent.started", "agent": "Orchestrator"}
    
    Orchestrator->>Agent: Run Research Agent
    Agent->>API: emit("research.source_found", {url: "...", title: "..."})
    API-->>UI: data: {"event": "research.source_found", "url": "..."}
    
    Agent->>API: emit("research.claim_extracted", {claim: "..."})
    API-->>UI: data: {"event": "research.claim_extracted", "claim": "..."}
    
    Orchestrator->>API: emit("approval.required", {plan_id: "...", risk: "HIGH"})
    API-->>UI: data: {"event": "approval.required", "plan_id": "..."}
    
    UI->>API: POST /api/v1/workflows/{id}/approve {approved: true}
    API->>Orchestrator: Resume graph with approval
    
    Orchestrator->>API: emit("execution.completed", {artifact_url: "..."})
    API-->>UI: data: {"event": "execution.completed", "artifact_url": "..."}
```

# BAN KAI REST API Reference

Base URL: `http://localhost:8000/api/v1`

---

## 1. Authentication (`/auth`)
- `POST /auth/register`: Register new user account.
- `POST /auth/login`: Authenticate credentials, receive JWT Bearer token.
- `GET /auth/me`: Retrieve authenticated user profile.

## 2. Projects (`/projects`)
- `GET /projects`: List all workspace projects owned by the user.
- `POST /projects`: Create a new research workspace project.
- `GET /projects/{id}`: Retrieve detailed project metrics and counts.
- `PUT /projects/{id}`: Update project title, description, or settings.
- `DELETE /projects/{id}`: Cascade delete project workspace.

## 3. Workflows (`/workflows`)
- `POST /workflows/run`: Dispatch LangGraph multi-agent orchestration for an objective.
- `GET /workflows/{id}`: Fetch live workflow state and pending approvals.
- `POST /workflows/{id}/approve`: Submit human decision for high-risk plans.

## 4. Evidence-to-Action Ledger (`/eal`)
- `GET /eal/{project_id}`: Retrieve full relational lineage graph (nodes and edges).
- `GET /eal/{project_id}/score`: Retrieve Research Quality Score (RQS) breakdown.

## 5. Research Engine (`/research`)
- `POST /research/search`: Run direct web search query.
- `GET /research/claims`: List extracted factual claims for a project.
- `GET /research/sources`: List primary sources and reliability ratings.

## 6. Execution & Sandbox (`/execution`)
- `POST /execution/sandbox`: Execute Python code in isolated AST sandbox.
- `GET /execution/artifacts`: List generated deliverable files for a project.
- `GET /execution/artifacts/{id}/download`: Download generated file (`.xlsx`, `.docx`, `.pptx`, `.pdf`, `.html`).
- `GET /execution/plans`: List execution plans for a project.

## 7. Memory Engine (`/memory`)
- `POST /memory`: Create explicit memory item.
- `POST /memory/query`: Perform pgvector semantic similarity search.
- `GET /memory`: List memories filtered by project or tier.
- `DELETE /memory/{id}`: Delete specific memory item.

## 8. Real-time Events (`/events`)
- `GET /events/stream?project_id={id}`: Server-Sent Events (SSE) live telemetry stream.


# BAN KAI Architecture Decision Records (ADR)

---

## ADR 1: LangGraph as Core Multi-Agent Orchestrator
- **Status:** Accepted
- **Context:** Need a stateful, cyclical, deterministic multi-agent state machine with persistence and human-in-the-loop branching.
- **Decision:** Adopted LangGraph `StateGraph` over CrewAI and AutoGen due to strict typed state schemas, time-travel checkpoints, and predictable acyclic/cyclic routing without unbounded conversational loops.

---

## ADR 2: PostgreSQL with pgvector for Unified Persistence
- **Status:** Accepted
- **Context:** High-integrity relational tracking required for the Evidence-to-Action Ledger (EAL) alongside vector embeddings for memory.
- **Decision:** Adopted PostgreSQL 16 + pgvector rather than separate standalone vector databases (e.g. Pinecone/Chroma) to ensure ACID transactional integrity between research sources, claims, and embeddings.

---

## ADR 3: Dual-Layer Code Execution Sandbox
- **Status:** Accepted
- **Context:** Agents generate Python code for statistical modeling and financial analysis. Executing arbitrary code in the main web server process is unacceptable.
- **Decision:** Implemented an in-process AST security validator blocking forbidden modules and system calls, followed by subprocess isolation with timeouts and memory limits. Cloud E2B integration supported via adapter when configured.

---

## ADR 4: Next.js 15 App Router & React Flow for Frontend
- **Status:** Accepted
- **Context:** Requires a minimal, dark graphite SaaS interface with live interactive workflow graphing.
- **Decision:** Selected Next.js 15 with React Flow (`@xyflow/react`), Tailwind CSS, and TanStack Query, connecting to backend real-time Server-Sent Events (SSE).

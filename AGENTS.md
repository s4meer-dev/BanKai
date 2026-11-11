# AGENTS.md

This project is configured with the unified elite engineering skill suites, plugins, and agent personas from:
- **Addy Osmani** (`addyosmani/agent-skills`): Senior production engineering, performance, clean UI, code simplification, security, and verification.
- **Matt Pocock** (`mattpocock/skills`): Real engineering, domain modeling, codebase design, deep modules, test-driven development, and architectural rigor.
- **Understand Anything** (`Egonex-AI/Understand-Anything`): Multi-agent codebase analysis, interactive architecture knowledge graphs, onboarding tours, and diff analysis.
- **Agentic Awesome Skills (AAS)** (`sickn33/agentic-awesome-skills`): AI agents & MCP building, RAG engineering, modern stack patterns (Next.js, React, Tailwind, Shadcn, PostgreSQL), and on-demand discovery across 2,955+ skills.

Whenever any AI coding agent (Antigravity, Claude Code, Cursor, Codex, Copilot) works in this repository, it MUST adhere to this skill-driven execution standard.

---

## 1. Core Engineering Philosophy: Real Engineering, Zero Vibe Coding

1. **No Vibe Coding:** Never guess, assume, or hallucinate implementations. Always anchor work in specifications, tests, and domain models.
2. **Human-Crafted Minimalism:** UIs must look like tools built by world-class designers (Linear, Raycast, Vercel aesthetic) — pitch-black zinc (`#09090b`), clean borders (`#27272a`), crisp white primary actions, and zero generic neon AI gradients or badge clutter.
3. **Deep Modules & Low Coupling:** Keep interfaces simple and implementations rich. Avoid sprawling shallow wrappers.
4. **Architectural Comprehension:** Always understand before modifying. Use `understand`, `understand-explain`, and `understand-diff` to map dependencies and evaluate impact.
5. **Defensive Verification:** Code is not complete because it compiles. Code is complete only when unit, integration, and security checks pass with zero warnings.

---

## 2. Intent → Skill Execution Matrix

When addressing user requests, automatically activate the corresponding skill from `.agents/skills/`:

| User Intent / Task | Primary Skill | Supporting Skill | Output & Exit Criteria |
| :--- | :--- | :--- | :--- |
| **Codebase Exploration & Architecture** | `understand`, `understand-explain` | `architecture-analyzer`, `tour-builder` | Interactive knowledge graph, component dependency map |
| **Domain & Data Modeling** | `domain-modeling`, `understand-domain` | `database-architect`, `sql-pro` | Rich algebraic types, state machines, clean relational schema |
| **New Feature / Epic** | `spec-driven-development` | `to-spec`, `grill-me`, `ai-agents-architect` | Written specification with acceptance criteria before any code |
| **Task Breakdown & Planning** | `planning-and-task-breakdown` | `to-tickets`, `aas-compose-stack` | Phased roadmap with verification gates |
| **AI Agents & MCP Development** | `ai-agents-architect`, `mcp-builder` | `mcp-tool-developer`, `rag-engineer`, `langgraph` | Tested tools, type-safe schemas, sandboxed execution |
| **Frontend & UI Work** | `frontend-ui-engineering`, `ui-ux-pro-max` | `react-best-practices`, `shadcn`, `tailwind-patterns` | Minimalist layout, zero neon gradients, accessible, responsive |
| **Building / Writing Code** | `incremental-implementation` | `implement-spec`, `nextjs-app-router-patterns` | Small atomic commits, continuous compilation |
| **Testing & Test Suites** | `tdd`, `test-driven-development` | `agent-evaluation`, `browser-testing-with-devtools` | Red-Green-Refactor, edge cases covered, zero mocks where real works |
| **Bug / Failure / Error** | `diagnosing-bugs` | `debugging-and-error-recovery` | Root-cause hypothesis test, reproduction test before fix |
| **Diff & Impact Analysis** | `understand-diff` | `assemble-reviewer`, `graph-reviewer` | Verified architectural blast radius before merging |
| **Refactoring & Anti-Bloat** | `code-simplification` | `improve-codebase-architecture` | Reduced line count, eliminated indirection, cleaner abstractions |
| **Security & Hardening** | `security-and-hardening` | `api-security-best-practices`, `auth-implementation-patterns` | AST guard verification, prompt injection defense, sanitized I/O |
| **Performance & Latency** | `performance-optimization` | `sql-optimization-patterns`, `web-performance-auditor` | Profiling metrics, optimized queries, bundle analysis |
| **Code Review & Pre-PR** | `code-review`, `code-reviewer` | `code-review-and-quality`, `pr` | 5-dimension review (Correctness, Readability, Architecture, Security, Perf) |
| **Catalog Discovery (2,955+ Skills)** | `aas-discover` | `aas-compose-stack`, `aas-review-stack` | On-demand skill inspection from `.agents/aas/` |
| **Release & Deployment** | `shipping-and-launch` | `docker-expert`, `ci-cd-and-automation` | Smoke test verification, Docker containers, zero build errors |

---

## 3. Mandatory Lifecycle & Verification Loop

Every significant coding milestone must follow this continuous lifecycle:

```text
UNDERSTAND (understand / understand-explain)
   │
   ▼
SPECIFY (to-spec / spec-driven-development)
   │
   ▼
PLAN (planning-and-task-breakdown / aas-compose-stack)
   │
   ▼
BUILD & TEST (incremental-implementation + tdd)
   │
   ▼
SIMPLIFY (code-simplification)
   │
   ▼
REVIEW & HARDEN (code-review + security-and-hardening + understand-diff)
   │
   ▼
SHIP (shipping-and-launch + docker-expert)
```

---

## 4. Anti-Rationalization Rules

The following thoughts are engineering failure modes and MUST be rejected:

- ❌ *"This change is too simple to need a test."* &rarr; **Write the test.** Simple changes break silently.
- ❌ *"I'll implement the code first and write the spec later."* &rarr; **Write the spec first.** Coding without a spec creates rework.
- ❌ *"Let me add this helper just in case we need it later."* &rarr; **YAGNI.** Delete speculative code immediately (`code-simplification`).
- ❌ *"I'll add colorful gradients and glowing badges so the UI looks modern."* &rarr; **Never.** Maintain restrained, professional, minimalist monochrome styling (`frontend-ui-engineering`).
- ❌ *"I know what caused the error, let me quickly change this line."* &rarr; **Diagnose systematically.** Form a hypothesis, reproduce it, then fix the root cause (`diagnosing-bugs`).
- ❌ *"I will guess how this module connects to the rest of the app."* &rarr; **Use Understand Anything.** Generate the dependency graph with `understand` or inspect with `understand-explain`.

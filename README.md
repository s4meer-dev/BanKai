# Unified Agent Skills & Intelligence Foundation

A production-grade, multi-agent development foundation uniting four industry-standard skill suites, plugins, and agent personas:
- **Addy Osmani** ([`addyosmani/agent-skills`](https://github.com/addyosmani/agent-skills)) — Senior production engineering, performance, clean UI, code simplification, security, and verification.
- **Matt Pocock** ([`mattpocock/skills`](https://github.com/mattpocock/skills)) — Real engineering, domain modeling, codebase design, deep modules, test-driven development, and architectural rigor.
- **Understand Anything** ([`Egonex-AI/Understand-Anything`](https://github.com/Egonex-AI/Understand-Anything)) — Multi-agent codebase comprehension, interactive knowledge graphs, file tours, diff impact analysis, and domain extraction.
- **Agentic Awesome Skills (AAS)** ([`sickn33/agentic-awesome-skills`](https://github.com/sickn33/agentic-awesome-skills)) — AI agents & MCP building, RAG engineering, modern full-stack patterns (Next.js, React, Tailwind, Shadcn, PostgreSQL), and on-demand discovery across 2,955+ skills.

---

## Workspace Architecture

```text
├── .agents/
│   ├── agents/                     # 14 Staff Agent Personas
│   │   ├── architecture-analyzer.md# System architecture & topology
│   │   ├── code-reviewer.md        # Staff-level 5D code review
│   │   ├── domain-analyzer.md      # Business domain & state machines
│   │   ├── security-auditor.md     # AST security & threat modeling
│   │   ├── test-engineer.md        # Comprehensive test matrices
│   │   ├── tour-builder.md         # Guided onboarding & module tours
│   │   ├── web-performance-auditor.md # Core Web Vitals & payload profiling
│   │   └── ... (7 more personas)
│   │
│   ├── skills/                     # 102 Active Playbooks
│   │   ├── [Understand Anything]   # understand, understand-chat, understand-diff, understand-domain, understand-explain...
│   │   ├── [AAS Modern Stack]      # ai-agents-architect, mcp-builder, rag-engineer, langgraph, react-best-practices, nextjs-app-router-patterns, shadcn, tailwind-patterns, ui-ux-pro-max...
│   │   ├── [Addy Osmani Suite]     # frontend-ui-engineering, code-simplification, spec-driven-development, security-and-hardening, performance-optimization...
│   │   └── [Matt Pocock Suite]     # codebase-design, domain-modeling, diagnosing-bugs, improve-codebase-architecture, tdd, grill-me...
│   │
│   ├── plugins/                    # Integrated Plugins
│   │   ├── understand-anything/    # Codebase knowledge graph generator, parser, AST analysis, visual dashboard
│   │   └── aas-plugin/             # Local discovery engine for 2,955+ skills
│   │
│   └── aas/                        # Local Catalog Database
│       ├── catalog.json            # 2,955 indexed playbooks
│       ├── skills_index.json       # Fast keyword index
│       └── editorial-bundles.json  # Curated capability bundles
│
├── AGENTS.md                       # Intent → Skill execution matrix & anti-rationalization rules
├── GEMINI.md                       # Antigravity agent configuration
├── README.md                       # Foundation documentation
└── .gitignore                      # Safe ignores tracking .agents/
```

---

## Core Capabilities

### 1. Codebase Comprehension (Understand Anything)
- **Interactive Knowledge Graphs (`/understand`):** Analyzes any repository to generate dependency and topology graphs in `.ua/knowledge-graph.json`.
- **Architectural Walkthroughs (`/understand-onboard`):** Automatically synthesizes step-by-step onboarding tours.
- **Diff Blast-Radius Analysis (`/understand-diff`):** Examines git diffs to forecast architectural impact and breaking changes before merging.
- **Deep Code Explanation (`/understand-explain`):** Explains functions and modules with visual context.

### 2. Modern Full-Stack & AI Engineering (AAS)
- **AI Agent & MCP Tooling:** Build Model Context Protocol tools, LangGraph workflows, RAG pipelines, and agent memory with `ai-agents-architect` and `mcp-builder`.
- **Clean Next.js & React:** Enforce idiomatic App Router patterns, server components, and clean state with `nextjs-app-router-patterns` and `react-best-practices`.
- **Human-Crafted Minimalist UI:** Zero neon AI noise; sleek pitch-black zinc aesthetic using `frontend-ui-engineering`, `ui-ux-pro-max`, and `shadcn`.
- **Database Architecture:** Optimized PostgreSQL and relational schemas using `database-architect` and `sql-pro`.

### 3. Real Engineering Discipline (Addy Osmani & Matt Pocock)
- **Spec First:** `spec-driven-development` and `to-spec` define requirements before coding.
- **Interrogative Grilling:** `grill-me` challenges architectural assumptions to eliminate rework.
- **Deep Modules:** `codebase-design` ensures simple interfaces hide rich implementations.
- **Zero-Guesswork Debugging:** `diagnosing-bugs` requires hypothesis formulation and reproduction tests before touching code.
- **Ruthless Simplification:** `code-simplification` cuts bloat and unnecessary abstraction layers.

---

## Autonomous Lifecycle

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

See [`AGENTS.md`](./AGENTS.md) and [`GEMINI.md`](./GEMINI.md) for full configuration details.

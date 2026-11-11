# Skills & Agents Foundation

A modern, production-grade development foundation configured with the complete professional engineering skill suites and agent personas from:
- **Addy Osmani** ([`addyosmani/agent-skills`](https://github.com/addyosmani/agent-skills))
- **Matt Pocock** ([`mattpocock/skills`](https://github.com/mattpocock/skills))

This repository provides an autonomous, real-engineering environment that turns any coding agent (Antigravity, Claude Code, Cursor, Copilot, Codex) into a disciplined senior engineering team.

---

## What is Included

### 1. 64 Engineering Skills (`.agents/skills/`)

#### **Software Architecture & Domain Modeling**
- `codebase-design`: Deep module boundaries, high cohesion, low coupling, avoiding shallow wrappers.
- `domain-modeling`: Expressive types, state machines, algebraic domain definitions.
- `api-and-interface-design`: Clean, ergonomic, type-safe API boundaries.
- `improve-codebase-architecture`: Refactoring spaghetti into modular systems.

#### **Specification & Planning**
- `spec-driven-development` & `to-spec`: Clear requirements and acceptance criteria before writing code.
- `grill-me`, `grilling`, `grill-with-docs`: Interactive architectural stress-testing to eliminate ambiguity.
- `planning-and-task-breakdown` & `to-tickets`: Phased execution roadmaps with verification gates.
- `idea-refine` & `interview-me`: Divergent and convergent ideation to sharpen fuzzy requirements.

#### **Implementation & Quality**
- `incremental-implementation` & `implement-spec`: Thin, verifiable slices with continuous compilation.
- `tdd` & `test-driven-development`: Red-Green-Refactor loop, edge-case coverage, zero mock pollution.
- `code-simplification`: Ruthless elimination of dead code, over-engineering, and premature abstractions.
- `diagnosing-bugs` & `debugging-and-error-recovery`: Scientific hypothesis testing; no blind guesswork.

#### **Frontend & UI Engineering**
- `frontend-ui-engineering`: Minimalist, human-crafted design language (Linear/Raycast aesthetic, dark-mode zinc palette, zero neon AI badge clutter, accessible WCAG standards).
- `browser-testing-with-devtools`: Real-browser profiling, console inspection, visual verification.

#### **Security, Performance & Operations**
- `security-and-hardening`: Defensive boundaries, AST validation, prompt injection defense, sanitized I/O.
- `performance-optimization`: Profiling, Core Web Vitals, query optimization, bundle reduction.
- `observability-and-instrumentation`: Structured logging, tracing, metrics, actionable error reporting.
- `ci-cd-and-automation`, `git-workflow-and-versioning`, `shipping-and-launch`.

---

### 2. Staff Agent Personas (`.agents/agents/`)
- **`code-reviewer.md`**: Evaluates changes across 5 dimensions (Correctness, Readability, Architecture, Security, Performance).
- **`security-auditor.md`**: Dedicated vulnerability detection, threat modeling, and input hardening.
- **`test-engineer.md`**: Comprehensive test matrices, property testing, and regression analysis.
- **`web-performance-auditor.md`**: Core Web Vitals, payload profiling, and rendering latency.

---

## Engineering Lifecycle

All work adheres to the real-engineering loop:

```text
SPECIFY (to-spec / spec-driven-development)
   │
   ▼
PLAN (planning-and-task-breakdown)
   │
   ▼
BUILD & TEST (incremental-implementation + tdd)
   │
   ▼
SIMPLIFY (code-simplification)
   │
   ▼
REVIEW & HARDEN (code-review + security-and-hardening)
   │
   ▼
SHIP (shipping-and-launch)
```

See [`AGENTS.md`](./AGENTS.md) and [`GEMINI.md`](./GEMINI.md) for full configuration details.

# BAN KAI

> **Autonomous Multi-Agent AI Research & Execution Platform**  
> Engineered with the unified skill suites of [Addy Osmani](https://github.com/addyosmani/agent-skills) and [Matt Pocock](https://github.com/mattpocock/skills).

---

## Overview

BAN KAI is an autonomous multi-agent platform designed to convert complex objectives into verified evidence, strategic execution plans, and persistent knowledge deliverables.

The repository is pre-configured with **64 professional engineering skills** and agent personas covering the entire software lifecycle:
- **Specification & Planning:** Spec-driven development, interactive grilling, task breakdown.
- **Architecture & Domain Modeling:** Deep modules, high cohesion, algebraic state modeling.
- **Frontend & UI Engineering:** Minimalist, aesthetic, human-crafted design language (Linear/Raycast aesthetic in monochrome zinc).
- **Test-Driven Development:** Red-Green-Refactor, edge-case hardening, 100% verification.
- **Root-Cause Debugging:** Scientific hypothesis testing, zero guesswork.
- **Security & Hardening:** AST sandboxing, prompt injection defense, boundary validation.
- **Performance & Latency:** Profiling, Core Web Vitals, asynchronous throughput.

---

## Skills Architecture

The repository embeds skills into `.agents/skills/` for universal compatibility across coding agents (Antigravity, Claude Code, Cursor, Codex, Copilot):

### Addy Osmani Engineering Skills (`addyosmani/agent-skills`)
- `api-and-interface-design`
- `browser-testing-with-devtools`
- `ci-cd-and-automation`
- `code-review-and-quality`
- `code-simplification`
- `constraint-driven-development`
- `context-engineering`
- `debugging-and-error-recovery`
- `deprecation-and-migration`
- `documentation-and-adrs`
- `doubt-driven-development`
- `frontend-ui-engineering`
- `git-workflow-and-versioning`
- `idea-refine`
- `incremental-implementation`
- `interview-me`
- `observability-and-instrumentation`
- `performance-optimization`
- `planning-and-task-breakdown`
- `security-and-hardening`
- `shipping-and-launch`
- `source-driven-development`
- `spec-driven-development`
- `test-driven-development`
- `using-agent-skills`

### Matt Pocock Real Engineering Skills (`mattpocock/skills`)
- **Core Engineering:** `codebase-design`, `domain-modeling`, `diagnosing-bugs`, `improve-codebase-architecture`, `tdd`, `to-spec`, `implement-spec`, `to-tickets`, `ask-matt`, `code-review`, `pr`, `prototype`, `research`, `retro`, `triage`, `wayfinder`, `wizard`
- **Productivity & Discovery:** `grill-me`, `grilling`, `grill-with-docs`, `handoff`, `teach`, `to-questionnaire`, `wait-what`, `writing-for-agents`
- **Emerging & Advanced:** `chief-of-staff`, `claude-handoff`, `loop-me`, `setup-ts-deep-modules`, `software-factory`, `writing-beats`, `writing-fragments`, `writing-shape`, `git-guardrails-claude-code`, `setup-pre-commit`

### Agent Personas (`.agents/agents/`)
- `code-reviewer.md` — Staff-level 5-dimensional review (Correctness, Readability, Architecture, Security, Performance).
- `security-auditor.md` — AST security, injection prevention, and privilege boundaries.
- `test-engineer.md` — Test matrix design, edge case generation, and regression suites.
- `web-performance-auditor.md` — Core Web Vitals, network payloads, and rendering latency.

---

## Agent Usage & Guidelines

See [`AGENTS.md`](./AGENTS.md) for the intent-to-skill execution matrix and anti-rationalization guidelines.

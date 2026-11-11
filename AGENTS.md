# AGENTS.md

Welcome to **BanKai**. This project is configured with the combined professional engineering skill suites from:
- **Addy Osmani** (`addyosmani/agent-skills`): Senior production engineering, performance, clean UI, code simplification, security, and verification.
- **Matt Pocock** (`mattpocock/skills`): Real engineering, domain modeling, codebase design, deep modules, test-driven development, and architectural rigor.

Whenever any AI coding agent (Antigravity, Claude Code, Cursor, Codex, Copilot) works in this repository, it MUST adhere to this skill-driven execution standard.

---

## 1. Core Engineering Philosophy: Real Engineering, Zero Vibe Coding

1. **No Vibe Coding:** Never guess, assume, or hallucinate implementations. Always anchor work in specifications, tests, and domain models.
2. **Human-Crafted Minimalism:** UIs must look like tools built by world-class designers (Linear, Raycast, Vercel aesthetic) — pitch-black zinc (`#09090b`), clean borders (`#27272a`), crisp white primary actions, and zero generic neon AI gradients or badge clutter.
3. **Deep Modules & Low Coupling:** Keep interfaces simple and implementations rich. Avoid sprawling shallow wrappers.
4. **Defensive Verification:** Code is not complete because it compiles. Code is complete only when unit, integration, and security checks pass with zero warnings.

---

## 2. Intent → Skill Execution Matrix

When addressing user requests, automatically activate the corresponding skill from `.agents/skills/`:

| User Intent / Task | Primary Skill | Supporting Skill | Output & Exit Criteria |
| :--- | :--- | :--- | :--- |
| **New Feature / Epic** | `spec-driven-development` | `to-spec`, `grill-me` | Written specification with acceptance criteria before any code |
| **Task Breakdown & Planning** | `planning-and-task-breakdown` | `to-tickets` | Phased roadmap with verification gates |
| **Architecture & Structure** | `codebase-design` | `improve-codebase-architecture` | Deep module boundaries, clear dependency flow |
| **Domain & Data Modeling** | `domain-modeling` | `api-and-interface-design` | Expressive TypeScript / Pydantic types, state machines |
| **Frontend & UI Work** | `frontend-ui-engineering` | `code-simplification` | Minimalist layout, zero neon gradients, accessible, responsive |
| **Building / Writing Code** | `incremental-implementation` | `implement-spec` | Small atomic commits, continuous compilation |
| **Testing & Test Suites** | `tdd` | `test-driven-development` | Red-Green-Refactor, edge cases covered, zero mocks where real works |
| **Bug / Failure / Error** | `diagnosing-bugs` | `debugging-and-error-recovery` | Root-cause hypothesis test, reproduction test before fix |
| **Refactoring & Anti-Bloat** | `code-simplification` | `improve-codebase-architecture` | Reduced line count, eliminated indirection, cleaner abstractions |
| **Security & Hardening** | `security-and-hardening` | `code-review-and-quality` | AST guard verification, prompt injection defense, sanitized I/O |
| **Performance & Latency** | `performance-optimization` | `browser-testing-with-devtools` | Profiling metrics, optimized queries, bundle analysis |
| **Code Review & Pre-PR** | `code-review` | `code-review-and-quality`, `pr` | 5-dimension review (Correctness, Readability, Architecture, Security, Perf) |
| **Release & Deployment** | `shipping-and-launch` | `ci-cd-and-automation` | Smoke test verification, changelog, zero build errors |

---

## 3. Mandatory Lifecycle & Verification Loop

Every significant coding milestone must follow this continuous lifecycle:

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

---

## 4. Anti-Rationalization Rules

The following thoughts are engineering failure modes and MUST be rejected:

- ❌ *"This change is too simple to need a test."* &rarr; **Write the test.** Simple changes break silently.
- ❌ *"I'll implement the code first and write the spec later."* &rarr; **Write the spec first.** Coding without a spec creates rework.
- ❌ *"Let me add this helper just in case we need it later."* &rarr; **YAGNI.** Delete speculative code immediately (`code-simplification`).
- ❌ *"I'll add colorful gradients and glowing badges so the UI looks modern."* &rarr; **Never.** Maintain restrained, professional, minimalist monochrome styling (`frontend-ui-engineering`).
- ❌ *"I know what caused the error, let me quickly change this line."* &rarr; **Diagnose systematically.** Form a hypothesis, reproduce it, then fix the root cause (`diagnosing-bugs`).

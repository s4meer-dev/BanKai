# GEMINI.md

# Antigravity Agent Configuration

This project is governed by the engineering principles and skills defined in [`AGENTS.md`](./AGENTS.md).

## Discovered Customization Directories
- Skills: `.agents/skills/` (102 active skills)
- Staff Agent Personas: `.agents/agents/` (14 personas)
- Plugins: `.agents/plugins/` (`understand-anything`, `aas-plugin`)
- Catalog: `.agents/aas/` (2,955 skills database)

## Installed Agent Personas (`.agents/agents/`)
- `architecture-analyzer.md` — High-level system architecture and module topology analysis.
- `article-analyzer.md` — Research and technical documentation synthesis.
- `assemble-reviewer.md` — Multi-module integration and boundary review.
- `code-reviewer.md` — Staff-level 5-dimensional review (Correctness, Readability, Architecture, Security, Performance).
- `design-analyzer.md` — UI/UX system and component architecture review.
- `domain-analyzer.md` — Business domain entities, workflows, and state modeling.
- `file-analyzer.md` — Granular file-level AST and dependency analysis.
- `graph-reviewer.md` — Knowledge graph integrity and validation.
- `knowledge-graph-guide.md` — Interactive navigation through the codebase knowledge graph.
- `project-scanner.md` — Automated codebase discovery and tech stack detection.
- `security-auditor.md` — Vulnerability detection, AST guard validation, and threat modeling.
- `test-engineer.md` — QA test strategy, edge case coverage, and regression analysis.
- `tour-builder.md` — Automated guided architectural walkthroughs.
- `web-performance-auditor.md` — Core Web Vitals, bundle optimization, and rendering latency.

## Autonomous Workflow Instructions
1. Always consult the matching skill in `.agents/skills/<skill-name>/SKILL.md` before starting tasks.
2. Maintain clean architecture, deep modules, and rigorous test coverage.
3. Keep frontend user interfaces minimal, aesthetic, high-contrast monochrome (zinc/black/white), and free of noisy AI templates.
4. Ensure all changes compile cleanly with zero errors before committing to GitHub.

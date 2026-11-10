# BAN KAI Controlled Execution Engine

BAN KAI guarantees that untrusted, AI-generated code and high-risk actions never execute unsafely on the host system.

---

## 1. Execution Architecture & Risk Gating

```mermaid
flowchart TD
    Plan["Strategy Execution Plan"] --> RiskTier{"Risk Level Evaluation"}
    
    RiskTier -->|LOW: Draft / Read Public Info| AutoApprove["Auto-Approve"]
    RiskTier -->|MEDIUM: Compile Deliverables| AutoApprove
    RiskTier -->|HIGH: External API, DB Mutation, Network| HumanGate["Human Approval UI Gate"]
    
    HumanGate -->|User Rejects| Abort["Cancel Task"]
    HumanGate -->|User Approves| ExecRouter["Execution Router"]
    AutoApprove --> ExecRouter
    
    subgraph Sandbox["Isolated Execution Sandbox"]
        AST["1. AST Security Inspection\n(Forbids os.system, eval, exec, socket, subprocess)"]
        Subprocess["2. Subprocess Isolation\n(30s Timeout, 512MB RAM cap, Scratch Dir)"]
        AST --> Subprocess
    end

    ExecRouter --> Sandbox
    Sandbox --> Artifacts["Artifact Generators\n(Excel, Word, PPTX, PDF, HTML)"]
    Artifacts --> Ledger["Register in EAL Audit Ledger"]
```

---

## 2. Supported Deliverable Formats

1. **Excel Financial Workbooks (`.xlsx`):** Formatted headers, currency styling, formula projections via `openpyxl`.
2. **Research Dossiers (`.docx`):** Publication typography, empirical evidence citations via `python-docx`.
3. **Executive Presentations (`.pptx`):** Multi-slide corporate briefings via `python-pptx`.
4. **Publication Reports (`.pdf`):** Tables, quality metrics, and evidence tables via `reportlab`.
5. **Interactive Visualizations (`.html`):** Dynamic responsive bar and scatter plots via `plotly`.


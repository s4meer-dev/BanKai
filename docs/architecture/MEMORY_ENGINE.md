# BAN KAI Persistent Memory Engine

BAN KAI employs a 4-tier persistent memory architecture combining relational metadata and pgvector semantic retrieval.

---

## 1. Memory Tier Partitioning

```mermaid
flowchart TD
    subgraph Tiers["Memory Tier Classification"]
        T1["Session Memory\n(Active workflow state, volatile)"]
        T2["Project Memory\n(Workspace decisions, deliverables)"]
        T3["User Memory\n(Cross-project preferences, constraints)"]
        T4["Knowledge Memory\n(Global verified claims, corporate facts)"]
    end

    Input["New Fact / Decision"] --> Filter{"Relevance Filter"}
    Filter -->|Low Value Chatter| Discard["Drop"]
    Filter -->|High Value| Dedup{"Cosine Deduplication\n(Similarity > 0.85)"}
    Dedup -->|Duplicate| Update["Update Existing Memory"]
    Dedup -->|Novel Fact| Tiers
    Tiers --> VectorIndex[("PostgreSQL + pgvector")]
```

---

## 2. Deduplication & Semantic Search

- **Embedding Model:** OpenAI `text-embedding-3-small` (or local deterministic vector representation fallback).
- **Metric:** Cosine distance over normalized 128-dim or 1536-dim vector arrays.
- **Deduplication Threshold:** If an incoming memory key/content matches an existing record in the same project/tier with similarity $\ge 0.85$, the existing record is updated in place to prevent database pollution.


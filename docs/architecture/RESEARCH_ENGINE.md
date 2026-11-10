# BAN KAI Unified Research Engine

The Unified Research Engine executes an autonomous 13-step intelligence gathering lifecycle.

---

## 1. Research Lifecycle Flow

```mermaid
flowchart TD
    Q0["1. Understand Objective"] --> Q1["2. Generate Multi-Hop Sub-Queries"]
    Q1 --> Q2["3. Identify Information Gaps"]
    Q2 --> Q3["4. Select Search Provider\n(DuckDuckGo, SearXNG, Tavily)"]
    Q3 --> Q4["5. Concurrent Search Execution"]
    Q4 --> Q5["6. Deduplicate URLs & Domains"]
    Q5 --> Q6["7. Concurrent Web Crawling & DOM Sanitization"]
    Q6 --> Q7["8. Compute SHA-256 Provenance Hash"]
    Q7 --> Q8["9. Extract Atomic Claims with Citations"]
    Q8 --> Q9["10. Associate Claims with Primary Sources"]
    Q9 --> Q10["11. Adversarial Verification & Contradiction Resolution"]
    Q10 --> Q11["12. Calculate Research Quality Score (RQS)"]
    Q11 --> Q12["13. Publish Real-time SSE Events & Persist in EAL"]
```

---

## 2. Research Quality Score (RQS) Methodology

The **Research Quality Score** is an empirical composite index ($0.0 \dots 100.0$) evaluated as:

$$\text{RQS} = (C \times 20.0) + (R \times 30.0) + (V \times 35.0) + (D \times 15.0)$$

Where:
- $C$: **Citation Coverage** (Ratio of claims linked directly to source URLs)
- $R$: **Mean Source Reliability** (Publisher integrity and domain reputation metrics)
- $V$: **Verification Rate** (Ratio of corroborated to unverified assertions)
- $D$: **Contradiction Resolution Rate** (Penalty for unreconciled conflicting statements)


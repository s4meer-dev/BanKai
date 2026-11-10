# BAN KAI Security Model & Threat Architecture

BAN KAI implements defense-in-depth across authentication, code execution, input sanitization, and database isolation.

---

## 1. Threat Mitigation Matrix

| Attack Vector | Threat Level | Defense Architecture |
| :--- | :--- | :--- |
| **Arbitrary Code Execution** | Critical | Dual-layer AST security visitor blocking `os`, `sys`, `subprocess`, `socket`, `eval`, `exec`; isolated subprocess with memory and timeout caps. |
| **Prompt Injection via Web Scraping** | High | DOM tree sanitization via BeautifulSoup; raw scraped HTML is treated strictly as untrusted string data and never concatenated into system instructions. |
| **Unauthorized Action Execution** | High | Human-in-the-loop approval gate for any task classified with `HIGH` risk level. |
| **Secret & Credential Leakage** | Critical | Environment variables are isolated; `.env` excluded from version control; frontend bundles communicate strictly via backend gateway proxies. |
| **Credential Attacks & Hijacking** | High | Direct bcrypt password hashing with salt; JWT tokens signed with HS256 and expiry enforcement. |
| **Denial of Service via Loops** | Medium | LangGraph `recursion_limit` and `MAX_ORCHESTRATION_CYCLES` deterministic ceilings. |


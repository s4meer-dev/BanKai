# BAN KAI Security Model & Threat Architecture

BAN KAI implements defense-in-depth across authentication, code execution, input sanitization, adversarial prompt injection defense, and database isolation.

---

## 1. Threat Mitigation Matrix

| Attack Vector | Threat Level | Defense Architecture |
| :--- | :--- | :--- |
| **Arbitrary Code Execution** | Critical | Dual-layer AST security visitor blocking `os`, `sys`, `subprocess`, `socket`, `eval`, `exec`, `importlib`, `pathlib`, network egress modules (`requests`, `httpx`, `urllib`); attribute access blocking on dunder properties (`__subclasses__`, `__bases__`, `__mro__`, `__globals__`, `__builtins__`); isolated subprocess with sanitized environment and timeout caps. |
| **Prompt Injection via Web Scraping** | High | Multi-regex adversarial payload filter in `ClaimExtractor` neutralizing instruction hijacking (`ignore previous instructions`, `system override`, `developer mode`, `<script>`, `onerror=`); DOM tree sanitization via BeautifulSoup. |
| **Unauthorized Action Execution** | High | Human-in-the-loop approval gate for any task classified with `HIGH` risk level before execution. |
| **Secret & Credential Leakage** | Critical | Stripped subprocess environment prevents child processes from inheriting backend secrets (`DATABASE_URL`, API keys); `.env` strictly excluded from git. |
| **Credential Attacks & Hijacking** | High | Direct bcrypt password hashing with salt and 72-byte safe truncation; JWT tokens signed with HS256 and expiry enforcement. |
| **Denial of Service via Loops** | Medium | LangGraph `iteration_count < max_iterations` deterministic ceiling preventing infinite cyclical loops in `verification_router`. |

---

## 2. AST Sandbox Defense Architecture

The `ASTSecurityGuard` validates all code prior to execution using `ast.parse` and a custom `SecurityVisitor`:
1. **Forbidden Module Imports:** Prohibits `os`, `sys`, `subprocess`, `socket`, `shutil`, `ctypes`, `pickle`, `importlib`, `pathlib`, `urllib`, `requests`, `httpx`, and related system libraries.
2. **Forbidden Function Invocations:** Prohibits direct or dynamic execution calls (`eval`, `exec`, `open`, `compile`, `__import__`, `globals`, `locals`, `getattr`, `setattr`).
3. **MRO & Subclass Gadget Traversal Blocking:** Traverses all `ast.Attribute` nodes and blocks access to `__subclasses__`, `__bases__`, `__mro__`, `__globals__`, `__code__`, and `__builtins__`.
4. **Child Process Environment Sanitization:** Execution subprocesses run with an isolated dictionary containing only standard OS system roots (`SYSTEMROOT`, `PATH`, `WINDIR`, `TEMP`), completely withholding backend environment secrets.

---

## 3. Adversarial Prompt Injection Defense

Web sources fetched by `WebCrawler` are parsed into atomic factual sentences by `ClaimExtractor`. Every sentence is filtered through `ADVERSARIAL_INJECTION_PATTERNS`:
- Automatically neutralizes attempts to override system prompts or declare developer mode.
- Drops injection attempts containing SQL drop commands or system format commands.
- Strips residual HTML/JavaScript tags to guarantee zero XSS execution in downstream PDF, Word, and HTML deliverables.

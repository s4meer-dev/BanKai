"""Factual claim extraction, sanitization, and prompt-injection defense engine."""

import html
import re
import uuid
from typing import Dict, List
from app.core.logging import logger


class ClaimExtractor:
    """Extracts atomic factual claims from source texts with evidence excerpts and adversarial filtering."""

    ADVERSARIAL_INJECTION_PATTERNS = [
        re.compile(r"ignore\s+(all|the|previous|prior|above)\s+(instructions|prompts|rules|commands)", re.IGNORECASE),
        re.compile(r"system\s+override", re.IGNORECASE),
        re.compile(r"developer\s+mode", re.IGNORECASE),
        re.compile(r"you\s+are\s+now\s+(an?\s+unrestricted|a\s+new|dan)", re.IGNORECASE),
        re.compile(r"(format\s+[a-z]:|rm\s+-rf|drop\s+database|drop\s+table)", re.IGNORECASE),
        re.compile(r"(<script|javascript:|onerror=|onload=)", re.IGNORECASE),
        re.compile(r"disregard\s+safety\s+guidelines", re.IGNORECASE),
    ]

    def extract_claims(self, source_record: dict) -> List[Dict]:
        """Parses source text into distinct claims associated with evidence excerpts, sanitizing adversarial payloads."""
        content = source_record.get("content", "")
        url = source_record.get("url", "")
        title = source_record.get("title", "")
        publisher = source_record.get("publisher", "Web Source")

        if not content:
            return []

        # Split into sentences or key bullet points
        sentences = re.split(r"(?<=[.!?])\s+", content)
        claims: List[Dict] = []

        # Filter informative sentences with empirical or factual statements
        informative_keywords = [
            "growth", "rate", "percent", "%", "market", "latency", "benchmark",
            "increase", "decrease", "users", "million", "billion", "framework",
            "architecture", "cost", "compliance", "standard", "requirement", "efficiency",
            "feature", "support", "scale", "performance", "result", "analysis", "verified"
        ]

        seen_claims = set()
        for s in sentences:
            s_clean = html.unescape(s.strip())
            # Strip residual HTML tags to prevent XSS injection
            s_clean = re.sub(r"<[^>]+>", "", s_clean).strip()

            # Security: Prompt Injection Guard
            if self._is_adversarial_injection(s_clean):
                logger.warning(f"Adversarial prompt-injection attempt detected and neutralized from {url}: {s_clean[:80]}...")
                continue

            # Require minimum length and factual keyword or numeric data
            if len(s_clean) >= 40 and len(s_clean) <= 400:
                has_keyword = any(kw in s_clean.lower() for kw in informative_keywords)
                has_numbers = bool(re.search(r"\d+", s_clean))
                if (has_keyword or has_numbers) and s_clean not in seen_claims:
                    seen_claims.add(s_clean)

                    # Estimate initial confidence based on source reliability and specificity
                    reliability = source_record.get("reliability_score", 0.7)
                    specificity_bonus = 0.1 if has_numbers else 0.0
                    confidence = round(min(0.98, max(0.40, reliability + specificity_bonus)), 2)

                    claims.append({
                        "id": str(uuid.uuid4()),
                        "claim_text": s_clean,
                        "evidence_excerpt": s_clean,
                        "source_url": url,
                        "source_title": title,
                        "publisher": publisher,
                        "confidence_score": confidence,
                        "verification_status": "UNVERIFIED",
                    })

            if len(claims) >= 6:  # Up to 6 atomic claims per source
                break

        # Fallback if no specific sentences matched
        if not claims and len(content) > 30:
            first_sentence = sentences[0].strip() if sentences else content[:150]
            first_clean = html.unescape(first_sentence)
            first_clean = re.sub(r"<[^>]+>", "", first_clean).strip()

            if not self._is_adversarial_injection(first_clean):
                claims.append({
                    "id": str(uuid.uuid4()),
                    "claim_text": first_clean,
                    "evidence_excerpt": first_clean,
                    "source_url": url,
                    "source_title": title,
                    "publisher": publisher,
                    "confidence_score": 0.50,
                    "verification_status": "UNVERIFIED",
                })

        logger.info(f"Extracted {len(claims)} sanitized claims from source {url}")
        return claims

    def _is_adversarial_injection(self, text: str) -> bool:
        """Evaluates whether candidate text contains prompt injection or adversarial jailbreak triggers."""
        for pattern in self.ADVERSARIAL_INJECTION_PATTERNS:
            if pattern.search(text):
                return True
        return False


claim_extractor = ClaimExtractor()

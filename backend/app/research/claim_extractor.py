"""Factual claim extraction and citation association engine."""

import re
import uuid
from typing import Dict, List
from app.core.logging import logger


class ClaimExtractor:
    """Extracts atomic factual claims from source texts with evidence excerpts."""

    def extract_claims(self, source_record: dict) -> List[Dict]:
        """Parses source text into distinct claims associated with evidence excerpts."""
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
            s_clean = s.strip()
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
            claims.append({
                "id": str(uuid.uuid4()),
                "claim_text": first_sentence,
                "evidence_excerpt": first_sentence,
                "source_url": url,
                "source_title": title,
                "publisher": publisher,
                "confidence_score": 0.50,
                "verification_status": "UNVERIFIED",
            })

        logger.info(f"Extracted {len(claims)} claims from source {url}")
        return claims


claim_extractor = ClaimExtractor()

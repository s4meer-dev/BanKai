"""Unified Research Engine executing research lifecycle, extraction, and persistence."""

import asyncio
from typing import Dict, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.logging import logger
from app.models.research_claim import ResearchClaim
from app.models.research_source import ResearchSource
from app.orchestrator.event_bus import event_bus
from app.research.claim_extractor import claim_extractor
from app.research.crawler import crawler
from app.research.search_providers import get_search_provider


class ResearchEngine:
    """Coordinates search, scraping, claim extraction, deduplication, and database persistence."""

    def __init__(self, provider_name: Optional[str] = None) -> None:
        self.search_provider = get_search_provider(provider_name)

    async def execute_research(
        self,
        project_id: str,
        workflow_id: str,
        queries: List[str],
        db: Optional[AsyncSession] = None,
        task_id: Optional[str] = None,
    ) -> Dict:
        """Executes full research cycle for given queries, extracts claims, and saves to database."""
        logger.info(f"Executing research for queries: {queries}")
        all_sources: List[Dict] = []
        all_claims: List[Dict] = []
        seen_urls = set()

        # Step 1: Perform searches concurrently
        search_tasks = [
            self.search_provider.search(q, num_results=settings.MAX_SEARCH_RESULTS_PER_QUERY)
            for q in queries
        ]
        search_results_nested = await asyncio.gather(*search_tasks, return_exceptions=True)

        candidate_results = []
        for res in search_results_nested:
            if isinstance(res, list):
                candidate_results.extend(res)

        # Step 2: Deduplicate by URL
        unique_results = []
        for r in candidate_results:
            if r.url and r.url not in seen_urls:
                seen_urls.add(r.url)
                unique_results.append(r)

        # Step 3: Crawl and extract content concurrently
        crawl_tasks = [crawler.fetch_and_clean(r.url) for r in unique_results[:8]]
        crawled_pages = await asyncio.gather(*crawl_tasks, return_exceptions=True)

        for i, page_data in enumerate(crawled_pages):
            if isinstance(page_data, dict) and page_data.get("content"):
                sr = unique_results[i]
                page_data["publisher"] = sr.publisher or "Web Source"
                page_data["published_date"] = sr.published_date or "2026"
                page_data["reliability_score"] = sr.reliability_score

                # Emit event
                await event_bus.publish(
                    event_type="research.source_found",
                    project_id=project_id,
                    workflow_id=workflow_id,
                    task_id=task_id,
                    agent_id="ResearchAgent",
                    payload={
                        "url": page_data["url"],
                        "title": page_data["title"],
                        "publisher": page_data["publisher"],
                        "reliability": page_data["reliability_score"],
                    },
                )

                # Persist source to DB if session provided
                source_db_id = None
                if db:
                    db_source = ResearchSource(
                        project_id=project_id,
                        task_id=task_id,
                        url=page_data["url"],
                        title=page_data["title"],
                        publisher=page_data["publisher"],
                        published_date=page_data["published_date"],
                        content_hash=page_data["content_hash"],
                        raw_content=page_data["content"][:5000],
                        summary=page_data["summary"],
                        reliability_score=page_data["reliability_score"],
                    )
                    db.add(db_source)
                    await db.flush()
                    source_db_id = db_source.id

                page_data["db_id"] = source_db_id
                all_sources.append(page_data)

                # Step 4: Extract factual claims
                extracted_claims = claim_extractor.extract_claims(page_data)
                for cl in extracted_claims:
                    cl["source_db_id"] = source_db_id
                    all_claims.append(cl)

                    # Emit claim event
                    await event_bus.publish(
                        event_type="research.claim_extracted",
                        project_id=project_id,
                        workflow_id=workflow_id,
                        task_id=task_id,
                        agent_id="ResearchAgent",
                        payload={
                            "claim_id": cl["id"],
                            "claim_text": cl["claim_text"],
                            "source_url": cl["source_url"],
                            "confidence": cl["confidence_score"],
                        },
                    )

                    # Persist claim to DB if session provided
                    if db and source_db_id:
                        db_claim = ResearchClaim(
                            id=cl["id"],
                            project_id=project_id,
                            task_id=task_id,
                            source_id=source_db_id,
                            claim_text=cl["claim_text"],
                            evidence_excerpt=cl["evidence_excerpt"],
                            confidence_score=cl["confidence_score"],
                            verification_status="UNVERIFIED",
                        )
                        db.add(db_claim)

        if db:
            await db.commit()

        logger.info(
            f"Research complete: {len(all_sources)} sources, {len(all_claims)} claims persisted."
        )
        return {
            "sources": all_sources,
            "claims": all_claims,
            "source_count": len(all_sources),
            "claim_count": len(all_claims),
        }


research_engine = ResearchEngine()

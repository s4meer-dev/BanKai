"""Embedding provider abstraction with local and API adapters."""

import hashlib
import math
from typing import List, Optional
import httpx
from app.core.config import settings
from app.core.logging import logger


class EmbeddingProvider:
    """Generates normalized vector embeddings for semantic retrieval."""

    def __init__(self, dimension: int = 128) -> None:
        self.dimension = dimension

    async def get_embedding(self, text: str) -> List[float]:
        """Generates a normalized embedding vector for the given text."""
        # Check if OpenAI API key is present and configured
        if settings.OPENAI_API_KEY and settings.DEFAULT_EMBEDDING_PROVIDER == "openai":
            try:
                async with httpx.AsyncClient(timeout=10.0) as client:
                    res = await client.post(
                        "https://api.openai.com/v1/embeddings",
                        headers={"Authorization": f"Bearer {settings.OPENAI_API_KEY}"},
                        json={
                            "input": text,
                            "model": settings.DEFAULT_EMBEDDING_MODEL,
                        },
                    )
                    res.raise_for_status()
                    data = res.json()
                    return data["data"][0]["embedding"]
            except Exception as exc:
                logger.warning(f"OpenAI embedding error: {exc}. Using deterministic local embedding.")

        # Local deterministic semantic vector representation based on term hashes
        return self._deterministic_vector(text)

    def _deterministic_vector(self, text: str) -> List[float]:
        """Computes a normalized deterministic embedding vector without external dependencies."""
        words = text.lower().split()
        vector = [0.0] * self.dimension

        for word in words:
            # Hash word into dimension index and sign
            h = int(hashlib.md5(word.encode("utf-8")).hexdigest(), 16)
            idx = h % self.dimension
            sign = 1.0 if ((h >> 4) % 2 == 0) else -1.0
            vector[idx] += sign

        # Compute Euclidean norm
        norm = math.sqrt(sum(v * v for v in vector))
        if norm > 0.0:
            vector = [round(v / norm, 6) for v in vector]
        else:
            vector[0] = 1.0
        return vector


embedding_provider = EmbeddingProvider()


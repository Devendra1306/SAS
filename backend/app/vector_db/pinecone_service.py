"""
Pinecone Service — face embedding storage and similarity search.
Uses Pinecone Python client v3+ with host-based index connection.
"""
import logging
from typing import List, Dict, Any, Optional
from app.config import settings

logger = logging.getLogger(__name__)


class PineconeService:
    def __init__(self):
        self.pc = None
        self.index = None
        self._available = False
        self._init()

    def _init(self):
        try:
            from pinecone import Pinecone
            self.pc = Pinecone(api_key=settings.PINECONE_API_KEY)

            # Use host URL directly (v3+ serverless approach)
            if settings.PINECONE_HOST:
                self.index = self.pc.Index(host=settings.PINECONE_HOST)
            else:
                self.index = self.pc.Index(settings.PINECONE_INDEX_NAME)

            # Test connectivity
            stats = self.index.describe_index_stats()
            self._available = True
            logger.info(
                f"Pinecone connected | Index: {settings.PINECONE_INDEX_NAME} "
                f"| Vectors: {stats.get('total_vector_count', 0)}"
            )
        except Exception as e:
            logger.warning(f"Pinecone init failed: {e}. Face recognition disabled.")
            self._available = False

    def upsert_embedding(
        self,
        vector_id: str,
        embedding: List[float],
        metadata: Dict[str, Any]
    ) -> bool:
        if not self._available or self.index is None:
            logger.warning("Pinecone unavailable — embedding not stored")
            return False
        try:
            self.index.upsert(
                vectors=[{"id": vector_id, "values": embedding, "metadata": metadata}],
                namespace=settings.PINECONE_NAMESPACE
            )
            return True
        except Exception as e:
            logger.error(f"Pinecone upsert error: {e}")
            return False

    def upsert_batch(self, vectors: List[Dict[str, Any]]) -> bool:
        """Upsert multiple vectors at once."""
        if not self._available or self.index is None:
            return False
        try:
            self.index.upsert(vectors=vectors, namespace=settings.PINECONE_NAMESPACE)
            return True
        except Exception as e:
            logger.error(f"Pinecone batch upsert error: {e}")
            return False

    def query_embedding(
        self,
        embedding: List[float],
        top_k: int = 5,
        filter: Optional[Dict] = None
    ) -> Dict[str, Any]:
        if not self._available or self.index is None:
            return {"matches": []}
        try:
            kwargs = {
                "namespace": settings.PINECONE_NAMESPACE,
                "vector": embedding,
                "top_k": top_k,
                "include_metadata": True
            }
            if filter:
                kwargs["filter"] = filter
            result = self.index.query(**kwargs)
            # Convert to dict if needed
            if hasattr(result, "to_dict"):
                return result.to_dict()
            matches = result.matches if hasattr(result, "matches") else result.get("matches", [])
            return {"matches": [
                {
                    "id": m.id if hasattr(m, "id") else m.get("id"),
                    "score": m.score if hasattr(m, "score") else m.get("score", 0),
                    "metadata": m.metadata if hasattr(m, "metadata") else m.get("metadata", {})
                }
                for m in matches
            ]}
        except Exception as e:
            logger.error(f"Pinecone query error: {e}")
            return {"matches": []}

    def delete_vectors(self, vector_ids: List[str]) -> bool:
        if not self._available or self.index is None:
            return False
        try:
            self.index.delete(ids=vector_ids, namespace=settings.PINECONE_NAMESPACE)
            return True
        except Exception as e:
            logger.error(f"Pinecone delete error: {e}")
            return False

    def describe_stats(self) -> Dict[str, Any]:
        if not self._available or self.index is None:
            return {}
        try:
            stats = self.index.describe_index_stats()
            return stats.to_dict() if hasattr(stats, "to_dict") else dict(stats)
        except Exception as e:
            logger.error(f"Pinecone stats error: {e}")
            return {}

    @property
    def is_available(self) -> bool:
        return self._available


# Singleton
pinecone_service = PineconeService()

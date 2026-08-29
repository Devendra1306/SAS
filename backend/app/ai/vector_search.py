"""
Vector Search — queries Pinecone and applies similarity threshold.
"""
import logging
from typing import Dict, Any, List, Optional
from app.vector_db.pinecone_service import pinecone_service
from app.config import settings

logger = logging.getLogger(__name__)


async def search_face(embedding: List[float], top_k: int = 5) -> Dict[str, Any]:
    """
    Query Pinecone with a face embedding.
    Returns: {matched, student_id, score, all_matches}
    """
    if not embedding:
        return {"matched": False, "student_id": None, "score": 0.0, "all_matches": []}

    try:
        results = pinecone_service.query_embedding(embedding, top_k=top_k)
        matches = results.get("matches", [])

        if not matches:
            return {"matched": False, "student_id": None, "score": 0.0, "all_matches": []}

        best = matches[0]
        best_score = float(best.get("score", 0.0))
        threshold = settings.FACE_MATCH_THRESHOLD

        all_matches = [
            {
                "vector_id": m["id"],
                "student_id": m.get("metadata", {}).get("student_id"),
                "score": float(m.get("score", 0.0))
            }
            for m in matches
        ]

        if best_score >= threshold:
            student_id = best.get("metadata", {}).get("student_id")
            return {
                "matched": True,
                "student_id": student_id,
                "score": best_score,
                "all_matches": all_matches
            }
        else:
            return {
                "matched": False,
                "student_id": None,
                "score": best_score,
                "all_matches": all_matches
            }
    except Exception as e:
        logger.error(f"Vector search error: {e}")
        return {"matched": False, "student_id": None, "score": 0.0, "all_matches": []}

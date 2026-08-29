"""
Embedding Generator — normalizes ArcFace embeddings for Pinecone storage.
"""
import numpy as np
from typing import List


def normalize_embedding(embedding: np.ndarray) -> List[float]:
    """L2-normalize an embedding vector and convert to Python list."""
    norm = np.linalg.norm(embedding)
    if norm == 0:
        return embedding.tolist()
    normalized = embedding / norm
    return normalized.tolist()


def embeddings_from_face_obj(face_obj) -> List[float]:
    """Extract and normalize embedding from InsightFace face object."""
    if face_obj is None or face_obj.embedding is None:
        return []
    return normalize_embedding(np.array(face_obj.embedding))


def compute_cosine_similarity(emb1: List[float], emb2: List[float]) -> float:
    """Compute cosine similarity between two normalized embeddings."""
    a = np.array(emb1)
    b = np.array(emb2)
    dot = np.dot(a, b)
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return float(dot / (norm_a * norm_b))

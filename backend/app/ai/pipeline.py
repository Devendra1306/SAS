"""
Main AI Pipeline — orchestrates the complete face recognition flow.

Pipeline:
  Camera Frame
    → FaceDetector (InsightFace RetinaFace)
    → FaceQualityChecker (blur, brightness, size)
    → LivenessDetector (anti-spoofing)
    → FaceAligner (5-landmark, 112x112)
    → Embedding (ArcFace via InsightFace)
    → L2 Normalization
    → Pinecone VectorSearch
    → Similarity Threshold Check
    → Student Verification (MongoDB)
    → Duplicate Check
    → Mark Attendance
"""
import base64
import logging
import numpy as np
from dataclasses import dataclass, field
from typing import List, Optional, Dict, Any

from app.ai.face_detector import get_detector
from app.ai.face_quality import quality_checker
from app.ai.liveness_detector import get_liveness_detector
from app.ai.face_aligner import FaceAligner
from app.ai.embedding_generator import normalize_embedding
from app.ai.vector_search import search_face
from app.ai.face_tracker import FaceTracker
from app.config import settings

logger = logging.getLogger(__name__)


@dataclass
class FaceResult:
    """Result of processing one detected face."""
    track_id: int = 0
    bbox: List[int] = field(default_factory=list)
    student_id: Optional[str] = None
    name: Optional[str] = None
    score: float = 0.0
    # PRESENT | UNKNOWN | DUPLICATE | SPOOF | LOW_QUALITY | ERROR
    status: str = "UNKNOWN"
    is_live: bool = False
    quality_score: float = 0.0
    liveness_confidence: float = 0.0


class AIPipeline:
    """End-to-end face recognition pipeline."""

    def __init__(self):
        self.detector = get_detector()
        self.quality = quality_checker
        self.liveness = get_liveness_detector(settings.ANTISPOOF_MODEL_PATH)
        self.aligner = FaceAligner()
        self.tracker = FaceTracker()
        logger.info("AI Pipeline initialized")

    async def process_frame(
        self,
        frame_bgr: np.ndarray,
        session_context: Optional[Dict[str, Any]] = None
    ) -> List[FaceResult]:
        """
        Process a single camera frame.
        Returns list of FaceResult objects for each detected face.
        """
        # 1. Detect faces
        detections = self.detector.detect(frame_bgr)
        if not detections:
            return []

        # 2. Track faces (assign IDs, apply cooldown)
        tracked = self.tracker.update(detections)

        results = []
        for det in tracked:
            result = FaceResult(
                track_id=det.get("track_id", 0),
                bbox=det.get("bbox", [])
            )

            # Skip if in cooldown (recently processed)
            if not det.get("should_process", True):
                result.status = "COOLDOWN"
                results.append(result)
                continue

            # 3. Quality check
            face_obj = det.get("face_obj")
            aligned = None
            if face_obj is not None:
                try:
                    aligned = self.aligner.align(frame_bgr, face_obj)
                except Exception:
                    aligned = self.aligner.align_from_bbox(frame_bgr, det["bbox"])
            else:
                aligned = self.aligner.align_from_bbox(frame_bgr, det["bbox"])

            if aligned is None:
                result.status = "LOW_QUALITY"
                results.append(result)
                continue

            quality = self.quality.check(aligned, det.get("bbox"))
            result.quality_score = quality.get("score", 0.0)
            if not quality.get("is_acceptable", True):
                result.status = "LOW_QUALITY"
                results.append(result)
                continue

            # 4. Liveness check
            liveness = self.liveness.check(aligned)
            result.is_live = liveness.get("is_live", True)
            result.liveness_confidence = liveness.get("confidence", 0.0)
            if not result.is_live:
                result.status = "SPOOF"
                results.append(result)
                continue

            # 5. Get embedding (from InsightFace detection or direct)
            embedding = det.get("embedding")
            if embedding is None:
                logger.warning("No embedding from detector, skipping face")
                result.status = "ERROR"
                results.append(result)
                continue

            # Ensure embedding is L2-normalized
            emb_norm = normalize_embedding(np.array(embedding))

            # 6. Pinecone vector search
            search_result = await search_face(emb_norm)
            result.score = search_result.get("score", 0.0)

            if not search_result.get("matched", False):
                result.status = "UNKNOWN"
                results.append(result)
                self.tracker.mark_processed(det["track_id"])
                continue

            result.student_id = search_result.get("student_id")
            result.status = "MATCHED"  # Will be confirmed as PRESENT or DUPLICATE later

            self.tracker.mark_processed(det["track_id"])
            results.append(result)

        return results

    async def process_enrollment_image(self, image_bgr: np.ndarray) -> Dict[str, Any]:
        """
        Process a face image for student enrollment.
        Returns embedding and quality info or raises ValueError.
        """
        detections = self.detector.detect(image_bgr)
        if not detections:
            raise ValueError("No face detected in the image")
        if len(detections) > 1:
            raise ValueError("Multiple faces detected. Please use an image with a single face.")

        det = detections[0]
        face_obj = det.get("face_obj")
        aligned = None
        if face_obj is not None:
            aligned = self.aligner.align(image_bgr, face_obj)
        if aligned is None:
            aligned = self.aligner.align_from_bbox(image_bgr, det["bbox"])
        if aligned is None:
            raise ValueError("Could not align face in the image")

        quality = self.quality.check(aligned, det.get("bbox"))
        embedding = det.get("embedding")
        if embedding is None:
            raise ValueError("Could not extract face embedding")

        emb_norm = normalize_embedding(np.array(embedding))
        return {
            "embedding": emb_norm,
            "quality": quality,
            "detection_score": det.get("detection_score", 0.0)
        }

    def reset_tracker(self):
        self.tracker.reset()


# Singleton
_pipeline: Optional[AIPipeline] = None


def get_pipeline() -> AIPipeline:
    global _pipeline
    if _pipeline is None:
        _pipeline = AIPipeline()
    return _pipeline

"""
Face Detector — wraps InsightFace detection.
Returns detected faces with bounding boxes and landmarks.
"""
import logging
from typing import List, Dict, Any, Optional
import numpy as np

logger = logging.getLogger(__name__)


class FaceDetector:
    """Detects faces using InsightFace RetinaFace detector."""

    def __init__(self, min_face_size: int = 60):
        self.min_face_size = min_face_size
        self._app = None
        self._available = False
        self._init_detector()

    def _init_detector(self):
        try:
            import onnxruntime as ort
            import insightface
            from insightface.app import FaceAnalysis

            available_providers = ort.get_available_providers()
            if "CUDAExecutionProvider" in available_providers:
                providers = ["CUDAExecutionProvider", "CPUExecutionProvider"]
                ctx_id = 0
            else:
                providers = ["CPUExecutionProvider"]
                ctx_id = -1

            self._app = FaceAnalysis(
                name="buffalo_l",
                providers=providers
            )
            self._app.prepare(ctx_id=ctx_id, det_size=(640, 640))
            self._available = True
            logger.info(f"InsightFace detector initialized (buffalo_l) with providers={providers}, ctx_id={ctx_id}")
        except Exception as e:
            logger.warning(f"InsightFace init failed: {e}. Running in demo mode.")
            self._available = False

    def detect(self, frame_bgr: np.ndarray) -> List[Dict[str, Any]]:
        """
        Detect faces in a BGR frame.
        Returns list of dicts: {bbox, landmarks, detection_score, face_img}
        """
        if not self._available or self._app is None:
            return []

        try:
            faces = self._app.get(frame_bgr)
            results = []
            for face in faces:
                bbox = face.bbox.astype(int).tolist()
                w = bbox[2] - bbox[0]
                h = bbox[3] - bbox[1]
                if w < self.min_face_size or h < self.min_face_size:
                    continue
                results.append({
                    "bbox": bbox,
                    "landmarks": face.kps.astype(float).tolist() if face.kps is not None else None,
                    "detection_score": float(face.det_score),
                    "embedding": face.embedding.tolist() if face.embedding is not None else None,
                    "face_obj": face  # keep for alignment
                })
            return results
        except Exception as e:
            logger.error(f"Face detection error: {e}")
            return []

    @property
    def is_available(self) -> bool:
        return self._available


# Singleton
_detector: Optional[FaceDetector] = None


def get_detector() -> FaceDetector:
    global _detector
    if _detector is None:
        _detector = FaceDetector()
    return _detector

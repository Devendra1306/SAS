"""
Face Aligner — performs 5-point landmark-based face alignment.
Output: 112x112 aligned face crop (InsightFace standard).
"""
import logging
from typing import Optional
import numpy as np

logger = logging.getLogger(__name__)


class FaceAligner:
    """Aligns faces using 5-point landmarks (InsightFace norm_crop)."""

    def align(self, frame_bgr: np.ndarray, face_obj) -> Optional[np.ndarray]:
        """
        Align a detected face using InsightFace norm_crop.
        Returns 112x112 BGR aligned face or None on failure.
        """
        try:
            from insightface.utils import face_align
            aligned = face_align.norm_crop(frame_bgr, landmark=face_obj.kps)
            return aligned
        except Exception as e:
            logger.error(f"Face alignment error: {e}")
            return None

    def align_from_bbox(self, frame_bgr: np.ndarray, bbox: list) -> Optional[np.ndarray]:
        """Simple crop from bbox as fallback."""
        try:
            import cv2
            x1, y1, x2, y2 = int(bbox[0]), int(bbox[1]), int(bbox[2]), int(bbox[3])
            # Add padding
            pad = 10
            x1 = max(0, x1 - pad)
            y1 = max(0, y1 - pad)
            x2 = min(frame_bgr.shape[1], x2 + pad)
            y2 = min(frame_bgr.shape[0], y2 + pad)
            crop = frame_bgr[y1:y2, x1:x2]
            if crop.size == 0:
                return None
            aligned = cv2.resize(crop, (112, 112))
            return aligned
        except Exception as e:
            logger.error(f"Bbox alignment error: {e}")
            return None

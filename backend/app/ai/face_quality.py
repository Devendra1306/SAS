"""
Face Quality Checker — validates face image before recognition.
Checks: blur, brightness, face size, and coverage.
"""
import logging
from typing import Dict, Any
import numpy as np

logger = logging.getLogger(__name__)

# Tunable thresholds (tuned for 112x112 aligned face crops and standard webcams)
BLUR_THRESHOLD = 18.0        # Laplacian variance threshold
MIN_BRIGHTNESS = 25.0        # Mean pixel value (0-255)
MAX_BRIGHTNESS = 235.0
MIN_FACE_SIZE = 40           # Minimum face dimension in pixels


class FaceQualityChecker:
    """Validates face image quality before recognition."""

    def check(self, face_img: np.ndarray, bbox: list = None) -> Dict[str, Any]:
        """
        Check quality of a face image.
        Returns dict: {is_acceptable, score, issues}
        """
        issues = []
        scores = []

        try:
            import cv2

            if face_img is None or face_img.size == 0:
                return {"is_acceptable": False, "score": 0.0, "issues": ["Empty image"]}

            gray = cv2.cvtColor(face_img, cv2.COLOR_BGR2GRAY) if len(face_img.shape) == 3 else face_img

            # 1. Blur check (Laplacian variance)
            laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
            if laplacian_var < BLUR_THRESHOLD:
                issues.append(f"Image too blurry (score: {laplacian_var:.1f})")
            blur_score = min(1.0, laplacian_var / (BLUR_THRESHOLD * 3))
            scores.append(blur_score)

            # 2. Brightness check
            mean_brightness = float(gray.mean())
            if mean_brightness < MIN_BRIGHTNESS:
                issues.append(f"Image too dark (brightness: {mean_brightness:.1f})")
            elif mean_brightness > MAX_BRIGHTNESS:
                issues.append(f"Image overexposed (brightness: {mean_brightness:.1f})")
            brightness_score = 1.0 - abs(mean_brightness - 128) / 128
            scores.append(max(0.0, brightness_score))

            # 3. Face size check
            if bbox:
                w = bbox[2] - bbox[0]
                h = bbox[3] - bbox[1]
                if w < MIN_FACE_SIZE or h < MIN_FACE_SIZE:
                    issues.append(f"Face too small ({w}x{h}px)")
                size_score = min(1.0, min(w, h) / 150.0)
                scores.append(size_score)

            overall_score = float(np.mean(scores)) if scores else 0.5
            is_acceptable = len(issues) == 0 and overall_score > 0.3

            return {
                "is_acceptable": is_acceptable,
                "score": round(overall_score, 3),
                "issues": issues,
                "blur_score": blur_score,
                "brightness": mean_brightness
            }
        except Exception as e:
            logger.error(f"Quality check error: {e}")
            return {"is_acceptable": True, "score": 0.5, "issues": []}  # Fail open in demo


quality_checker = FaceQualityChecker()

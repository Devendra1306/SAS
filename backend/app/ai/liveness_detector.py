"""
Liveness Detector — Anti-spoofing layer.
Tries to load an ONNX anti-spoofing model.
Falls back to demo mode (pass-through) if model unavailable.
"""
import logging
import os
from typing import Dict, Any
import numpy as np

logger = logging.getLogger(__name__)


class LivenessDetector:
    """
    Anti-spoofing detector.
    In production: uses ONNX model (Silent-Face-Anti-Spoofing compatible).
    In demo mode: returns is_live=True with confidence=0.0 and warns.
    """

    def __init__(self, model_path: str = ""):
        self._model = None
        self._available = False
        self._demo_mode = True
        self._load_model(model_path)

    def _load_model(self, model_path: str):
        """Try to load ONNX anti-spoofing model."""
        if not model_path or not os.path.exists(model_path):
            logger.warning(
                f"Anti-spoofing model not found at '{model_path}'. "
                "Running in DEMO MODE — liveness checks DISABLED. "
                "Place a compatible ONNX model to enable anti-spoofing."
            )
            return

        try:
            import onnxruntime as ort
            self._model = ort.InferenceSession(
                model_path,
                providers=["CUDAExecutionProvider", "CPUExecutionProvider"]
            )
            self._available = True
            self._demo_mode = False
            logger.info(f"Anti-spoofing model loaded from {model_path}")
        except Exception as e:
            logger.warning(f"Could not load anti-spoofing model: {e}. Demo mode active.")

    def check(self, face_img: np.ndarray) -> Dict[str, Any]:
        """
        Check if face is live.
        Returns: {is_live, confidence, method}
        """
        if self._demo_mode or self._model is None:
            return {
                "is_live": True,
                "confidence": 0.0,
                "method": "demo",
                "warning": "Liveness check disabled — demo mode"
            }

        try:
            import cv2
            # Preprocess for typical anti-spoofing model: 80x80 RGB
            img = cv2.resize(face_img, (80, 80))
            img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB).astype(np.float32)
            img = img / 255.0
            img = np.transpose(img, (2, 0, 1))  # HWC -> CHW
            img = np.expand_dims(img, 0)  # batch dim

            input_name = self._model.get_inputs()[0].name
            outputs = self._model.run(None, {input_name: img})
            score = float(outputs[0][0][1]) if outputs[0].shape[-1] > 1 else float(outputs[0][0][0])

            is_live = score >= 0.5
            return {
                "is_live": is_live,
                "confidence": round(score, 3),
                "method": "model"
            }
        except Exception as e:
            logger.error(f"Liveness check error: {e}")
            return {"is_live": True, "confidence": 0.0, "method": "error_fallback"}


# Singleton — initialized on startup
_detector: LivenessDetector = None


def get_liveness_detector(model_path: str = "") -> LivenessDetector:
    global _detector
    if _detector is None:
        _detector = LivenessDetector(model_path)
    return _detector

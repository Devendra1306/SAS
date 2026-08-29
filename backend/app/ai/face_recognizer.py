import cv2
import numpy as np
from insightface.app import FaceAnalysis
from app.config import settings

class FaceRecognizer:
    def __init__(self):
        self.app = FaceAnalysis(name=settings.INSIGHTFACE_MODEL, root=settings.AI_MODEL_DIR, providers=['CPUExecutionProvider'])
        self.app.prepare(ctx_id=-1, det_size=(640, 640))

    def get_embeddings(self, frame_bgr):
        faces = self.app.get(frame_bgr)
        results = []
        for face in faces:
            results.append({
                "bbox": face.bbox.tolist(),
                "embedding": face.normed_embedding.tolist(),
                "det_score": float(face.det_score)
            })
        return results

recognizer = FaceRecognizer()

def process_frame(frame_bgr):
    return recognizer.get_embeddings(frame_bgr)

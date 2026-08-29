"""
Face Tracker — simple IoU-based multi-face tracker.
Prevents reprocessing the same face on every frame (cooldown per track).
"""
import time
from typing import List, Dict, Any, Optional
import numpy as np


def _iou(box1: List[int], box2: List[int]) -> float:
    """Compute Intersection over Union of two bboxes [x1,y1,x2,y2]."""
    x1 = max(box1[0], box2[0])
    y1 = max(box1[1], box2[1])
    x2 = min(box1[2], box2[2])
    y2 = min(box1[3], box2[3])
    inter = max(0, x2 - x1) * max(0, y2 - y1)
    area1 = (box1[2] - box1[0]) * (box1[3] - box1[1])
    area2 = (box2[2] - box2[0]) * (box2[3] - box2[1])
    union = area1 + area2 - inter
    return inter / union if union > 0 else 0.0


class FaceTracker:
    """
    Simple IoU-based tracker.
    Assigns track IDs to faces, enforces a cooldown before
    reprocessing the same track (prevents repeated recognition calls).
    """

    IOU_THRESHOLD = 0.3
    COOLDOWN_SECONDS = 3.0
    MAX_MISSED = 5

    def __init__(self):
        self._tracks: Dict[int, Dict] = {}
        self._next_id = 1

    def update(self, detections: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Match detections to existing tracks.
        Returns detections annotated with track_id and should_process flag.
        """
        now = time.time()
        matched_track_ids = set()
        results = []

        for det in detections:
            bbox = det.get("bbox", [0, 0, 0, 0])
            best_track_id = None
            best_iou = 0.0

            for track_id, track in self._tracks.items():
                if track_id in matched_track_ids:
                    continue
                iou = _iou(bbox, track["bbox"])
                if iou > best_iou and iou >= self.IOU_THRESHOLD:
                    best_iou = iou
                    best_track_id = track_id

            if best_track_id is not None:
                # Update existing track
                track = self._tracks[best_track_id]
                track["bbox"] = bbox
                track["missed"] = 0
                track["last_seen"] = now
                matched_track_ids.add(best_track_id)
                # Should process if cooldown expired
                should_process = (now - track.get("last_processed", 0)) >= self.COOLDOWN_SECONDS
                results.append({**det, "track_id": best_track_id, "should_process": should_process})
            else:
                # New track
                tid = self._next_id
                self._next_id += 1
                self._tracks[tid] = {
                    "bbox": bbox,
                    "last_seen": now,
                    "last_processed": 0,
                    "missed": 0
                }
                results.append({**det, "track_id": tid, "should_process": True})

        # Mark missed tracks and remove stale ones
        stale = []
        for track_id, track in self._tracks.items():
            if track_id not in matched_track_ids:
                track["missed"] += 1
                if track["missed"] > self.MAX_MISSED:
                    stale.append(track_id)
        for tid in stale:
            del self._tracks[tid]

        return results

    def mark_processed(self, track_id: int):
        """Call this after a face has been successfully recognized/processed."""
        if track_id in self._tracks:
            self._tracks[track_id]["last_processed"] = time.time()

    def reset(self):
        self._tracks = {}
        self._next_id = 1

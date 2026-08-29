from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel


# ── Location & Classroom Schemas ─────────────────────────────────────────────

class LocationVerifyRequest(BaseModel):
    subject_id: Optional[str] = None
    classroom_id: Optional[str] = None
    latitude: float
    longitude: float
    accuracy: Optional[float] = None


class LocationVerifyResponse(BaseModel):
    verified: bool
    distance_meters: float
    allowed_radius_meters: float
    classroom_id: str
    classroom_name: str
    classroom_lat: float
    classroom_lon: float
    message: str


class ClassroomModel(BaseModel):
    classroom_id: str
    name: str
    department: str
    room_number: str
    latitude: float
    longitude: float
    allowed_radius_meters: float = 100.0


# ── Session Schemas ──────────────────────────────────────────────────────────

class SessionCreate(BaseModel):
    subject_id: str
    department: str
    year: int
    section: str
    date: Optional[str] = None  # defaults to today
    classroom_id: Optional[str] = None
    faculty_latitude: Optional[float] = None
    faculty_longitude: Optional[float] = None
    location_bypass: Optional[bool] = False


class SessionResponse(BaseModel):
    id: str
    faculty_id: str
    subject_id: str
    subject_name: Optional[str] = None
    department: str
    year: int
    section: str
    date: str
    start_time: datetime
    end_time: Optional[datetime] = None
    status: str
    classroom_id: Optional[str] = None
    location_verified: Optional[bool] = True
    distance_from_classroom: Optional[float] = None
    faculty_latitude: Optional[float] = None
    faculty_longitude: Optional[float] = None
    created_at: datetime

    class Config:
        populate_by_name = True


# ── Attendance Schemas ───────────────────────────────────────────────────────

class AttendanceMark(BaseModel):
    session_id: str
    student_id: str
    status: str = "PRESENT"  # PRESENT | ABSENT | LATE | EXCUSED
    verification_method: str = "MANUAL"
    recognition_score: Optional[float] = None


class AttendanceUpdate(BaseModel):
    status: str  # PRESENT | ABSENT | LATE | EXCUSED
    reason: Optional[str] = None


class AttendanceResponse(BaseModel):
    id: str
    session_id: str
    student_id: str
    student_name: Optional[str] = None
    roll_number: Optional[str] = None
    subject_id: str
    subject_name: Optional[str] = None
    faculty_id: str
    date: str
    timestamp: datetime
    status: str
    recognition_score: Optional[float] = None
    verification_method: str
    created_at: datetime

    class Config:
        populate_by_name = True


class RecognizeRequest(BaseModel):
    session_id: str
    frame_base64: str


class FaceResultResponse(BaseModel):
    student_id: Optional[str] = None
    name: Optional[str] = None
    score: float = 0.0
    status: str  # PRESENT | UNKNOWN | DUPLICATE | SPOOF | LOW_QUALITY
    bbox: Optional[List[int]] = None


class RecognizeResponse(BaseModel):
    faces: List[FaceResultResponse]
    processed_at: datetime = datetime.utcnow()

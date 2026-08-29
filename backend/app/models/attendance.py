from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field


class AttendanceSessionModel(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    faculty_id: str
    subject_id: str
    department: str
    year: int
    section: str
    date: str  # ISO date string YYYY-MM-DD
    start_time: datetime = Field(default_factory=datetime.utcnow)
    end_time: Optional[datetime] = None
    status: str = "ACTIVE"  # ACTIVE | COMPLETED | CANCELLED
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True


class AttendanceModel(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    session_id: str
    student_id: str
    subject_id: str
    faculty_id: str
    date: str  # YYYY-MM-DD
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    status: str = "PRESENT"  # PRESENT | ABSENT | LATE | EXCUSED
    recognition_score: Optional[float] = None
    verification_method: str = "AI_FACE"  # AI_FACE | MANUAL
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True

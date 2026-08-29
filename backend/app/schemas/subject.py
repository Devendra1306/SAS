from typing import Optional
from datetime import datetime
from pydantic import BaseModel


# ── Subject Schemas ──────────────────────────────────────────────────────────

class SubjectCreate(BaseModel):
    subject_code: str
    subject_name: str
    department: str
    year: int
    section: str
    faculty_id: Optional[str] = None


class SubjectUpdate(BaseModel):
    subject_name: Optional[str] = None
    department: Optional[str] = None
    year: Optional[int] = None
    section: Optional[str] = None
    faculty_id: Optional[str] = None


class SubjectResponse(BaseModel):
    id: str
    subject_code: str
    subject_name: str
    department: str
    year: int
    section: str
    faculty_id: Optional[str] = None
    faculty_name: Optional[str] = None
    created_at: datetime

    class Config:
        populate_by_name = True

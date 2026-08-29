from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel


# ── Faculty Schemas ──────────────────────────────────────────────────────────

class FacultyCreate(BaseModel):
    faculty_id: str
    name: str
    email: str
    department: str
    password: str
    subject_ids: List[str] = []


class FacultyUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    department: Optional[str] = None
    subject_ids: Optional[List[str]] = None
    is_active: Optional[bool] = None


class FacultyResponse(BaseModel):
    id: str
    faculty_id: str
    name: str
    email: str
    department: str
    subject_ids: List[str] = []
    is_active: bool
    created_at: datetime

    class Config:
        populate_by_name = True

from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, EmailStr


# ── Student Schemas ──────────────────────────────────────────────────────────

class StudentCreate(BaseModel):
    student_id: str
    roll_number: str
    name: str
    email: str
    phone: Optional[str] = None
    department: str
    year: int
    section: str
    password: str


class StudentUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    department: Optional[str] = None
    year: Optional[int] = None
    section: Optional[str] = None
    is_active: Optional[bool] = None


class StudentResponse(BaseModel):
    id: str
    student_id: str
    roll_number: str
    name: str
    email: str
    phone: Optional[str] = None
    department: str
    year: int
    section: str
    is_active: bool
    enrollment_count: int = 0
    created_at: datetime

    class Config:
        populate_by_name = True


class StudentListResponse(BaseModel):
    students: List[StudentResponse]
    total: int
    page: int
    page_size: int

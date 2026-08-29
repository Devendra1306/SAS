from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field


class StudentModel(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    student_id: str
    roll_number: str
    name: str
    email: str
    phone: Optional[str] = None
    department: str
    year: int
    section: str
    user_id: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True

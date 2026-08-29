from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field


class SubjectModel(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    subject_code: str
    subject_name: str
    department: str
    year: int
    section: str
    faculty_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True

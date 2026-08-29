from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field


class FacultyModel(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    faculty_id: str
    name: str
    email: str
    department: str
    subject_ids: List[str] = []
    user_id: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True

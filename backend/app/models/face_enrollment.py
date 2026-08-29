from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field


class FaceEnrollmentModel(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    student_id: str
    pinecone_vector_ids: List[str] = []
    enrollment_count: int = 0
    quality_scores: List[float] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True

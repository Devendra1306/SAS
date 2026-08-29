from typing import Optional, Any
from datetime import datetime
from pydantic import BaseModel, Field


class AuditLogModel(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    user_id: str
    action: str
    entity: str
    entity_id: str
    previous_value: Optional[Any] = None
    new_value: Optional[Any] = None
    reason: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True

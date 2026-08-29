from pydantic import BaseModel, EmailStr
from typing import Optional

class LoginRequest(BaseModel):
    username_or_email: str
    password: str

class StudentLoginRequest(BaseModel):
    student_id_or_email: str
    password: str

class TokenRefreshRequest(BaseModel):
    refresh_token: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    role: str
    user_id: str
    name: Optional[str] = None

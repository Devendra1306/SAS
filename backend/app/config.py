from pydantic_settings import BaseSettings
from typing import List, Union
from functools import lru_cache
from pydantic import field_validator
import os


class Settings(BaseSettings):
    # MongoDB
    MONGODB_URI: str = "mongodb://localhost:27017"
    MONGODB_DATABASE: str = "sas_db"

    # JWT
    JWT_SECRET: str = "change_this_secret"
    JWT_REFRESH_SECRET: str = "change_this_refresh_secret"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Pinecone
    PINECONE_API_KEY: str = ""
    PINECONE_INDEX_NAME: str = "sas"
    PINECONE_NAMESPACE: str = "college_students"
    PINECONE_HOST: str = ""

    # AI
    INSIGHTFACE_MODEL: str = "buffalo_l"
    AI_MODEL_DIR: str = "./ai_models"
    ANTISPOOF_MODEL_PATH: str = "./ai/anti_spoofing/weights"
    FACE_MATCH_THRESHOLD: float = 0.45

    # Attendance thresholds
    LOW_ATTENDANCE_THRESHOLD: float = 50.0
    HIGH_ATTENDANCE_THRESHOLD: float = 90.0

    # Server
    BACKEND_HOST: str = "0.0.0.0"
    BACKEND_PORT: int = 8000
    CORS_ORIGINS: Union[List[str], str] = ["http://localhost:5173", "http://localhost:3000"]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v

    # App
    APP_MODE: str = "development"

    # Seed
    SEED_ADMIN_USERNAME: str = "admin"
    SEED_ADMIN_PASSWORD: str = "Admin@SAS2024"
    SEED_ADMIN_EMAIL: str = "admin@sas.edu"

    class Config:
        env_file = [
            ".env",
            "../.env",
            os.path.join(os.path.dirname(__file__), "..", ".env"),
            os.path.join(os.path.dirname(__file__), "..", "..", ".env")
        ]
        env_file_encoding = "utf-8"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()

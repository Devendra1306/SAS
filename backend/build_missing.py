import os

files_to_create = {
    r"K:\SAS\.env": """MONGODB_URI=mongodb+srv://devendrasagar0988_db_user:6NJn3Zr4yQDiMmM4@cluster0.7pghmof.mongodb.net
MONGODB_DATABASE=sas_db
PINECONE_API_KEY=pcsk_6m5JB4_TWm4zkxkjWBWL1G6oDJBAzkCxevARoqS7Fw74Vxo6ZPZhik2rNGVnd7LJnLaLRg
PINECONE_INDEX_NAME=sas
PINECONE_HOST=https://sas-l1eckiy.svc.aped-4627-b74a.pinecone.io
PINECONE_NAMESPACE=college_students
JWT_SECRET=supersecret
JWT_REFRESH_SECRET=superrefreshsecret
JWT_ALGORITHM=HS256
""",
    r"K:\SAS\backend\app\config.py": """from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    MONGODB_URI: str = "mongodb://localhost:27017"
    MONGODB_DATABASE: str = "sas_db"
    JWT_SECRET: str = "secret"
    JWT_REFRESH_SECRET: str = "refresh_secret"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    PINECONE_API_KEY: str = ""
    PINECONE_INDEX_NAME: str = "sas-faces"
    PINECONE_HOST: str = ""
    PINECONE_NAMESPACE: str = "college_students"
    PINECONE_ENVIRONMENT: str = "us-east-1"
    INSIGHTFACE_MODEL: str = "buffalo_l"
    AI_MODEL_DIR: str = "./models"
    ANTISPOOF_MODEL_PATH: str = "./models/antispoof.onnx"
    FACE_MATCH_THRESHOLD: float = 0.6
    LOW_ATTENDANCE_THRESHOLD: float = 0.5
    HIGH_ATTENDANCE_THRESHOLD: float = 0.9
    BACKEND_HOST: str = "0.0.0.0"
    BACKEND_PORT: int = 8000
    CORS_ORIGINS: List[str] = ["*"]
    APP_MODE: str = "development"

    class Config:
        env_file = r"K:\SAS\.env"
        extra = "ignore"

settings = Settings()
""",
    r"K:\SAS\backend\app\vector_db\pinecone_service.py": """from pinecone import Pinecone
from app.config import settings

class PineconeService:
    def __init__(self):
        try:
            self.pc = Pinecone(api_key=settings.PINECONE_API_KEY)
            self.index = self.pc.Index(host=settings.PINECONE_HOST)
        except Exception as e:
            print(f"Failed to init Pinecone: {e}")
            self.pc = None
            self.index = None

    def upsert_embedding(self, vector_id: str, embedding: list, metadata: dict):
        if not self.index: return False
        try:
            self.index.upsert(
                vectors=[{"id": vector_id, "values": embedding, "metadata": metadata}],
                namespace=settings.PINECONE_NAMESPACE
            )
            return True
        except Exception as e:
            print(f"Pinecone upsert error: {e}")
            return False

    def query_embedding(self, embedding: list, top_k: int = 1):
        if not self.index: return {"matches": []}
        try:
            results = self.index.query(
                namespace=settings.PINECONE_NAMESPACE,
                vector=embedding,
                top_k=top_k,
                include_metadata=True
            )
            return results
        except Exception as e:
            print(f"Pinecone query error: {e}")
            return {"matches": []}

pinecone_service = PineconeService()
""",
    r"K:\SAS\backend\app\models\__init__.py": "",
    r"K:\SAS\backend\app\models\user.py": "class User:\n    pass\n",
    r"K:\SAS\backend\app\models\student.py": "class Student:\n    pass\n",
    r"K:\SAS\backend\app\models\faculty.py": "class Faculty:\n    pass\n",
    r"K:\SAS\backend\app\models\subject.py": "class Subject:\n    pass\n",
    r"K:\SAS\backend\app\models\attendance.py": "class Attendance:\n    pass\n",
    r"K:\SAS\backend\app\models\audit_log.py": "class AuditLog:\n    pass\n",
    r"K:\SAS\backend\app\models\face_enrollment.py": "class FaceEnrollment:\n    pass\n",
    
    r"K:\SAS\backend\app\schemas\__init__.py": "",
    r"K:\SAS\backend\app\schemas\student.py": "from pydantic import BaseModel\nclass StudentCreate(BaseModel):\n    student_id: str\n    name: str\nclass StudentUpdate(BaseModel):\n    name: str\nclass StudentResponse(BaseModel):\n    student_id: str\n    name: str\n",
    r"K:\SAS\backend\app\schemas\faculty.py": "from pydantic import BaseModel\nclass FacultyCreate(BaseModel):\n    faculty_id: str\n    name: str\nclass FacultyUpdate(BaseModel):\n    name: str\nclass FacultyResponse(BaseModel):\n    faculty_id: str\n    name: str\n",
    r"K:\SAS\backend\app\schemas\subject.py": "from pydantic import BaseModel\nclass SubjectCreate(BaseModel):\n    subject_code: str\nclass SubjectUpdate(BaseModel):\n    subject_code: str\nclass SubjectResponse(BaseModel):\n    subject_code: str\n",
    r"K:\SAS\backend\app\schemas\attendance.py": "from pydantic import BaseModel\nclass SessionCreate(BaseModel):\n    subject_id: str\nclass AttendanceResponse(BaseModel):\n    student_id: str\nclass AttendanceMark(BaseModel):\n    student_id: str\n",
    r"K:\SAS\backend\app\schemas\analytics.py": "from pydantic import BaseModel\nclass DashboardStats(BaseModel):\n    total: int\nclass MonthlyStats(BaseModel):\n    total: int\nclass SubjectStats(BaseModel):\n    total: int\n",
    
    r"K:\SAS\backend\app\services\__init__.py": "",
    r"K:\SAS\backend\app\services\auth_service.py": "class AuthService:\n    pass\n",
    r"K:\SAS\backend\app\services\student_service.py": "class StudentService:\n    pass\n",
    r"K:\SAS\backend\app\services\faculty_service.py": "class FacultyService:\n    pass\n",
    r"K:\SAS\backend\app\services\subject_service.py": "class SubjectService:\n    pass\n",
    r"K:\SAS\backend\app\services\attendance_service.py": "class AttendanceService:\n    pass\n",
    r"K:\SAS\backend\app\services\analytics_service.py": "class AnalyticsService:\n    pass\n",
    r"K:\SAS\backend\app\services\notification_service.py": "class NotificationService:\n    pass\n",
    r"K:\SAS\backend\app\services\report_service.py": "class ReportService:\n    pass\n",
    
    r"K:\SAS\backend\app\ai\__init__.py": "",
    r"K:\SAS\backend\app\ai\pipeline.py": "def process_frame():\n    pass\n",
    r"K:\SAS\backend\app\ai\face_detector.py": "def detect():\n    pass\n",
    r"K:\SAS\backend\app\ai\face_aligner.py": "def align():\n    pass\n",
    r"K:\SAS\backend\app\ai\face_quality.py": "def check_quality():\n    pass\n",
    r"K:\SAS\backend\app\ai\liveness_detector.py": "def is_live():\n    return True\n",
    r"K:\SAS\backend\app\ai\embedding_generator.py": "def generate():\n    pass\n",
    r"K:\SAS\backend\app\ai\vector_search.py": "def search():\n    pass\n",
    r"K:\SAS\backend\app\ai\face_tracker.py": "def track():\n    pass\n",
    
    r"K:\SAS\backend\app\api\students.py": "from fastapi import APIRouter\nrouter = APIRouter(prefix='/students', tags=['students'])\n@router.get('/')\ndef list_students():\n    return []\n",
    r"K:\SAS\backend\app\api\faculty.py": "from fastapi import APIRouter\nrouter = APIRouter(prefix='/faculty', tags=['faculty'])\n@router.get('/')\ndef list_faculty():\n    return []\n",
    r"K:\SAS\backend\app\api\subjects.py": "from fastapi import APIRouter\nrouter = APIRouter(prefix='/subjects', tags=['subjects'])\n@router.get('/')\ndef list_subjects():\n    return []\n",
    r"K:\SAS\backend\app\api\analytics.py": "from fastapi import APIRouter\nrouter = APIRouter(prefix='/analytics', tags=['analytics'])\n@router.get('/dashboard')\ndef dashboard():\n    return {}\n",
    r"K:\SAS\backend\app\api\reports.py": "from fastapi import APIRouter\nrouter = APIRouter(prefix='/reports', tags=['reports'])\n@router.get('/export')\ndef export():\n    return {}\n",
    r"K:\SAS\backend\app\api\websocket.py": "from fastapi import APIRouter, WebSocket\nrouter = APIRouter(tags=['websocket'])\n@router.websocket('/ws/attendance/{session_id}')\nasync def ws(websocket: WebSocket, session_id: str):\n    await websocket.accept()\n",
    
    r"K:\SAS\backend\app\__init__.py": "",
    r"K:\SAS\backend\app\auth\__init__.py": "",
    r"K:\SAS\backend\app\database\__init__.py": "",
    r"K:\SAS\backend\scripts\__init__.py": "",
    r"K:\SAS\backend\tests\__init__.py": "",
    r"K:\SAS\backend\tests\conftest.py": "import pytest\n",
    r"K:\SAS\backend\tests\test_auth.py": "def test_auth():\n    pass\n",
    r"K:\SAS\backend\tests\test_students.py": "def test_students():\n    pass\n",
    r"K:\SAS\backend\tests\test_attendance.py": "def test_attendance():\n    pass\n",
    r"K:\SAS\backend\tests\test_pinecone.py": "def test_pinecone():\n    pass\n",
    r"K:\SAS\backend\tests\test_security.py": "def test_security():\n    pass\n",
    
    r"K:\SAS\backend\app\main.py": """from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database.mongodb import connect_to_mongo, close_mongo_connection
from app.database.collections import create_indexes
from app.api import api_router
from app.api.websocket import router as ws_router
import contextlib

@contextlib.asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_mongo()
    await create_indexes()
    yield
    await close_mongo_connection()

app = FastAPI(title="SAS Backend", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")
app.include_router(ws_router)

@app.get("/health")
async def health():
    return {"status": "ok"}
""",
    r"K:\SAS\backend\app\api\__init__.py": """from fastapi import APIRouter
from app.api.auth import router as auth_router
from app.api.attendance import router as attendance_router
from app.api.students import router as students_router
from app.api.faculty import router as faculty_router
from app.api.subjects import router as subjects_router
from app.api.analytics import router as analytics_router
from app.api.reports import router as reports_router

api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(attendance_router)
api_router.include_router(students_router)
api_router.include_router(faculty_router)
api_router.include_router(subjects_router)
api_router.include_router(analytics_router)
api_router.include_router(reports_router)
"""
}

# Add missing attendance routes
files_to_create[r"K:\SAS\backend\app\api\attendance.py"] = """from fastapi import APIRouter, Depends, HTTPException, WebSocket
from pydantic import BaseModel
from typing import List, Optional
import base64
import numpy as np
import cv2
from app.ai.face_recognizer import process_frame
from app.vector_db.pinecone_service import pinecone_service
from app.database.mongodb import get_database
from app.auth.dependencies import get_current_user, require_faculty
from datetime import datetime

router = APIRouter(prefix="/attendance", tags=["attendance"])

class RecognizeRequest(BaseModel):
    session_id: str
    frame_base64: str

class FaceResult(BaseModel):
    student_id: Optional[str]
    name: Optional[str]
    score: float
    status: str

@router.post("/session")
async def create_session(): return {}

@router.put("/session/{id}/end")
async def end_session(id: str): return {}

@router.post("/recognize", response_model=List[FaceResult])
async def recognize_faces(request: RecognizeRequest, current_user: dict = Depends(require_faculty)):
    # Decode base64 frame
    try:
        img_data = base64.b64decode(request.frame_base64)
        np_arr = np.frombuffer(img_data, np.uint8)
        frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image format")
        
    if frame is None:
        raise HTTPException(status_code=400, detail="Empty frame")

    faces = process_frame(frame)
    results = []
    db = get_database()
    
    for face in faces:
        if face["det_score"] < 0.5: continue
            
        emb = face["embedding"]
        match_result = pinecone_service.query_embedding(emb, top_k=1)
        
        best_match = None
        if match_result and match_result.get("matches"):
            match = match_result["matches"][0]
            if match["score"] >= 0.6: best_match = match
                
        if best_match:
            student_id = best_match["metadata"].get("student_id")
            student = await db.students.find_one({"student_id": student_id})
            if student:
                try:
                    await db.attendance.insert_one({
                        "session_id": request.session_id,
                        "student_id": student_id,
                        "date": datetime.utcnow(),
                        "timestamp": datetime.utcnow(),
                        "status": "PRESENT",
                        "recognition_score": best_match["score"],
                        "verification_method": "AI_FACE"
                    })
                    status = "PRESENT"
                except Exception:
                    status = "DUPLICATE"
                
                results.append(FaceResult(student_id=student_id, name=student.get("name"), score=best_match["score"], status=status))
            else:
                results.append(FaceResult(student_id=None, name=None, score=best_match["score"], status="UNKNOWN"))
        else:
            results.append(FaceResult(student_id=None, name=None, score=0.0, status="UNKNOWN"))
            
    return results

@router.post("/mark")
async def mark_attendance(): return {}

@router.get("/")
async def list_attendance(): return []

@router.get("/student/{id}")
async def get_student_attendance(id: str): return []

@router.get("/session/{id}")
async def get_session_attendance(id: str): return []

@router.get("/low")
async def get_low_attendance(): return []

@router.get("/high")
async def get_high_attendance(): return []

@router.put("/{id}")
async def manual_correction(id: str): return {}
"""

for path, content in files_to_create.items():
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

print("All files created.")

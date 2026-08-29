from fastapi import APIRouter
from app.api import auth, students, faculty, subjects, attendance, analytics, reports

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(students.router)
api_router.include_router(faculty.router)
api_router.include_router(subjects.router)
api_router.include_router(attendance.router)
api_router.include_router(analytics.router)
api_router.include_router(reports.router)

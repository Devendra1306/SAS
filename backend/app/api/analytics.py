from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional

from app.auth.dependencies import require_admin
from app.services import analytics_service

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/dashboard")
async def dashboard_stats(current_user: dict = Depends(require_admin)):
    return await analytics_service.get_dashboard_stats()


@router.get("/weekly")
async def weekly_attendance(current_user: dict = Depends(require_admin)):
    return await analytics_service.get_weekly_attendance()


@router.get("/monthly")
async def monthly_attendance(
    months: int = Query(6, ge=1, le=12),
    current_user: dict = Depends(require_admin)
):
    return await analytics_service.get_monthly_attendance(months)


@router.get("/subject")
async def subject_stats(current_user: dict = Depends(require_admin)):
    return await analytics_service.get_subject_stats()


@router.get("/department")
async def department_stats(current_user: dict = Depends(require_admin)):
    return await analytics_service.get_department_stats()


@router.get("/student/{student_id}")
async def student_stats(
    student_id: str,
    current_user: dict = Depends(require_admin)  # or student themselves
):
    return await analytics_service.get_student_subject_stats(student_id)

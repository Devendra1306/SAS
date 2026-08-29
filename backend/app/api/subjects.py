from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional

from app.auth.dependencies import require_admin, require_faculty
from app.schemas.subject import SubjectCreate, SubjectUpdate
from app.services import subject_service

router = APIRouter(prefix="/subjects", tags=["subjects"])


@router.get("")
async def list_subjects(
    department: Optional[str] = None,
    year: Optional[int] = None,
    section: Optional[str] = None,
    faculty_id: Optional[str] = None,
    current_user: dict = Depends(require_faculty)
):
    return await subject_service.get_subjects(department, year, section, faculty_id)


@router.post("", status_code=201)
async def create_subject(
    data: SubjectCreate,
    current_user: dict = Depends(require_admin)
):
    from app.database.mongodb import get_database
    db = get_database()
    if await db.subjects.find_one({"subject_code": data.subject_code}):
        raise HTTPException(status_code=409, detail="Subject code already exists")
    return await subject_service.create_subject(data.model_dump())


@router.put("/{subject_id}")
async def update_subject(
    subject_id: str,
    data: SubjectUpdate,
    current_user: dict = Depends(require_admin)
):
    subject = await subject_service.update_subject(subject_id, data.model_dump(exclude_unset=True))
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    return subject


@router.delete("/{subject_id}")
async def delete_subject(
    subject_id: str,
    current_user: dict = Depends(require_admin)
):
    success = await subject_service.delete_subject(subject_id)
    if not success:
        raise HTTPException(status_code=404, detail="Subject not found")
    return {"message": "Subject deleted"}

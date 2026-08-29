from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional

from app.auth.dependencies import require_admin, require_faculty
from app.schemas.faculty import FacultyCreate, FacultyUpdate
from app.services import faculty_service
from app.database.mongodb import get_database

router = APIRouter(prefix="/faculty", tags=["faculty"])


@router.get("")
async def list_faculty(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    department: Optional[str] = None,
    current_user: dict = Depends(require_admin)
):
    return await faculty_service.get_all_faculty(page, page_size, department)


@router.post("", status_code=201)
async def create_faculty(
    data: FacultyCreate,
    current_user: dict = Depends(require_admin)
):
    db = get_database()
    if await db.faculty.find_one({"faculty_id": data.faculty_id}):
        raise HTTPException(status_code=409, detail="Faculty ID already exists")
    if await db.users.find_one({"email": data.email}):
        raise HTTPException(status_code=409, detail="Email already registered")
    return await faculty_service.create_faculty(data.model_dump())


@router.get("/{faculty_id}")
async def get_faculty(
    faculty_id: str,
    current_user: dict = Depends(require_faculty)
):
    faculty = await faculty_service.get_faculty_by_id(faculty_id)
    if not faculty:
        raise HTTPException(status_code=404, detail="Faculty not found")
    return faculty


@router.put("/{faculty_id}")
async def update_faculty(
    faculty_id: str,
    data: FacultyUpdate,
    current_user: dict = Depends(require_admin)
):
    faculty = await faculty_service.update_faculty(faculty_id, data.model_dump(exclude_unset=True))
    if not faculty:
        raise HTTPException(status_code=404, detail="Faculty not found")
    return faculty


@router.delete("/{faculty_id}")
async def delete_faculty(
    faculty_id: str,
    current_user: dict = Depends(require_admin)
):
    success = await faculty_service.delete_faculty(faculty_id)
    if not success:
        raise HTTPException(status_code=404, detail="Faculty not found")
    return {"message": "Faculty deactivated"}

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from typing import List, Optional
import base64, io
import numpy as np

from app.auth.dependencies import require_admin, get_current_user
from app.schemas.student import StudentCreate, StudentUpdate, StudentResponse, StudentListResponse
from app.services import student_service
from app.ai.pipeline import get_pipeline
from app.vector_db.pinecone_service import pinecone_service
from app.database.mongodb import get_database

router = APIRouter(prefix="/students", tags=["students"])


@router.get("", response_model=StudentListResponse)
async def list_students(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    department: Optional[str] = None,
    year: Optional[int] = None,
    section: Optional[str] = None,
    search: Optional[str] = None,
    current_user: dict = Depends(require_admin)
):
    return await student_service.get_students(page, page_size, department, year, section, search)


@router.post("", status_code=201)
async def create_student(
    data: StudentCreate,
    current_user: dict = Depends(require_admin)
):
    db = get_database()
    # Check duplicates
    if await db.students.find_one({"student_id": data.student_id}):
        raise HTTPException(status_code=409, detail="Student ID already exists")
    if await db.students.find_one({"roll_number": data.roll_number}):
        raise HTTPException(status_code=409, detail="Roll number already exists")
    if await db.users.find_one({"email": data.email}):
        raise HTTPException(status_code=409, detail="Email already registered")
    return await student_service.create_student(data.model_dump())


@router.get("/{student_id}")
async def get_student(
    student_id: str,
    current_user: dict = Depends(get_current_user)
):
    # Student can only view their own record
    if current_user["role"] == "STUDENT":
        student = await student_service.get_student_by_id(student_id)
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")
        # Verify ownership
        db = get_database()
        own = await db.students.find_one({"user_id": current_user["_id"]})
        if not own or str(own.get("student_id")) != student.get("student_id"):
            raise HTTPException(status_code=403, detail="Access denied")
        return student
    student = await student_service.get_student_by_id(student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student


@router.put("/{student_id}")
async def update_student(
    student_id: str,
    data: StudentUpdate,
    current_user: dict = Depends(require_admin)
):
    student = await student_service.update_student(student_id, data.model_dump(exclude_unset=True))
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student


@router.delete("/{student_id}")
async def delete_student(
    student_id: str,
    current_user: dict = Depends(require_admin)
):
    success = await student_service.delete_student(student_id)
    if not success:
        raise HTTPException(status_code=404, detail="Student not found")
    return {"message": "Student deactivated"}


@router.post("/{student_id}/face-enrollment")
async def enroll_face(
    student_id: str,
    files: List[UploadFile] = File(...),
    current_user: dict = Depends(require_admin)
):
    """Enroll face images for a student. Extracts ArcFace embeddings and stores in Pinecone."""
    if not files:
        raise HTTPException(status_code=400, detail="No images provided")
    if len(files) > 10:
        raise HTTPException(status_code=400, detail="Maximum 10 images allowed")

    # Get student
    student = await student_service.get_student_by_id(student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    pipeline = get_pipeline()
    db = get_database()

    enrolled_vector_ids = []
    quality_scores = []
    errors = []
    idx = 1

    for file in files:
        try:
            import cv2
            content = await file.read()
            np_arr = np.frombuffer(content, np.uint8)
            img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
            if img is None:
                errors.append(f"{file.filename}: could not decode image")
                continue

            result = await pipeline.process_enrollment_image(img)
            embedding = result["embedding"]
            quality = result["quality"]
            quality_scores.append(quality.get("score", 0.0))

            vector_id = f"student_{student['student_id']}_{idx:03d}"
            metadata = {
                "student_id": student["student_id"],
                "name": student["name"],
                "department": student["department"],
                "year": student["year"],
                "section": student["section"]
            }
            success = pinecone_service.upsert_embedding(vector_id, embedding, metadata)
            if success:
                enrolled_vector_ids.append(vector_id)
                idx += 1
            else:
                errors.append(f"{file.filename}: failed to store in Pinecone")
        except ValueError as ve:
            errors.append(f"{file.filename}: {str(ve)}")
        except Exception as e:
            errors.append(f"{file.filename}: {str(e)}")

    if not enrolled_vector_ids:
        raise HTTPException(status_code=400, detail=f"No faces enrolled. Errors: {errors}")

    # Update face_enrollments collection
    await db.face_enrollments.update_one(
        {"student_id": student["student_id"]},
        {"$set": {
            "student_id": student["student_id"],
            "pinecone_vector_ids": enrolled_vector_ids,
            "enrollment_count": len(enrolled_vector_ids),
            "quality_scores": quality_scores
        }},
        upsert=True
    )

    # Sync to students collection
    await db.students.update_one(
        {"student_id": student["student_id"]},
        {"$set": {
            "is_face_enrolled": True,
            "face_enrolled": True,
            "enrollment_count": len(enrolled_vector_ids),
            "updated_at": datetime.utcnow()
        }}
    )

    # Sync to users collection
    await db.users.update_one(
        {"username": student["student_id"]},
        {"$set": {"face_enrolled": True}}
    )

    return {
        "message": f"Successfully enrolled {len(enrolled_vector_ids)} face(s)",
        "enrolled_count": len(enrolled_vector_ids),
        "vector_ids": enrolled_vector_ids,
        "quality_scores": quality_scores,
        "errors": errors
    }


@router.delete("/{student_id}/face-enrollment")
async def delete_enrollment(
    student_id: str,
    current_user: dict = Depends(require_admin)
):
    """Remove all face embeddings for a student from Pinecone."""
    db = get_database()
    enrollment = await db.face_enrollments.find_one({"student_id": student_id})
    if not enrollment:
        raise HTTPException(status_code=404, detail="No face enrollment found")

    vector_ids = enrollment.get("pinecone_vector_ids", [])
    if vector_ids:
        pinecone_service.delete_vectors(vector_ids)

    await db.face_enrollments.delete_one({"student_id": student_id})

    # Clear flags on students and users collections
    await db.students.update_one(
        {"student_id": student_id},
        {"$set": {
            "is_face_enrolled": False,
            "face_enrolled": False,
            "enrollment_count": 0,
            "updated_at": datetime.utcnow()
        }}
    )
    await db.users.update_one(
        {"username": student_id},
        {"$set": {"face_enrolled": False}}
    )
    return {"message": f"Deleted {len(vector_ids)} embeddings"}

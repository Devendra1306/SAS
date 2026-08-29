import base64
import logging
import numpy as np
from datetime import datetime
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from bson import ObjectId

from app.auth.dependencies import require_faculty, require_admin, get_current_user
from app.schemas.attendance import (
    SessionCreate, AttendanceMark, AttendanceUpdate,
    RecognizeRequest, RecognizeResponse, FaceResultResponse,
    LocationVerifyRequest, LocationVerifyResponse
)
from app.services import attendance_service
from app.ai.pipeline import get_pipeline
from app.ai.vector_search import search_face
from app.ai.embedding_generator import normalize_embedding
from app.database.mongodb import get_database
from app.api.websocket import broadcast_to_session
from app.config import settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/attendance", tags=["attendance"])


class RecognizeOneRequest(BaseModel):
    session_id: str
    frame_base64: Optional[str] = None
    manual_student_id: Optional[str] = None


class StudentDetail(BaseModel):
    id: str
    student_id: str
    name: str
    roll_number: Optional[str] = None
    department: str
    year: int
    section: str
    email: Optional[str] = None
    phone: Optional[str] = None


class RecognizeOneResponse(BaseModel):
    success: bool
    matched: bool
    status: str  # PRESENT | DUPLICATE | NO_MATCH | NO_FACE | NOT_IN_CLASS | MANUAL_MARKED
    student: Optional[StudentDetail] = None
    score: Optional[float] = None
    message: str
    timestamp: datetime = datetime.utcnow()
    total_present: int = 0
    total_enrolled: int = 0


class CalibrateLocationRequest(BaseModel):
    name: str
    latitude: float
    longitude: float
    allowed_radius_meters: Optional[float] = 500.0
    classroom_id: Optional[str] = None


# ── Location & Geofencing Endpoints ──────────────────────────────────────────

@router.get("/locations")
async def list_authorized_locations(current_user: dict = Depends(require_faculty)):
    """Returns the authorized campus / classroom locations and geofence radius."""
    return await attendance_service.get_authorized_locations()


@router.post("/verify-location", response_model=LocationVerifyResponse)
async def verify_location(
    request: LocationVerifyRequest,
    current_user: dict = Depends(require_faculty)
):
    """
    Verifies if faculty's current device coordinates are within 500m
    of authorized campus locations in Tadepalligudem.
    """
    res = await attendance_service.verify_faculty_location(
        latitude=request.latitude,
        longitude=request.longitude,
        classroom_id=request.classroom_id,
        accuracy=request.accuracy
    )
    return LocationVerifyResponse(**res)


@router.post("/calibrate-location")
async def calibrate_location(
    request: CalibrateLocationRequest,
    current_user: dict = Depends(require_faculty)
):
    """Calibrates/Saves faculty current GPS coordinates as an authorized classroom pin in MongoDB."""
    saved = await attendance_service.save_custom_location(request.model_dump())
    return {
        "success": True,
        "location": saved,
        "message": f"Successfully registered '{saved['name']}' as an authorized location!"
    }


# ── Sessions ─────────────────────────────────────────────────────────────────

@router.post("/session", status_code=201)
async def create_session(
    data: SessionCreate,
    current_user: dict = Depends(require_faculty)
):
    faculty_id = current_user["_id"]
    try:
        session = await attendance_service.create_session(faculty_id, data.model_dump())
        return session
    except ValueError as ve:
        if "LOCATION_BLOCKED" in str(ve):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=str(ve).replace("LOCATION_BLOCKED: ", "")
            )
        raise HTTPException(status_code=400, detail=str(ve))


@router.put("/session/{session_id}/end")
async def end_session(
    session_id: str,
    current_user: dict = Depends(require_faculty)
):
    session = await attendance_service.end_session(session_id, current_user["_id"])
    if not session:
        raise HTTPException(status_code=404, detail="Session not found or not yours")
    await broadcast_to_session(session_id, {"type": "SESSION_ENDED", "session_id": session_id})
    return session


@router.get("/session/{session_id}")
async def get_session_attendance(
    session_id: str,
    current_user: dict = Depends(require_faculty)
):
    records = await attendance_service.get_session_attendance(session_id)
    session = await attendance_service.get_session(session_id)
    return {"session": session, "records": records, "total": len(records)}


@router.get("/session/{session_id}/roster")
async def get_session_roster(
    session_id: str,
    current_user: dict = Depends(require_faculty)
):
    """Returns all students for the session's department/year/section with attendance status."""
    db = get_database()
    session = await attendance_service.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    students_cur = db.students.find({
        "department": session.get("department"),
        "year": int(session.get("year", 4)),
        "section": session.get("section", "A"),
        "is_active": True
    })
    students = await students_cur.to_list(100)

    attendance_records = await db.attendance.find({"session_id": session_id}).to_list(200)
    marked_map = {r["student_id"]: r for r in attendance_records}

    roster = []
    for s in students:
        st_id = s.get("student_id")
        rec = marked_map.get(st_id)
        roster.append({
            "id": str(s["_id"]),
            "student_id": st_id,
            "name": s.get("name"),
            "roll_number": s.get("roll_number", st_id),
            "department": s.get("department"),
            "year": s.get("year"),
            "section": s.get("section"),
            "is_marked": rec is not None,
            "status": rec.get("status") if rec else "PENDING",
            "score": rec.get("recognition_score") if rec else None,
            "verification_method": rec.get("verification_method") if rec else None,
            "timestamp": rec.get("timestamp") if rec else None
        })

    return {
        "session": session,
        "roster": roster,
        "total_enrolled": len(roster),
        "total_present": len([r for r in roster if r["is_marked"] and r["status"] == "PRESENT"])
    }


# ── One-by-One Recognition Endpoint ──────────────────────────────────────────

@router.post("/recognize-one", response_model=RecognizeOneResponse)
async def recognize_one_student(
    request: RecognizeOneRequest,
    current_user: dict = Depends(require_faculty)
):
    db = get_database()
    session = await attendance_service.get_session(request.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    async def get_totals():
        total_p = await db.attendance.count_documents({"session_id": request.session_id, "status": "PRESENT"})
        total_e = await db.students.count_documents({
            "department": session.get("department"),
            "year": int(session.get("year", 4)),
            "section": session.get("section", "A"),
            "is_active": True
        })
        return total_p, total_e

    # 1. Manual selection branch
    if request.manual_student_id:
        student = await db.students.find_one({
            "$or": [{"student_id": request.manual_student_id.upper()}, {"_id": ObjectId(request.manual_student_id) if ObjectId.is_valid(request.manual_student_id) else None}]
        })
        if not student:
            total_p, total_e = await get_totals()
            return RecognizeOneResponse(
                success=False, matched=False, status="NO_MATCH",
                message=f"Student {request.manual_student_id} not found in database",
                total_present=total_p, total_enrolled=total_e
            )

        try:
            await attendance_service.mark_attendance({
                "session_id": request.session_id,
                "student_id": student["student_id"],
                "status": "PRESENT",
                "recognition_score": 1.0,
                "verification_method": "MANUAL"
            })
            status_res = "PRESENT"
            msg = f"{student['name']} ({student['student_id']}) marked Present manually."
        except ValueError as ve:
            if "DUPLICATE" in str(ve):
                status_res = "DUPLICATE"
                msg = f"{student['name']} ({student['student_id']}) is already marked Present."
            else:
                status_res = "ERROR"
                msg = str(ve)

        total_p, total_e = await get_totals()
        return RecognizeOneResponse(
            success=True,
            matched=True,
            status=status_res,
            student=StudentDetail(
                id=str(student["_id"]),
                student_id=student["student_id"],
                name=student["name"],
                roll_number=student.get("roll_number", student["student_id"]),
                department=student.get("department", session.get("department")),
                year=int(student.get("year", session.get("year"))),
                section=student.get("section", session.get("section")),
                email=student.get("email"),
                phone=student.get("phone")
            ),
            score=1.0,
            message=msg,
            total_present=total_p,
            total_enrolled=total_e
        )

    # 2. AI Model & Pinecone Vector Search branch
    if not request.frame_base64:
        total_p, total_e = await get_totals()
        return RecognizeOneResponse(
            success=False, matched=False, status="NO_FACE",
            message="No camera image received. Please capture student photo.",
            total_present=total_p, total_enrolled=total_e
        )

    raw_b64 = request.frame_base64
    if "," in raw_b64:
        raw_b64 = raw_b64.split(",", 1)[1]

    try:
        img_data = base64.b64decode(raw_b64)
        np_arr = np.frombuffer(img_data, np.uint8)
        import cv2
        frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        if frame is None:
            raise ValueError("Could not decode image")
    except Exception as e:
        total_p, total_e = await get_totals()
        return RecognizeOneResponse(
            success=False, matched=False, status="NO_FACE",
            message=f"Invalid image format: {str(e)}",
            total_present=total_p, total_enrolled=total_e
        )

    pipeline = get_pipeline()
    detections = pipeline.detector.detect(frame)
    if not detections:
        total_p, total_e = await get_totals()
        return RecognizeOneResponse(
            success=False, matched=False, status="NO_FACE",
            message="No face detected in photo. Please ask student to look directly into camera.",
            total_present=total_p, total_enrolled=total_e
        )

    det = max(detections, key=lambda d: (d["bbox"][2] - d["bbox"][0]) * (d["bbox"][3] - d["bbox"][1]))
    embedding = det.get("embedding")
    if embedding is None:
        total_p, total_e = await get_totals()
        return RecognizeOneResponse(
            success=False, matched=False, status="NO_FACE",
            message="Could not extract facial embedding vectors. Please retake photo.",
            total_present=total_p, total_enrolled=total_e
        )

    emb_norm = normalize_embedding(np.array(embedding))
    search_result = await search_face(emb_norm)
    score = search_result.get("score", 0.0)
    matched_student_id = search_result.get("student_id")

    if not search_result.get("matched") or not matched_student_id:
        total_p, total_e = await get_totals()
        return RecognizeOneResponse(
            success=False,
            matched=False,
            status="NO_MATCH",
            score=score,
            message=f"Face not recognized in Pinecone database (Confidence: {round(score*100, 1)}%). Student may select manual roll call.",
            total_present=total_p,
            total_enrolled=total_e
        )

    student = await db.students.find_one({"student_id": matched_student_id})
    if not student:
        total_p, total_e = await get_totals()
        return RecognizeOneResponse(
            success=False,
            matched=False,
            status="NO_MATCH",
            score=score,
            message=f"Vector ID {matched_student_id} matched but student profile not found in database.",
            total_present=total_p,
            total_enrolled=total_e
        )

    try:
        await attendance_service.mark_attendance({
            "session_id": request.session_id,
            "student_id": student["student_id"],
            "status": "PRESENT",
            "recognition_score": score,
            "verification_method": "AI_FACE"
        })
        status_res = "PRESENT"
        msg = f"✓ {student['name']} ({student['student_id']}) recognized via Pinecone ({round(score*100, 1)}% match) & marked Present!"
    except ValueError as ve:
        if "DUPLICATE" in str(ve):
            status_res = "DUPLICATE"
            msg = f"{student['name']} ({student['student_id']}) was already marked Present for this lecture."
        else:
            status_res = "ERROR"
            msg = str(ve)

    total_p, total_e = await get_totals()
    return RecognizeOneResponse(
        success=True,
        matched=True,
        status=status_res,
        student=StudentDetail(
            id=str(student["_id"]),
            student_id=student["student_id"],
            name=student["name"],
            roll_number=student.get("roll_number", student["student_id"]),
            department=student.get("department", session.get("department")),
            year=int(student.get("year", session.get("year"))),
            section=student.get("section", session.get("section")),
            email=student.get("email"),
            phone=student.get("phone")
        ),
        score=score,
        message=msg,
        total_present=total_p,
        total_enrolled=total_e
    )


# ── Attendance CRUD ───────────────────────────────────────────────────────────

@router.post("/mark", status_code=201)
async def mark_attendance_manual(
    data: AttendanceMark,
    current_user: dict = Depends(require_faculty)
):
    try:
        record = await attendance_service.mark_attendance(data.model_dump())
        return record
    except ValueError as ve:
        if "DUPLICATE" in str(ve):
            raise HTTPException(status_code=409, detail="Student already marked for this session")
        raise HTTPException(status_code=400, detail=str(ve))


@router.get("")
async def list_attendance(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    subject_id: Optional[str] = None,
    faculty_id: Optional[str] = None,
    status: Optional[str] = None,
    current_user: dict = Depends(require_faculty)
):
    return await attendance_service.get_attendance_list(
        page, page_size, date_from, date_to, None, subject_id, faculty_id, status
    )


@router.get("/student/{student_id}")
async def get_student_attendance(
    student_id: str,
    subject_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] == "STUDENT":
        db = get_database()
        own = await db.students.find_one({"user_id": current_user["_id"]})
        if not own or own.get("student_id") != student_id:
            raise HTTPException(status_code=403, detail="Access denied")
    return await attendance_service.get_student_attendance(student_id, subject_id)


@router.get("/low")
async def low_attendance(
    threshold: Optional[float] = None,
    current_user: dict = Depends(require_admin)
):
    return await attendance_service.get_low_attendance_students(threshold)


@router.get("/high")
async def high_attendance(
    threshold: Optional[float] = None,
    current_user: dict = Depends(require_admin)
):
    return await attendance_service.get_high_attendance_students(threshold)


@router.put("/{attendance_id}")
async def update_attendance(
    attendance_id: str,
    data: AttendanceUpdate,
    current_user: dict = Depends(require_faculty)
):
    record = await attendance_service.update_attendance(
        attendance_id=attendance_id,
        status=data.status,
        changed_by_user_id=current_user["_id"],
        reason=data.reason
    )
    if not record:
        raise HTTPException(status_code=404, detail="Attendance record not found")
    return record

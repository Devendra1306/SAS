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

@router.post("/recognize", response_model=RecognizeOneResponse)
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

    student = await db.students.find_one({
        "$or": [
            {"student_id": matched_student_id},
            {"student_id": matched_student_id.upper()},
            {"student_id": matched_student_id.lower()}
        ]
    })
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


# ── On-The-Spot Attendance Endpoints ──────────────────────────────────────────

class SpotMarkRequest(BaseModel):
    session_id: Optional[str] = None
    student_id: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    accuracy: Optional[float] = None


@router.post("/spot-mark")
async def spot_mark_attendance(
    request: SpotMarkRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Marks attendance on the spot using real-time location telemetry.
    Students can mark themselves present when within the classroom boundaries.
    Faculty can 1-click mark nearby students present.
    """
    db = get_database()
    role = current_user.get("role")

    # 1. Resolve student record
    student = None
    if role == "STUDENT":
        student = await db.students.find_one({
            "$or": [
                {"user_id": str(current_user["_id"])},
                {"student_id": current_user.get("username")},
                {"email": current_user.get("email")}
            ]
        })
        if not student:
            raise HTTPException(status_code=404, detail="Student profile not found")
    elif role in ["FACULTY", "ADMIN"]:
        if not request.student_id:
            raise HTTPException(status_code=400, detail="Student ID required for faculty spot-marking")
        student = await db.students.find_one({
            "$or": [
                {"student_id": request.student_id.upper()},
                {"student_id": request.student_id},
                {"_id": ObjectId(request.student_id) if ObjectId.is_valid(request.student_id) else None}
            ]
        })
        if not student:
            raise HTTPException(status_code=404, detail=f"Student {request.student_id} not found")

    student_id = student["student_id"]

    # 2. Resolve active session
    session = None
    if request.session_id:
        session = await attendance_service.get_session(request.session_id)
        if not session or session.get("status") != "ACTIVE":
            raise HTTPException(status_code=404, detail="Attendance session not active or not found")
    else:
        # Find active session matching student's department/year/section
        session = await db.attendance_sessions.find_one({
            "department": student.get("department"),
            "year": int(student.get("year", 4)),
            "section": student.get("section", "A"),
            "status": "ACTIVE"
        })
        if not session:
            # Fallback: find any active session created today
            session = await db.attendance_sessions.find_one({"status": "ACTIVE"})

    if not session:
        raise HTTPException(
            status_code=400,
            detail="No active lecture session found for your class right now. Please wait for faculty to start the session."
        )

    session_id = str(session.get("_id") or session.get("id"))

    # 3. Location verification
    lat = request.latitude
    lon = request.longitude
    acc = request.accuracy

    if lat is None or lon is None:
        # Fall back to student's last recorded location
        last_loc = student.get("last_location") or current_user.get("last_location")
        if last_loc:
            lat = last_loc.get("latitude")
            lon = last_loc.get("longitude")
            acc = last_loc.get("accuracy")

    if lat is not None and lon is not None:
        loc_res = await attendance_service.verify_faculty_location(
            latitude=lat,
            longitude=lon,
            classroom_id=session.get("classroom_id"),
            accuracy=acc
        )
        is_verified = loc_res.get("verified", False)
        distance = loc_res.get("distance_meters", 0.0)
    else:
        is_verified = True
        distance = 0.0

    # If student is self-marking, enforce location verification unless session bypassed
    if role == "STUDENT" and not is_verified and not session.get("location_bypass"):
        raise HTTPException(
            status_code=403,
            detail=f"Location not verified: You are {round(distance)}m from the classroom pin (must be within 500m to give spot attendance)."
        )

    # 4. Mark attendance
    try:
        record = await attendance_service.mark_attendance({
            "session_id": session_id,
            "student_id": student_id,
            "status": "PRESENT",
            "recognition_score": 1.0,
            "verification_method": "LOCATION_SPOT"
        })
        status_res = "PRESENT"
        msg = f"✓ On-the-spot attendance recorded for {student['name']} ({student_id})!"
    except ValueError as ve:
        if "DUPLICATE" in str(ve):
            status_res = "DUPLICATE"
            msg = f"{student['name']} ({student_id}) is already marked Present for this session."
        else:
            raise HTTPException(status_code=400, detail=str(ve))

    # Broadcast via WebSocket
    try:
        await broadcast_to_session(session_id, {
            "type": "ATTENDANCE_MARKED",
            "session_id": session_id,
            "student_id": student_id,
            "name": student.get("name"),
            "status": status_res,
            "method": "LOCATION_SPOT",
            "distance_meters": distance
        })
    except Exception:
        pass

    return {
        "success": True,
        "status": status_res,
        "student_id": student_id,
        "name": student.get("name"),
        "session_id": session_id,
        "distance_meters": distance,
        "message": msg
    }


@router.get("/tracked-students")
async def list_tracked_students(
    session_id: Optional[str] = None,
    current_user: dict = Depends(require_faculty)
):
    """
    Returns real-time location telemetry and spot-attendance readiness for students.
    Shows who is currently logged in, their coordinates, distance from classroom,
    and attendance status for the active session.
    """
    db = get_database()
    query = {"is_active": True}

    session = None
    if session_id:
        session = await attendance_service.get_session(session_id)
        if session:
            query["department"] = session.get("department")
            query["year"] = int(session.get("year", 4))
            query["section"] = session.get("section", "A")

    students = await db.students.find(query).to_list(100)
    attendance_records = []
    if session_id:
        attendance_records = await db.attendance.find({"session_id": session_id}).to_list(200)

    marked_map = {r["student_id"]: r for r in attendance_records}

    target_lat = session.get("faculty_latitude") if session else 16.80932
    target_lon = session.get("faculty_longitude") if session else 81.54415

    results = []
    for s in students:
        sid = s.get("student_id")
        last_loc = s.get("last_location")
        rec = marked_map.get(sid)

        dist = None
        in_range = False
        if last_loc and last_loc.get("latitude") and last_loc.get("longitude"):
            from app.services.attendance_service import calculate_haversine_distance
            dist = calculate_haversine_distance(
                float(last_loc["latitude"]),
                float(last_loc["longitude"]),
                float(target_lat or 16.80932),
                float(target_lon or 81.54415)
            )
            in_range = dist <= 500.0

        results.append({
            "id": str(s["_id"]),
            "student_id": sid,
            "name": s.get("name"),
            "roll_number": s.get("roll_number", sid),
            "department": s.get("department"),
            "year": s.get("year"),
            "section": s.get("section"),
            "is_face_enrolled": s.get("is_face_enrolled", False) or s.get("face_enrolled", False),
            "last_location": last_loc,
            "distance_meters": dist,
            "in_classroom_range": in_range,
            "is_marked": rec is not None,
            "attendance_status": rec.get("status") if rec else "PENDING",
            "verification_method": rec.get("verification_method") if rec else None,
            "marked_at": rec.get("timestamp") if rec else None
        })

    return {
        "session": session,
        "total": len(results),
        "in_range_count": len([r for r in results if r["in_classroom_range"]]),
        "marked_count": len([r for r in results if r["is_marked"]]),
        "students": results
    }

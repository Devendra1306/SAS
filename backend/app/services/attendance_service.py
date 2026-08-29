import math
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from bson import ObjectId
from app.database.mongodb import get_database
from app.config import settings

# ── Predefined Authorized Campus / Classroom Locations ────────────────────────
AUTHORIZED_CAMPUS_LOCATIONS = [
    {
        "classroom_id": "CAMPUS-PEDATADEPALLI",
        "name": "Pedatadepalli Campus (Ramannagudam Rd, VF5V+GR)",
        "address": "Ramannagudam - Pedatadepalli Rd, Tadepalligudem, Tadepalle, Andhra Pradesh 534101",
        "latitude": 16.80932,
        "longitude": 81.54415,
        "allowed_radius_meters": 500.0
    },
    {
        "classroom_id": "CAMPUS-MAHALAXMI-NAGAR",
        "name": "Maha Laxmi Nagar Campus (Rd No. 8)",
        "address": "7-42-3/2, Rd Number 8, Maha Laxmi Nagar, Karri Satyavathi Nagar, Tadepalligudem, Andhra Pradesh 534101",
        "latitude": 16.81648,
        "longitude": 81.52834,
        "allowed_radius_meters": 500.0
    }
]


def calculate_haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculates great-circle distance between two GPS points in meters using Haversine formula.
    """
    R = 6371000.0  # Earth's radius in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2.0) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return round(R * c, 1)


async def get_authorized_locations() -> List[Dict[str, Any]]:
    """Returns the list of predefined and custom authorized campus locations."""
    db = get_database()
    custom_locs = await db.classrooms.find().to_list(50)
    
    # Merge default locations with any saved in MongoDB
    loc_dict = {loc["classroom_id"]: loc for loc in AUTHORIZED_CAMPUS_LOCATIONS}
    for c in custom_locs:
        sc = _serialize_classroom(c)
        loc_dict[sc.get("classroom_id", str(sc.get("id")))] = sc
    
    return list(loc_dict.values())


async def save_custom_location(data: dict) -> dict:
    """Saves or calibrates a campus location pin in MongoDB."""
    db = get_database()
    classroom_id = data.get("classroom_id") or f"CAMPUS-{int(datetime.utcnow().timestamp())}"
    doc = {
        "classroom_id": classroom_id,
        "name": data.get("name", "Calibrated Classroom Location"),
        "address": data.get("address", "Tadepalligudem, Andhra Pradesh"),
        "latitude": float(data["latitude"]),
        "longitude": float(data["longitude"]),
        "allowed_radius_meters": float(data.get("allowed_radius_meters", 500.0)),
        "updated_at": datetime.utcnow()
    }
    await db.classrooms.update_one(
        {"classroom_id": classroom_id},
        {"$set": doc},
        upsert=True
    )
    return doc


async def verify_faculty_location(
    latitude: float,
    longitude: float,
    classroom_id: Optional[str] = None,
    accuracy: Optional[float] = None
) -> Dict[str, Any]:
    """
    Compares faculty's current GPS location against authorized campus locations.
    Verifies if within 500 meters radius (accounting for device accuracy).
    """
    locations = await get_authorized_locations()
    
    # If a specific classroom was requested and exists
    if classroom_id and classroom_id != "AUTO":
        target = next((loc for loc in locations if loc.get("classroom_id") == classroom_id), None)
        if target:
            locations = [target]

    best_match = None
    min_distance = float('inf')

    # Distance breakdown across all locations
    breakdown = []
    for loc in locations:
        dist = calculate_haversine_distance(
            latitude, longitude,
            float(loc["latitude"]), float(loc["longitude"])
        )
        breakdown.append({
            "classroom_id": loc.get("classroom_id"),
            "name": loc.get("name"),
            "distance_meters": dist
        })
        if dist < min_distance:
            min_distance = dist
            best_match = loc

    allowed_radius = float(best_match.get("allowed_radius_meters", 500.0)) if best_match else 500.0

    # Account for device accuracy reported by browser (e.g. Wi-Fi triangulation)
    # Effective distance takes into account the uncertainty radius if accuracy is reported
    acc = float(accuracy) if accuracy and accuracy > 0 else 0.0
    effective_dist = max(0.0, min_distance - min(acc * 0.5, 300.0))
    is_verified = (min_distance <= allowed_radius) or (effective_dist <= allowed_radius)

    if is_verified:
        msg = f"✓ Location Verified! You are {round(min_distance)}m from {best_match['name']} (within {round(allowed_radius)}m radius)."
    else:
        msg = f"❌ Outside Required Location. You are {round(min_distance)}m away from {best_match['name']}. You must be within {round(allowed_radius)}m to start attendance."

    return {
        "verified": is_verified,
        "distance_meters": min_distance,
        "effective_distance": effective_dist,
        "accuracy": acc,
        "allowed_radius_meters": allowed_radius,
        "classroom_id": best_match["classroom_id"] if best_match else "UNKNOWN",
        "classroom_name": best_match["name"] if best_match else "Campus Classroom",
        "classroom_lat": best_match["latitude"] if best_match else latitude,
        "classroom_lon": best_match["longitude"] if best_match else longitude,
        "breakdown": breakdown,
        "message": msg
    }


# ── Session Management ────────────────────────────────────────────────────────

async def create_session(faculty_id: str, data: dict) -> dict:
    db = get_database()
    today = data.get("date") or date.today().isoformat()
    
    faculty_lat = data.get("faculty_latitude")
    faculty_lon = data.get("faculty_longitude")
    classroom_id = data.get("classroom_id")
    location_bypass = data.get("location_bypass", False)

    loc_verified = True
    distance_meters = 0.0
    classroom_name = "Assigned Campus Classroom"

    # Enforce Geofence Location Verification if coordinates provided
    if faculty_lat is not None and faculty_lon is not None:
        loc_res = await verify_faculty_location(faculty_lat, faculty_lon, classroom_id)
        distance_meters = loc_res["distance_meters"]
        classroom_name = loc_res["classroom_name"]
        classroom_id = loc_res["classroom_id"]

        if not loc_res["verified"] and not location_bypass:
            raise ValueError(f"LOCATION_BLOCKED: {loc_res['message']}")
        loc_verified = loc_res["verified"] or location_bypass
    elif not location_bypass:
        loc_verified = False

    session_doc = {
        "faculty_id": faculty_id,
        "subject_id": data["subject_id"],
        "department": data["department"],
        "year": data["year"],
        "section": data["section"],
        "date": today,
        "start_time": datetime.utcnow(),
        "end_time": None,
        "status": "ACTIVE",
        "classroom_id": classroom_id,
        "classroom_name": classroom_name,
        "location_verified": loc_verified,
        "faculty_latitude": faculty_lat,
        "faculty_longitude": faculty_lon,
        "distance_from_classroom": distance_meters,
        "created_at": datetime.utcnow()
    }
    result = await db.attendance_sessions.insert_one(session_doc)
    session_doc["_id"] = result.inserted_id
    return _serialize_session(session_doc)


async def end_session(session_id: str, faculty_id: str) -> Optional[dict]:
    db = get_database()
    result = await db.attendance_sessions.update_one(
        {"_id": ObjectId(session_id), "faculty_id": faculty_id},
        {"$set": {"status": "COMPLETED", "end_time": datetime.utcnow()}}
    )
    if result.modified_count == 0:
        return None
    doc = await db.attendance_sessions.find_one({"_id": ObjectId(session_id)})
    return _serialize_session(doc)


async def get_session(session_id: str) -> Optional[dict]:
    db = get_database()
    doc = await db.attendance_sessions.find_one({"_id": ObjectId(session_id)})
    return _serialize_session(doc) if doc else None


async def mark_attendance(data: dict) -> dict:
    """Mark attendance. Enforces duplicate prevention via unique index."""
    db = get_database()
    session = await db.attendance_sessions.find_one({"_id": ObjectId(data["session_id"])})
    if not session:
        raise ValueError("Session not found")

    existing = await db.attendance.find_one({
        "session_id": data["session_id"],
        "student_id": data["student_id"]
    })
    if existing:
        raise ValueError("DUPLICATE")

    attendance_doc = {
        "session_id": data["session_id"],
        "student_id": data["student_id"],
        "subject_id": session["subject_id"],
        "faculty_id": session["faculty_id"],
        "date": session["date"],
        "timestamp": datetime.utcnow(),
        "status": data.get("status", "PRESENT"),
        "recognition_score": data.get("recognition_score"),
        "verification_method": data.get("verification_method", "AI_FACE"),
        "created_at": datetime.utcnow()
    }
    result = await db.attendance.insert_one(attendance_doc)
    attendance_doc["_id"] = result.inserted_id
    return _serialize_attendance(attendance_doc)


async def update_attendance(
    attendance_id: str,
    status: str,
    changed_by_user_id: str,
    reason: Optional[str] = None
) -> Optional[dict]:
    db = get_database()
    existing = await db.attendance.find_one({"_id": ObjectId(attendance_id)})
    if not existing:
        return None

    await db.attendance.update_one(
        {"_id": ObjectId(attendance_id)},
        {"$set": {"status": status, "verification_method": "MANUAL"}}
    )

    await db.audit_logs.insert_one({
        "user_id": changed_by_user_id,
        "action": "UPDATE_ATTENDANCE",
        "entity": "attendance",
        "entity_id": attendance_id,
        "previous_value": existing.get("status"),
        "new_value": status,
        "reason": reason,
        "timestamp": datetime.utcnow()
    })

    updated = await db.attendance.find_one({"_id": ObjectId(attendance_id)})
    return _serialize_attendance(updated)


async def get_attendance_list(
    page: int = 1,
    page_size: int = 50,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    department: Optional[str] = None,
    subject_id: Optional[str] = None,
    faculty_id: Optional[str] = None,
    status: Optional[str] = None
) -> dict:
    db = get_database()
    query: Dict[str, Any] = {}
    if date_from and date_to:
        query["date"] = {"$gte": date_from, "$lte": date_to}
    elif date_from:
        query["date"] = {"$gte": date_from}
    if subject_id:
        query["subject_id"] = subject_id
    if faculty_id:
        query["faculty_id"] = faculty_id
    if status:
        query["status"] = status

    total = await db.attendance.count_documents(query)
    skip = (page - 1) * page_size
    cursor = db.attendance.find(query).skip(skip).limit(page_size).sort("timestamp", -1)
    records = []
    async for doc in cursor:
        records.append(await _enrich_attendance(db, doc))
    return {"records": records, "total": total, "page": page, "page_size": page_size}


async def get_student_attendance(student_id: str, subject_id: Optional[str] = None) -> dict:
    db = get_database()
    query: Dict[str, Any] = {"student_id": student_id}
    if subject_id:
        query["subject_id"] = subject_id
    records = []
    cursor = db.attendance.find(query).sort("date", -1)
    async for doc in cursor:
        records.append(await _enrich_attendance(db, doc))
    total = len(records)
    present = len([r for r in records if r["status"] == "PRESENT"])
    pct = round((present / total * 100), 1) if total > 0 else 0.0
    return {
        "student_id": student_id,
        "total_classes": total,
        "classes_attended": present,
        "overall_percentage": pct,
        "records": records
    }


async def get_session_attendance(session_id: str) -> List[dict]:
    db = get_database()
    records = []
    cursor = db.attendance.find({"session_id": session_id}).sort("timestamp", -1)
    async for doc in cursor:
        records.append(await _enrich_attendance(db, doc))
    return records


async def get_low_attendance_students(threshold: Optional[float] = None) -> List[dict]:
    thresh = threshold if threshold is not None else settings.LOW_ATTENDANCE_THRESHOLD
    db = get_database()
    students = await db.students.find({"is_active": True}).to_list(500)
    low_list = []
    for s in students:
        st_id = s["student_id"]
        total = await db.attendance.count_documents({"student_id": st_id})
        present = await db.attendance.count_documents({"student_id": st_id, "status": "PRESENT"})
        pct = round((present / total * 100), 1) if total > 0 else 0.0
        if total > 0 and pct < thresh:
            low_list.append({
                "student_id": st_id,
                "roll_number": s.get("roll_number", st_id),
                "name": s["name"],
                "department": s.get("department"),
                "year": s.get("year"),
                "section": s.get("section"),
                "classes_conducted": total,
                "classes_attended": present,
                "percentage": pct,
                "critical": pct < 40
            })
    return low_list


async def get_high_attendance_students(threshold: Optional[float] = None) -> List[dict]:
    thresh = threshold if threshold is not None else settings.HIGH_ATTENDANCE_THRESHOLD
    db = get_database()
    students = await db.students.find({"is_active": True}).to_list(500)
    high_list = []
    for s in students:
        st_id = s["student_id"]
        total = await db.attendance.count_documents({"student_id": st_id})
        present = await db.attendance.count_documents({"student_id": st_id, "status": "PRESENT"})
        pct = round((present / total * 100), 1) if total > 0 else 0.0
        if total > 0 and pct >= thresh:
            high_list.append({
                "student_id": st_id,
                "roll_number": s.get("roll_number", st_id),
                "name": s["name"],
                "department": s.get("department"),
                "year": s.get("year"),
                "section": s.get("section"),
                "classes_conducted": total,
                "classes_attended": present,
                "percentage": pct,
                "perfect": pct == 100.0
            })
    return high_list


# ── Internal Helpers ─────────────────────────────────────────────────────────

async def _enrich_attendance(db, doc: dict) -> dict:
    serialized = _serialize_attendance(doc)
    student = await db.students.find_one({"student_id": doc.get("student_id")})
    if student:
        serialized["student_name"] = student.get("name")
        serialized["roll_number"] = student.get("roll_number")
        serialized["department"] = student.get("department")
        serialized["year"] = student.get("year")
        serialized["section"] = student.get("section")
    try:
        subject = await db.subjects.find_one({"_id": ObjectId(doc.get("subject_id"))})
        if subject:
            serialized["subject_name"] = subject.get("subject_name")
            serialized["subject_code"] = subject.get("subject_code")
    except Exception:
        pass
    return serialized


def _serialize_session(doc: dict) -> dict:
    d = dict(doc)
    d["id"] = str(d.pop("_id"))
    d["faculty_id"] = str(d.get("faculty_id"))
    d["subject_id"] = str(d.get("subject_id"))
    return d


def _serialize_attendance(doc: dict) -> dict:
    d = dict(doc)
    d["id"] = str(d.pop("_id"))
    return d


def _serialize_classroom(doc: dict) -> dict:
    d = dict(doc)
    d["id"] = str(d.pop("_id", ""))
    return d

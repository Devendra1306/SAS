from typing import Optional, List, Dict, Any
from datetime import datetime
from bson import ObjectId
from app.database.mongodb import get_database
from app.auth.security import get_password_hash


async def create_student(data: dict) -> dict:
    """Create student + user account. Returns created student."""
    db = get_database()

    # Create user account
    password_hash = get_password_hash(data["password"])
    user_doc = {
        "username": data["student_id"],
        "email": data["email"],
        "password_hash": password_hash,
        "role": "STUDENT",
        "is_active": True,
        "created_at": datetime.utcnow()
    }
    user_result = await db.users.insert_one(user_doc)
    user_id = str(user_result.inserted_id)

    # Create student record
    student_doc = {
        "student_id": data["student_id"],
        "roll_number": data["roll_number"],
        "name": data["name"],
        "email": data["email"],
        "phone": data.get("phone"),
        "department": data["department"],
        "year": data["year"],
        "section": data["section"],
        "user_id": user_id,
        "is_active": True,
        "created_at": datetime.utcnow()
    }
    result = await db.students.insert_one(student_doc)
    student_doc["_id"] = result.inserted_id
    return _serialize_student(student_doc)


async def get_student_by_id(student_id: str) -> Optional[dict]:
    db = get_database()
    # Try by MongoDB _id first, then by student_id field
    query = {}
    if ObjectId.is_valid(student_id):
        query = {"_id": ObjectId(student_id)}
    else:
        query = {"student_id": student_id}
    doc = await db.students.find_one(query)
    if not doc:
        return None
    return _serialize_student(doc, await _get_enrollment_count(db, doc["student_id"]))


async def get_students(
    page: int = 1,
    page_size: int = 20,
    department: Optional[str] = None,
    year: Optional[int] = None,
    section: Optional[str] = None,
    search: Optional[str] = None
) -> dict:
    db = get_database()
    query: Dict[str, Any] = {}
    if department:
        query["department"] = department
    if year:
        query["year"] = year
    if section:
        query["section"] = section
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"student_id": {"$regex": search, "$options": "i"}},
            {"roll_number": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}}
        ]

    total = await db.students.count_documents(query)
    skip = (page - 1) * page_size
    cursor = db.students.find(query).skip(skip).limit(page_size).sort("name", 1)
    students = []
    async for doc in cursor:
        count = await _get_enrollment_count(db, doc["student_id"])
        students.append(_serialize_student(doc, count))

    return {"students": students, "total": total, "page": page, "page_size": page_size}


async def update_student(student_id: str, data: dict) -> Optional[dict]:
    db = get_database()
    query = {"_id": ObjectId(student_id)} if ObjectId.is_valid(student_id) else {"student_id": student_id}
    update_data = {k: v for k, v in data.items() if v is not None}
    if not update_data:
        return await get_student_by_id(student_id)
    await db.students.update_one(query, {"$set": update_data})
    return await get_student_by_id(student_id)


async def delete_student(student_id: str) -> bool:
    db = get_database()
    query = {"_id": ObjectId(student_id)} if ObjectId.is_valid(student_id) else {"student_id": student_id}
    result = await db.students.update_one(query, {"$set": {"is_active": False}})
    return result.modified_count > 0


async def _get_enrollment_count(db, student_id: str) -> int:
    enrollment = await db.face_enrollments.find_one({"student_id": student_id})
    return enrollment.get("enrollment_count", 0) if enrollment else 0


def _serialize_student(doc: dict, enrollment_count: int = 0) -> dict:
    return {
        "id": str(doc["_id"]),
        "student_id": doc["student_id"],
        "roll_number": doc["roll_number"],
        "name": doc["name"],
        "email": doc["email"],
        "phone": doc.get("phone"),
        "department": doc["department"],
        "year": doc["year"],
        "section": doc["section"],
        "is_active": doc.get("is_active", True),
        "enrollment_count": enrollment_count,
        "created_at": doc.get("created_at", datetime.utcnow())
    }

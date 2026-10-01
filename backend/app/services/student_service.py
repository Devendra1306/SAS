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
    # Try by MongoDB _id and by student_id field
    if ObjectId.is_valid(student_id):
        query = {"$or": [{"_id": ObjectId(student_id)}, {"student_id": student_id}]}
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
    query["is_active"] = {"$ne": False}
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
    """
    Permanently deletes student from database, removes login user credentials,
    cleans up face enrollment metadata, and deletes all 512-dim face vector embeddings from Pinecone.
    """
    db = get_database()
    
    # 1. Locate student record
    if ObjectId.is_valid(student_id):
        student_query = {"$or": [{"_id": ObjectId(student_id)}, {"student_id": student_id}]}
    else:
        student_query = {"student_id": student_id}
    
    student = await db.students.find_one(student_query)
    if not student:
        return False

    sid = student.get("student_id")
    email = student.get("email")
    user_id = student.get("user_id")

    # 2. Collect Pinecone vector IDs to delete
    vector_ids = set()
    enrollment = await db.face_enrollments.find_one({"student_id": sid})
    if enrollment and enrollment.get("pinecone_vector_ids"):
        for vid in enrollment["pinecone_vector_ids"]:
            vector_ids.add(vid)

    # Standard naming pattern fallback: student_{sid}_{001..020}
    for i in range(1, 21):
        vector_ids.add(f"student_{sid}_{i:03d}")

    # 3. Delete from Pinecone index
    try:
        from app.vector_db.pinecone_service import pinecone_service
        from app.config import settings
        if vector_ids:
            pinecone_service.delete_vectors(list(vector_ids))
        if pinecone_service.is_available and pinecone_service.index is not None:
            try:
                pinecone_service.index.delete(filter={"student_id": {"$eq": sid}}, namespace=settings.PINECONE_NAMESPACE)
            except Exception:
                pass
    except Exception as e:
        print(f"Warning deleting Pinecone vectors for {sid}: {e}")

    # 4. Remove student record from MongoDB
    await db.students.delete_many({"$or": [{"_id": student["_id"]}, {"student_id": sid}]})

    # 5. Remove associated user login account
    user_conditions = [{"username": sid}]
    if email:
        user_conditions.append({"email": email})
    if user_id:
        if ObjectId.is_valid(str(user_id)):
            user_conditions.append({"_id": ObjectId(str(user_id))})
        else:
            user_conditions.append({"_id": str(user_id)})
    await db.users.delete_many({"$or": user_conditions})

    # 6. Remove face enrollment document
    await db.face_enrollments.delete_many({"student_id": sid})

    # 7. Clean up attendance records for this student
    await db.attendance.delete_many({"student_id": sid})

    return True


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

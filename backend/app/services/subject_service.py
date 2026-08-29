from typing import Optional, Dict, Any
from datetime import datetime
from bson import ObjectId
from app.database.mongodb import get_database


async def create_subject(data: dict) -> dict:
    db = get_database()
    subject_doc = {
        "subject_code": data["subject_code"],
        "subject_name": data["subject_name"],
        "department": data["department"],
        "year": data["year"],
        "section": data["section"],
        "faculty_id": data.get("faculty_id"),
        "created_at": datetime.utcnow()
    }
    result = await db.subjects.insert_one(subject_doc)
    subject_doc["_id"] = result.inserted_id
    return await _serialize_subject(db, subject_doc)


async def get_subject_by_id(subject_id: str) -> Optional[dict]:
    db = get_database()
    query = {"_id": ObjectId(subject_id)} if ObjectId.is_valid(subject_id) else {"subject_code": subject_id}
    doc = await db.subjects.find_one(query)
    return await _serialize_subject(db, doc) if doc else None


async def get_subjects(
    department: Optional[str] = None,
    year: Optional[int] = None,
    section: Optional[str] = None,
    faculty_id: Optional[str] = None
) -> list:
    db = get_database()
    query: Dict[str, Any] = {}
    if department:
        query["department"] = department
    if year:
        query["year"] = year
    if section:
        query["section"] = section
    if faculty_id:
        query["faculty_id"] = faculty_id

    cursor = db.subjects.find(query).sort("subject_name", 1)
    subjects = []
    async for doc in cursor:
        subjects.append(await _serialize_subject(db, doc))
    return subjects


async def update_subject(subject_id: str, data: dict) -> Optional[dict]:
    db = get_database()
    query = {"_id": ObjectId(subject_id)} if ObjectId.is_valid(subject_id) else {"subject_code": subject_id}
    update_data = {k: v for k, v in data.items() if v is not None}
    if update_data:
        await db.subjects.update_one(query, {"$set": update_data})
    return await get_subject_by_id(subject_id)


async def delete_subject(subject_id: str) -> bool:
    db = get_database()
    query = {"_id": ObjectId(subject_id)} if ObjectId.is_valid(subject_id) else {"subject_code": subject_id}
    result = await db.subjects.delete_one(query)
    return result.deleted_count > 0


async def _serialize_subject(db, doc: dict) -> dict:
    faculty_name = None
    if doc.get("faculty_id"):
        faculty = await db.faculty.find_one({"_id": ObjectId(doc["faculty_id"])}) if ObjectId.is_valid(doc["faculty_id"]) else None
        if faculty:
            faculty_name = faculty.get("name")
    return {
        "id": str(doc["_id"]),
        "subject_code": doc["subject_code"],
        "subject_name": doc["subject_name"],
        "department": doc["department"],
        "year": doc["year"],
        "section": doc["section"],
        "faculty_id": doc.get("faculty_id"),
        "faculty_name": faculty_name,
        "created_at": doc.get("created_at", datetime.utcnow())
    }

from typing import Optional, List, Dict, Any
from datetime import datetime
from bson import ObjectId
from app.database.mongodb import get_database
from app.auth.security import get_password_hash


async def create_faculty(data: dict) -> dict:
    db = get_database()
    password_hash = get_password_hash(data["password"])
    user_doc = {
        "username": data["faculty_id"],
        "email": data["email"],
        "password_hash": password_hash,
        "role": "FACULTY",
        "is_active": True,
        "created_at": datetime.utcnow()
    }
    user_result = await db.users.insert_one(user_doc)
    user_id = str(user_result.inserted_id)

    faculty_doc = {
        "faculty_id": data["faculty_id"],
        "name": data["name"],
        "email": data["email"],
        "department": data["department"],
        "subject_ids": data.get("subject_ids", []),
        "user_id": user_id,
        "is_active": True,
        "created_at": datetime.utcnow()
    }
    result = await db.faculty.insert_one(faculty_doc)
    faculty_doc["_id"] = result.inserted_id
    return _serialize_faculty(faculty_doc)


async def get_faculty_by_id(faculty_id: str) -> Optional[dict]:
    db = get_database()
    query = {"_id": ObjectId(faculty_id)} if ObjectId.is_valid(faculty_id) else {"faculty_id": faculty_id}
    doc = await db.faculty.find_one(query)
    return _serialize_faculty(doc) if doc else None


async def get_faculty_by_user_id(user_id: str) -> Optional[dict]:
    db = get_database()
    doc = await db.faculty.find_one({"user_id": user_id})
    return _serialize_faculty(doc) if doc else None


async def get_all_faculty(page: int = 1, page_size: int = 20, department: Optional[str] = None) -> dict:
    db = get_database()
    query: Dict[str, Any] = {}
    if department:
        query["department"] = department
    total = await db.faculty.count_documents(query)
    skip = (page - 1) * page_size
    cursor = db.faculty.find(query).skip(skip).limit(page_size).sort("name", 1)
    faculty_list = []
    async for doc in cursor:
        faculty_list.append(_serialize_faculty(doc))
    return {"faculty": faculty_list, "total": total, "page": page, "page_size": page_size}


async def update_faculty(faculty_id: str, data: dict) -> Optional[dict]:
    db = get_database()
    query = {"_id": ObjectId(faculty_id)} if ObjectId.is_valid(faculty_id) else {"faculty_id": faculty_id}
    update_data = {k: v for k, v in data.items() if v is not None}
    if update_data:
        await db.faculty.update_one(query, {"$set": update_data})
    return await get_faculty_by_id(faculty_id)


async def delete_faculty(faculty_id: str) -> bool:
    db = get_database()
    query = {"_id": ObjectId(faculty_id)} if ObjectId.is_valid(faculty_id) else {"faculty_id": faculty_id}
    result = await db.faculty.update_one(query, {"$set": {"is_active": False}})
    return result.modified_count > 0


def _serialize_faculty(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "faculty_id": doc["faculty_id"],
        "name": doc["name"],
        "email": doc["email"],
        "department": doc["department"],
        "subject_ids": doc.get("subject_ids", []),
        "is_active": doc.get("is_active", True),
        "created_at": doc.get("created_at", datetime.utcnow())
    }

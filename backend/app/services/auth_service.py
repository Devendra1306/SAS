from typing import Optional
from datetime import datetime, timedelta
from bson import ObjectId
from app.database.mongodb import get_database
from app.auth.security import verify_password, get_password_hash, create_access_token, create_refresh_token
from app.config import settings


async def authenticate_user(username_or_email: str, password: str, role_filter: Optional[str] = None):
    """Authenticate admin/faculty user. Returns user dict or None."""
    db = get_database()
    query = {
        "$or": [
            {"username": username_or_email},
            {"email": username_or_email}
        ],
        "is_active": True
    }
    if role_filter:
        query["role"] = role_filter
    else:
        query["role"] = {"$in": ["ADMIN", "FACULTY"]}

    user = await db.users.find_one(query)
    if not user:
        return None
    if not verify_password(password, user["password_hash"]):
        return None
    return user


async def authenticate_student(student_id_or_email: str, password: str):
    """Authenticate student user."""
    db = get_database()
    query = {
        "$or": [
            {"username": student_id_or_email},
            {"email": student_id_or_email}
        ],
        "role": "STUDENT",
        "is_active": True
    }
    user = await db.users.find_one(query)
    if not user:
        return None
    if not verify_password(password, user["password_hash"]):
        return None
    return user


def build_token_response(user: dict) -> dict:
    """Build token pair response from user document."""
    user_id = str(user["_id"])
    token_data = {"sub": user_id, "role": user["role"]}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "role": user["role"],
        "user_id": user_id,
        "username": user.get("username", ""),
        "email": user.get("email", "")
    }


async def get_user_profile(user_id: str) -> Optional[dict]:
    """Get full user profile including linked student/faculty data."""
    db = get_database()
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        return None

    profile = {
        "id": str(user["_id"]),
        "username": user.get("username"),
        "email": user.get("email"),
        "role": user["role"],
        "is_active": user.get("is_active", True),
        "name": user.get("username")
    }

    if user["role"] == "STUDENT":
        student = await db.students.find_one({"user_id": str(user["_id"])})
        if student:
            profile["name"] = student["name"]
            profile["student_id"] = student["student_id"]
            profile["roll_number"] = student["roll_number"]
            profile["department"] = student["department"]
            profile["year"] = student["year"]
            profile["section"] = student["section"]
    elif user["role"] == "FACULTY":
        faculty = await db.faculty.find_one({"user_id": str(user["_id"])})
        if faculty:
            profile["name"] = faculty["name"]
            profile["faculty_id"] = faculty["faculty_id"]
            profile["department"] = faculty["department"]

    return profile


async def blacklist_token(refresh_token: str):
    """Add refresh token to blacklist."""
    db = get_database()
    await db.token_blacklist.insert_one({
        "token": refresh_token,
        "blacklisted_at": datetime.utcnow()
    })


async def is_token_blacklisted(token: str) -> bool:
    db = get_database()
    doc = await db.token_blacklist.find_one({"token": token})
    return doc is not None

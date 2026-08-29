from app.database.mongodb import get_database
from pymongo import IndexModel, ASCENDING, DESCENDING

async def create_indexes():
    db = get_database()
    
    await db.users.create_index("email", unique=True)
    await db.users.create_index("username", unique=True)
    await db.students.create_index("student_id", unique=True)
    await db.students.create_index("roll_number", unique=True)
    await db.faculty.create_index("faculty_id", unique=True)
    await db.faculty.create_index("email", unique=True)
    await db.subjects.create_index("subject_code", unique=True)
    
    await db.attendance.create_index([("session_id", ASCENDING), ("student_id", ASCENDING)], unique=True)
    await db.attendance.create_index("student_id")
    await db.attendance.create_index("date")
    await db.attendance.create_index("subject_id")
    
    await db.attendance_sessions.create_index("faculty_id")
    await db.attendance_sessions.create_index("date")
    print("MongoDB indexes created")

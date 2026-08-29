"""
Seed script — populates MongoDB with demo data.
Run: python -m scripts.seed  (from backend/ directory)

Creates:
  - 1 Admin
  - 3 Faculty
  - 20 Students
  - 5 Subjects
  - 30 Attendance sessions (past 30 days)
  - Sample attendance records
"""
import asyncio
import sys
import os
from datetime import datetime, date, timedelta
import random

# Add parent dir to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.config import settings
from app.database.mongodb import connect_to_mongo, close_mongo_connection
from app.database.collections import create_indexes
from app.auth.security import get_password_hash


DEPARTMENTS = {
    "CSE": {"name": "Computer Science & Engineering"},
    "ECE": {"name": "Electronics & Communication Engineering"},
}

FACULTY_DATA = [
    {"faculty_id": "FAC001", "name": "Dr. Priya Sharma", "email": "priya.sharma@sas.edu",
     "department": "CSE", "password": "Faculty@123"},
    {"faculty_id": "FAC002", "name": "Dr. Ravi Kumar", "email": "ravi.kumar@sas.edu",
     "department": "CSE", "password": "Faculty@123"},
    {"faculty_id": "FAC003", "name": "Dr. Anita Singh", "email": "anita.singh@sas.edu",
     "department": "ECE", "password": "Faculty@123"},
]

SUBJECT_DATA = [
    {"subject_code": "ML401", "subject_name": "Machine Learning", "department": "CSE", "year": 4, "section": "A", "faculty_idx": 0},
    {"subject_code": "CV402", "subject_name": "Computer Vision", "department": "CSE", "year": 4, "section": "A", "faculty_idx": 0},
    {"subject_code": "DB301", "subject_name": "Database Management", "department": "CSE", "year": 3, "section": "A", "faculty_idx": 1},
    {"subject_code": "CC402", "subject_name": "Cloud Computing", "department": "CSE", "year": 4, "section": "A", "faculty_idx": 1},
    {"subject_code": "DA301", "subject_name": "Data Analytics", "department": "ECE", "year": 3, "section": "A", "faculty_idx": 2},
]

STUDENT_DATA = [
    # CSE 4th Year Section A (10 students)
    {"student_id": "23A81A4301", "roll_number": "23A81A4301", "name": "Arjun Reddy", "department": "CSE", "year": 4, "section": "A"},
    {"student_id": "23A81A4302", "roll_number": "23A81A4302", "name": "Priya Patel", "department": "CSE", "year": 4, "section": "A"},
    {"student_id": "23A81A4303", "roll_number": "23A81A4303", "name": "Rahul Sharma", "department": "CSE", "year": 4, "section": "A"},
    {"student_id": "23A81A4304", "roll_number": "23A81A4304", "name": "Sneha Gupta", "department": "CSE", "year": 4, "section": "A"},
    {"student_id": "23A81A4305", "roll_number": "23A81A4305", "name": "Vikram Singh", "department": "CSE", "year": 4, "section": "A"},
    {"student_id": "23A81A4306", "roll_number": "23A81A4306", "name": "Ananya Krishnan", "department": "CSE", "year": 4, "section": "A"},
    {"student_id": "23A81A4307", "roll_number": "23A81A4307", "name": "Mohammed Irfan", "department": "CSE", "year": 4, "section": "A"},
    {"student_id": "23A81A4308", "roll_number": "23A81A4308", "name": "Deepika Nair", "department": "CSE", "year": 4, "section": "A"},
    {"student_id": "23A81A4309", "roll_number": "23A81A4309", "name": "Karthik Rajan", "department": "CSE", "year": 4, "section": "A"},
    {"student_id": "23A81A4310", "roll_number": "23A81A4310", "name": "Lavanya Devi", "department": "CSE", "year": 4, "section": "A"},
    # CSE 3rd Year Section A (5 students)
    {"student_id": "23A81A4201", "roll_number": "23A81A4201", "name": "Sai Charan", "department": "CSE", "year": 3, "section": "A"},
    {"student_id": "23A81A4202", "roll_number": "23A81A4202", "name": "Meghana Rao", "department": "CSE", "year": 3, "section": "A"},
    {"student_id": "23A81A4203", "roll_number": "23A81A4203", "name": "Rohit Verma", "department": "CSE", "year": 3, "section": "A"},
    {"student_id": "23A81A4204", "roll_number": "23A81A4204", "name": "Kavitha Suresh", "department": "CSE", "year": 3, "section": "A"},
    {"student_id": "23A81A4205", "roll_number": "23A81A4205", "name": "Aditya Kumar", "department": "CSE", "year": 3, "section": "A"},
    # ECE 3rd Year Section A (5 students)
    {"student_id": "23A81B0101", "roll_number": "23A81B0101", "name": "Pooja Reddy", "department": "ECE", "year": 3, "section": "A"},
    {"student_id": "23A81B0102", "roll_number": "23A81B0102", "name": "Harish Babu", "department": "ECE", "year": 3, "section": "A"},
    {"student_id": "23A81B0103", "roll_number": "23A81B0103", "name": "Swathi Prasad", "department": "ECE", "year": 3, "section": "A"},
    {"student_id": "23A81B0104", "roll_number": "23A81B0104", "name": "Naveen Teja", "department": "ECE", "year": 3, "section": "A"},
    {"student_id": "23A81B0105", "roll_number": "23A81B0105", "name": "Bindhu Madhuri", "department": "ECE", "year": 3, "section": "A"},
]

# Attendance rates per student (some below 50%, some high)
ATTENDANCE_RATES = {
    "23A81A4301": 0.95,  # high
    "23A81A4302": 0.92,
    "23A81A4303": 0.42,  # low - below 50%
    "23A81A4304": 0.38,  # critical
    "23A81A4305": 0.88,
    "23A81A4306": 0.75,
    "23A81A4307": 0.47,  # below 50%
    "23A81A4308": 0.82,
    "23A81A4309": 0.91,  # high
    "23A81A4310": 0.65,
    "23A81A4201": 0.78,
    "23A81A4202": 0.55,
    "23A81A4203": 0.43,  # low
    "23A81A4204": 0.88,
    "23A81A4205": 0.97,  # very high
    "23A81B0101": 0.72,
    "23A81B0102": 0.60,
    "23A81B0103": 0.45,  # low
    "23A81B0104": 0.83,
    "23A81B0105": 0.90,
}


async def seed():
    from motor.motor_asyncio import AsyncIOMotorClient
    client = AsyncIOMotorClient(settings.MONGODB_URI)
    db = client[settings.MONGODB_DATABASE]

    print("=" * 60)
    print("SAS Seed Script")
    print("=" * 60)

    # Clear existing data
    print("\nClearing existing data...")
    for coll in ["users", "students", "faculty", "subjects", "attendance_sessions", "attendance", "face_enrollments"]:
        await db[coll].delete_many({})

    # 1. Create Admin
    print("\nCreating admin...")
    admin_hash = get_password_hash(settings.SEED_ADMIN_PASSWORD)
    await db.users.insert_one({
        "username": settings.SEED_ADMIN_USERNAME,
        "email": settings.SEED_ADMIN_EMAIL,
        "password_hash": admin_hash,
        "role": "ADMIN",
        "is_active": True,
        "created_at": datetime.utcnow()
    })
    print(f"  Admin: {settings.SEED_ADMIN_USERNAME} / {settings.SEED_ADMIN_PASSWORD}")

    # 2. Create Faculty
    print("\nCreating faculty...")
    faculty_ids = {}
    for f in FACULTY_DATA:
        user = await db.users.insert_one({
            "username": f["faculty_id"],
            "email": f["email"],
            "password_hash": get_password_hash(f["password"]),
            "role": "FACULTY",
            "is_active": True,
            "created_at": datetime.utcnow()
        })
        fac = await db.faculty.insert_one({
            "faculty_id": f["faculty_id"],
            "name": f["name"],
            "email": f["email"],
            "department": f["department"],
            "subject_ids": [],
            "user_id": str(user.inserted_id),
            "is_active": True,
            "created_at": datetime.utcnow()
        })
        faculty_ids[f["faculty_id"]] = str(fac.inserted_id)
        print(f"  Faculty: {f['name']} ({f['faculty_id']}) / Faculty@123")

    # 3. Create Subjects
    print("\nCreating subjects...")
    subject_ids = {}
    for s in SUBJECT_DATA:
        fac_data = FACULTY_DATA[s["faculty_idx"]]
        fac_doc = await db.faculty.find_one({"faculty_id": fac_data["faculty_id"]})
        fac_oid = str(fac_doc["_id"])
        subj = await db.subjects.insert_one({
            "subject_code": s["subject_code"],
            "subject_name": s["subject_name"],
            "department": s["department"],
            "year": s["year"],
            "section": s["section"],
            "faculty_id": fac_oid,
            "created_at": datetime.utcnow()
        })
        subject_ids[s["subject_code"]] = str(subj.inserted_id)
        # Update faculty subject_ids
        await db.faculty.update_one(
            {"_id": fac_doc["_id"]},
            {"$addToSet": {"subject_ids": str(subj.inserted_id)}}
        )
        print(f"  Subject: {s['subject_name']} ({s['subject_code']})")

    # 4. Create Students
    print("\nCreating students...")
    student_map = {}  # student_id -> mongo _id
    for st in STUDENT_DATA:
        email = f"{st['student_id'].lower()}@sas.edu"
        user = await db.users.insert_one({
            "username": st["student_id"],
            "email": email,
            "password_hash": get_password_hash("Student@123"),
            "role": "STUDENT",
            "is_active": True,
            "created_at": datetime.utcnow()
        })
        stu = await db.students.insert_one({
            "student_id": st["student_id"],
            "roll_number": st["roll_number"],
            "name": st["name"],
            "email": email,
            "phone": f"+91 9{random.randint(100000000, 999999999)}",
            "department": st["department"],
            "year": st["year"],
            "section": st["section"],
            "user_id": str(user.inserted_id),
            "is_active": True,
            "created_at": datetime.utcnow()
        })
        student_map[st["student_id"]] = str(stu.inserted_id)
    print(f"  Created {len(STUDENT_DATA)} students (password: Student@123)")

    # 5. Generate Attendance Sessions and Records (past 30 days)
    print("\nGenerating attendance records...")
    total_sessions = 0
    total_records = 0
    today = date.today()

    # Map subjects to students
    subject_student_map = {
        "ML401": [s for s in STUDENT_DATA if s["department"] == "CSE" and s["year"] == 4],
        "CV402": [s for s in STUDENT_DATA if s["department"] == "CSE" and s["year"] == 4],
        "DB301": [s for s in STUDENT_DATA if s["department"] == "CSE" and s["year"] == 3],
        "CC402": [s for s in STUDENT_DATA if s["department"] == "CSE" and s["year"] == 4],
        "DA301": [s for s in STUDENT_DATA if s["department"] == "ECE" and s["year"] == 3],
    }

    for day_offset in range(29, -1, -1):
        session_date = today - timedelta(days=day_offset)
        # Skip weekends
        if session_date.weekday() >= 5:
            continue

        # Create 1-2 sessions per day for different subjects
        for s in SUBJECT_DATA[:3]:  # Just first 3 subjects for variety
            if random.random() < 0.7:  # 70% chance of class on any given day
                subj_code = s["subject_code"]
                fac_data = FACULTY_DATA[s["faculty_idx"]]
                fac_doc = await db.faculty.find_one({"faculty_id": fac_data["faculty_id"]})
                subj_doc = await db.subjects.find_one({"subject_code": subj_code})

                session_doc = {
                    "faculty_id": str(fac_doc["_id"]),
                    "subject_id": str(subj_doc["_id"]),
                    "department": s["department"],
                    "year": s["year"],
                    "section": s["section"],
                    "date": session_date.isoformat(),
                    "start_time": datetime(session_date.year, session_date.month, session_date.day, 9, 0),
                    "end_time": datetime(session_date.year, session_date.month, session_date.day, 10, 0),
                    "status": "COMPLETED",
                    "created_at": datetime.utcnow()
                }
                sess = await db.attendance_sessions.insert_one(session_doc)
                session_id = str(sess.inserted_id)
                total_sessions += 1

                # Mark attendance for enrolled students
                enrolled = subject_student_map.get(subj_code, [])
                for st in enrolled:
                    rate = ATTENDANCE_RATES.get(st["student_id"], 0.75)
                    is_present = random.random() < rate
                    await db.attendance.insert_one({
                        "session_id": session_id,
                        "student_id": st["student_id"],
                        "subject_id": str(subj_doc["_id"]),
                        "faculty_id": str(fac_doc["_id"]),
                        "date": session_date.isoformat(),
                        "timestamp": datetime(session_date.year, session_date.month, session_date.day,
                                              random.randint(9, 10), random.randint(0, 59)),
                        "status": "PRESENT" if is_present else "ABSENT",
                        "recognition_score": round(random.uniform(0.85, 0.99), 3) if is_present else None,
                        "verification_method": "AI_FACE" if is_present else "MANUAL",
                        "created_at": datetime.utcnow()
                    })
                    total_records += 1

    print(f"  Created {total_sessions} sessions, {total_records} attendance records")

    print("\n" + "=" * 60)
    print("SEED COMPLETE")
    print("=" * 60)
    print(f"\nAdmin Login:   {settings.SEED_ADMIN_USERNAME} / {settings.SEED_ADMIN_PASSWORD}")
    print("Faculty Login: FAC001 / Faculty@123  (or FAC002, FAC003)")
    print("Student Login: 23A81A4301 / Student@123  (all students)")
    print("\nNote: No face embeddings seeded (requires real camera enrollment)")

    client.close()


if __name__ == "__main__":
    asyncio.run(seed())

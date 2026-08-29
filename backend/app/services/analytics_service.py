from datetime import datetime, date, timedelta
from typing import List
from bson import ObjectId
from app.database.mongodb import get_database
from app.config import settings


async def get_dashboard_stats() -> dict:
    db = get_database()
    today = date.today().isoformat()

    total_students = await db.students.count_documents({"is_active": True})
    total_faculty = await db.faculty.count_documents({"is_active": True})

    # Today's attendance
    today_sessions = await db.attendance_sessions.distinct("_id", {"date": today})
    today_session_ids = [str(s) for s in today_sessions]

    present_today = await db.attendance.count_documents({
        "date": today,
        "status": "PRESENT"
    })
    # Count students with sessions today but not marked present
    absent_today = 0
    if today_sessions:
        enrolled_today = set()
        for sid in today_sessions:
            session = await db.attendance_sessions.find_one({"_id": sid})
            if session:
                # Students in that dept/year/section
                students = await db.students.find({
                    "department": session.get("department"),
                    "year": session.get("year"),
                    "section": session.get("section"),
                    "is_active": True
                }).to_list(length=None)
                for s in students:
                    enrolled_today.add(s["student_id"])
        absent_today = max(0, len(enrolled_today) - present_today)

    # Below / high threshold - computed across all subjects
    low_pipeline = [
        {"$group": {
            "_id": {"student_id": "$student_id", "subject_id": "$subject_id"},
            "attended": {"$sum": {"$cond": [{"$eq": ["$status", "PRESENT"]}, 1, 0]}},
            "total": {"$sum": 1}
        }},
        {"$project": {
            "percentage": {"$multiply": [{"$divide": ["$attended", "$total"]}, 100]}
        }},
        {"$match": {"percentage": {"$lt": settings.LOW_ATTENDANCE_THRESHOLD}}}
    ]
    low_cursor = db.attendance.aggregate(low_pipeline)
    low_student_ids = set()
    async for doc in low_cursor:
        low_student_ids.add(doc["_id"]["student_id"])

    high_pipeline = [
        {"$group": {
            "_id": {"student_id": "$student_id", "subject_id": "$subject_id"},
            "attended": {"$sum": {"$cond": [{"$eq": ["$status", "PRESENT"]}, 1, 0]}},
            "total": {"$sum": 1}
        }},
        {"$project": {
            "percentage": {"$multiply": [{"$divide": ["$attended", "$total"]}, 100]}
        }},
        {"$match": {"percentage": {"$gte": settings.HIGH_ATTENDANCE_THRESHOLD}}}
    ]
    high_cursor = db.attendance.aggregate(high_pipeline)
    high_student_ids = set()
    async for doc in high_cursor:
        high_student_ids.add(doc["_id"]["student_id"])

    return {
        "total_students": total_students,
        "total_faculty": total_faculty,
        "present_today": present_today,
        "absent_today": absent_today,
        "below_threshold": len(low_student_ids),
        "high_attendance": len(high_student_ids),
        "total_sessions_today": len(today_sessions)
    }


async def get_weekly_attendance() -> list:
    db = get_database()
    results = []
    for i in range(6, -1, -1):
        day = date.today() - timedelta(days=i)
        day_str = day.isoformat()
        present = await db.attendance.count_documents({"date": day_str, "status": "PRESENT"})
        absent = await db.attendance.count_documents({"date": day_str, "status": {"$in": ["ABSENT", "LATE"]}})
        total = present + absent
        results.append({
            "day": day.strftime("%a"),
            "date": day_str,
            "present": present,
            "absent": absent,
            "percentage": round((present / total * 100) if total > 0 else 0, 1)
        })
    return results


async def get_monthly_attendance(months: int = 6) -> list:
    db = get_database()
    results = []
    today = date.today()
    for i in range(months - 1, -1, -1):
        # Calculate month start/end
        month = today.month - i
        year = today.year
        while month <= 0:
            month += 12
            year -= 1
        month_start = f"{year}-{month:02d}-01"
        # Last day of month
        if month == 12:
            month_end = f"{year+1}-01-01"
        else:
            month_end = f"{year}-{month+1:02d}-01"

        present = await db.attendance.count_documents({
            "date": {"$gte": month_start, "$lt": month_end},
            "status": "PRESENT"
        })
        total = await db.attendance.count_documents({
            "date": {"$gte": month_start, "$lt": month_end}
        })
        results.append({
            "month": datetime(year, month, 1).strftime("%B"),
            "year": year,
            "classes_conducted": total,
            "classes_attended": present,
            "percentage": round((present / total * 100) if total > 0 else 0, 1)
        })
    return results


async def get_subject_stats() -> list:
    db = get_database()
    pipeline = [
        {"$group": {
            "_id": "$subject_id",
            "attended": {"$sum": {"$cond": [{"$eq": ["$status", "PRESENT"]}, 1, 0]}},
            "total": {"$sum": 1}
        }},
        {"$sort": {"total": -1}},
        {"$limit": 10}
    ]
    cursor = db.attendance.aggregate(pipeline)
    results = []
    async for doc in cursor:
        subject = await db.subjects.find_one({"_id": ObjectId(doc["_id"])}) if ObjectId.is_valid(doc.get("_id", "")) else None
        if subject:
            results.append({
                "subject_id": doc["_id"],
                "subject_name": subject["subject_name"],
                "subject_code": subject["subject_code"],
                "classes_conducted": doc["total"],
                "classes_attended": doc["attended"],
                "percentage": round((doc["attended"] / doc["total"] * 100) if doc["total"] > 0 else 0, 1)
            })
    return results


async def get_department_stats() -> list:
    db = get_database()
    departments = await db.students.distinct("department")
    results = []
    for dept in departments:
        students = await db.students.find({"department": dept, "is_active": True}).to_list(length=None)
        student_ids = [s["student_id"] for s in students]
        if not student_ids:
            continue
        total = await db.attendance.count_documents({"student_id": {"$in": student_ids}})
        present = await db.attendance.count_documents({"student_id": {"$in": student_ids}, "status": "PRESENT"})
        results.append({
            "department": dept,
            "total_students": len(students),
            "average_attendance": round((present / total * 100) if total > 0 else 0, 1)
        })
    return results


async def get_student_subject_stats(student_id: str) -> list:
    db = get_database()
    pipeline = [
        {"$match": {"student_id": student_id}},
        {"$group": {
            "_id": "$subject_id",
            "attended": {"$sum": {"$cond": [{"$eq": ["$status", "PRESENT"]}, 1, 0]}},
            "total": {"$sum": 1}
        }}
    ]
    cursor = db.attendance.aggregate(pipeline)
    results = []
    async for doc in cursor:
        subject = await db.subjects.find_one({"_id": ObjectId(doc["_id"])}) if ObjectId.is_valid(doc.get("_id", "")) else None
        if subject:
            pct = round((doc["attended"] / doc["total"] * 100) if doc["total"] > 0 else 0, 1)
            results.append({
                "subject_id": doc["_id"],
                "subject_name": subject["subject_name"],
                "subject_code": subject["subject_code"],
                "classes_conducted": doc["total"],
                "classes_attended": doc["attended"],
                "percentage": pct,
                "status": "CRITICAL" if pct < 50 else ("WARNING" if pct < 75 else "GOOD")
            })
    return results

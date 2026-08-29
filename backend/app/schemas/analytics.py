from typing import List, Optional
from pydantic import BaseModel


class DashboardStats(BaseModel):
    total_students: int
    total_faculty: int
    present_today: int
    absent_today: int
    below_threshold: int
    high_attendance: int
    total_sessions_today: int


class WeeklyAttendance(BaseModel):
    day: str
    present: int
    absent: int
    percentage: float


class MonthlyAttendance(BaseModel):
    month: str
    year: int
    percentage: float
    classes_conducted: int
    classes_attended: int


class SubjectStats(BaseModel):
    subject_id: str
    subject_name: str
    subject_code: str
    classes_conducted: int
    classes_attended: int
    percentage: float


class DepartmentStats(BaseModel):
    department: str
    total_students: int
    average_attendance: float


class StudentAttendanceStats(BaseModel):
    subject_id: str
    subject_name: str
    subject_code: str
    classes_conducted: int
    classes_attended: int
    percentage: float
    status: str  # GOOD | WARNING | CRITICAL

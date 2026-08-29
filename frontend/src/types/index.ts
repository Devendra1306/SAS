export interface User {
  id: string;
  username: string;
  email: string;
  role: 'ADMIN' | 'FACULTY' | 'STUDENT';
  name: string;
}

export interface Student {
  id: string;
  student_id: string;
  roll_number: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  year: number;
  section: string;
  is_active: boolean;
  enrollment_status: string;
}

export interface Faculty {
  id: string;
  faculty_id: string;
  name: string;
  email: string;
  department: string;
  subjects: string[];
  is_active: boolean;
}

export interface Subject {
  id: string;
  subject_code: string;
  subject_name: string;
  department: string;
  year: number;
  section: string;
  faculty_id: string;
  faculty_name: string;
}

export interface AttendanceSession {
  id: string;
  subject_id: string;
  subject_name: string;
  faculty_id: string;
  department: string;
  year: number;
  section: string;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
}

export interface AttendanceRecord {
  id: string;
  session_id: string;
  student_id: string;
  student_name: string;
  roll_number: string;
  subject_id: string;
  subject_name: string;
  date: string;
  timestamp: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  recognition_score?: number;
  verification_method: string;
}

export interface FaceResult {
  student_id: string;
  name: string;
  score: number;
  status: 'PRESENT' | 'UNKNOWN' | 'DUPLICATE' | 'SPOOF' | 'LOW_QUALITY';
  bbox: [number, number, number, number];
}

export interface DashboardStats {
  total_students: number;
  total_faculty: number;
  present_today: number;
  absent_today: number;
  below_threshold: number;
  high_attendance: number;
}

export interface SubjectAttendance {
  subject_id: string;
  subject_name: string;
  classes_conducted: number;
  classes_attended: number;
  percentage: number;
}

export interface MonthlyAttendance {
  month: number;
  year: number;
  percentage: number;
  classes_conducted: number;
  classes_attended: number;
}

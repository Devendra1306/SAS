import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import AdminLayout from './layouts/AdminLayout'
import FacultyLayout from './layouts/FacultyLayout'
import StudentLayout from './layouts/StudentLayout'

// Lazy load public pages
const LandingPage = lazy(() => import('./pages/LandingPage'))
const AdminFacultyLogin = lazy(() => import('./pages/auth/AdminFacultyLogin'))
const StudentLogin = lazy(() => import('./pages/auth/StudentLogin'))

// Admin pages
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'))
const AdminStudents = lazy(() => import('./pages/admin/Students'))
const RegisterStudent = lazy(() => import('./pages/admin/RegisterStudent'))
const AdminFaculty = lazy(() => import('./pages/admin/Faculty'))
const AdminSubjects = lazy(() => import('./pages/admin/Subjects'))
const AdminAttendance = lazy(() => import('./pages/admin/Attendance'))
const LowAttendance = lazy(() => import('./pages/admin/LowAttendance'))
const HighAttendance = lazy(() => import('./pages/admin/HighAttendance'))
const AdminReports = lazy(() => import('./pages/admin/Reports'))
const AdminSettings = lazy(() => import('./pages/admin/Settings'))

// Faculty pages
const FacultyDashboard = lazy(() => import('./pages/faculty/Dashboard'))
const MySubjects = lazy(() => import('./pages/faculty/MySubjects'))
const StartAttendance = lazy(() => import('./pages/faculty/StartAttendance'))
const SpotAttendance = lazy(() => import('./pages/faculty/SpotAttendance'))
const LiveRecognition = lazy(() => import('./pages/faculty/LiveRecognition'))
const FacultyAttendanceHistory = lazy(() => import('./pages/faculty/AttendanceHistory'))
const FacultyReports = lazy(() => import('./pages/faculty/Reports'))

// Student pages
const StudentDashboard = lazy(() => import('./pages/student/Dashboard'))
const TodayAttendance = lazy(() => import('./pages/student/TodayAttendance'))
const SubjectAttendance = lazy(() => import('./pages/student/SubjectAttendance'))
const StudentAttendanceHistory = lazy(() => import('./pages/student/AttendanceHistory'))
const MonthlyStats = lazy(() => import('./pages/student/MonthlyStats'))
const StudentProfile = lazy(() => import('./pages/student/Profile'))

const PageLoader = () => (
  <div className="flex h-screen items-center justify-center bg-[#f8f9ff]">
    <div className="flex flex-col items-center gap-3">
      <div className="h-9 w-9 animate-spin rounded-full border-3 border-[#2170e4] border-t-transparent shadow-xs" />
      <p className="text-xs font-semibold text-[#64748b] font-mono tracking-wider">LOADING SAS...</p>
    </div>
  </div>
)

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<AdminFacultyLogin />} />
        <Route path="/student-login" element={<StudentLogin />} />

        {/* Admin */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="students" element={<AdminStudents />} />
            <Route path="students/register" element={<RegisterStudent />} />
            <Route path="faculty" element={<AdminFaculty />} />
            <Route path="subjects" element={<AdminSubjects />} />
            <Route path="attendance" element={<AdminAttendance />} />
            <Route path="attendance/low" element={<LowAttendance />} />
            <Route path="attendance/high" element={<HighAttendance />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Route>

        {/* Faculty */}
        <Route element={<ProtectedRoute allowedRoles={['FACULTY', 'ADMIN']} />}>
          <Route path="/faculty" element={<FacultyLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<FacultyDashboard />} />
            <Route path="subjects" element={<MySubjects />} />
            <Route path="attendance/start" element={<StartAttendance />} />
            <Route path="attendance/spot" element={<SpotAttendance />} />
            <Route path="attendance/live/:sessionId" element={<LiveRecognition />} />
            <Route path="attendance/history" element={<FacultyAttendanceHistory />} />
            <Route path="reports" element={<FacultyReports />} />
          </Route>
        </Route>

        {/* Student */}
        <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
          <Route path="/student" element={<StudentLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="attendance/today" element={<TodayAttendance />} />
            <Route path="attendance/subjects" element={<SubjectAttendance />} />
            <Route path="attendance/history" element={<StudentAttendanceHistory />} />
            <Route path="attendance/monthly" element={<MonthlyStats />} />
            <Route path="profile" element={<StudentProfile />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}


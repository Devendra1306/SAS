import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  PlayCircle, BookOpen, Clock, MapPin, CheckCircle2,
  Calendar, ArrowRight, ShieldCheck, RefreshCw, BarChart2
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { subjectsService } from '@/services/subjects.service'
import { attendanceService } from '@/services/attendance.service'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatDate, formatTime } from '@/utils/format'

export default function FacultyDashboard() {
  const { user } = useAuth()

  const { data: rawSubjects, isLoading: subjectsLoading } = useQuery({
    queryKey: ['faculty-subjects', user?.faculty_id || user?.id],
    queryFn: () => subjectsService.getSubjects(),
  })

  const { data: rawSessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ['faculty-recent-sessions'],
    queryFn: () => attendanceService.getAttendanceRecords({ page: 1, page_size: 10 }),
  })

  const subjectsList: any[] = Array.isArray(rawSubjects) ? rawSubjects : (rawSubjects?.subjects || rawSubjects?.data || [])
  const recentRecords: any[] = rawSessions?.records || (Array.isArray(rawSessions) ? rawSessions : [])

  const totalRecorded = recentRecords.length
  const totalPresent = recentRecords.filter(r => r.status === 'PRESENT').length
  const avgAttendancePct = totalRecorded > 0 ? Math.round((totalPresent / totalRecorded) * 100) : 0

  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  }).format(new Date())

  return (
    <div className="max-w-7xl mx-auto space-y-8 font-sans">
      {/* Welcome & Primary Action */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-display text-3xl font-extrabold text-[#0b1c30] tracking-tight">
            Welcome back, {user?.name || 'Faculty Member'}
          </h2>
          <p className="text-sm text-[#64748b] mt-0.5">Today is {todayFormatted}.</p>
        </div>
        <Link to="/faculty/attendance/start">
          <Button size="lg" className="bg-[#0b1c30] hover:bg-slate-800 text-white font-bold text-xs px-6 py-3 rounded-lg shadow-sm flex items-center gap-2">
            <PlayCircle className="w-4 h-4 text-[#2170e4]" />
            <span>START ATTENDANCE</span>
          </Button>
        </Link>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Today's Schedule (Span 8) */}
        <div className="md:col-span-8 bg-white border border-[#e2e8f0] rounded-xl p-6 flex flex-col shadow-2xs">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-display text-base font-bold text-[#0b1c30]">Assigned Courses & Lecture Schedule</h3>
            <Link to="/faculty/subjects" className="text-[#0058be] text-xs font-semibold hover:underline">
              Manage Subjects
            </Link>
          </div>

          <div className="flex-1 space-y-3">
            {subjectsLoading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))
            ) : subjectsList.length === 0 ? (
              <div className="text-center py-12 text-[#64748b] space-y-2">
                <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-medium">No courses registered yet.</p>
                <p className="text-[11px] text-slate-400">Admin can assign subjects to your faculty profile in the Subject Manager.</p>
              </div>
            ) : (
              subjectsList.map((subj: any, idx: number) => {
                const isFirst = idx === 0
                return (
                  <div
                    key={subj.id || subj._id}
                    className={`p-3.5 rounded-lg border flex items-center gap-4 relative overflow-hidden transition-colors ${
                      isFirst
                        ? 'border-[#2170e4] bg-[#eff4ff]'
                        : 'border-[#e2e8f0] bg-white hover:bg-[#f8f9ff]'
                    }`}
                  >
                    {isFirst && <div className="w-1.5 h-full absolute left-0 top-0 bg-[#2170e4]"></div>}
                    <div className="pl-1 w-24 shrink-0">
                      <p className="font-mono text-xs text-[#0b1c30] font-bold">
                        {subj.department} • Y{subj.year}
                      </p>
                      <p className="text-[11px] text-[#64748b]">
                        Sec {subj.section}
                      </p>
                    </div>

                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-[#0b1c30]">
                        {subj.subject_code || subj.code} — {subj.subject_name || subj.name}
                      </h4>
                      <p className="text-xs text-[#64748b] flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" /> {subj.department} Classroom • Tadepalligudem Campus
                      </p>
                    </div>

                    <Link to="/faculty/attendance/start">
                      <Button
                        size="sm"
                        className={isFirst
                          ? 'bg-[#2170e4] text-white hover:bg-[#0058be] text-xs font-semibold px-4 h-8 rounded'
                          : 'bg-white border border-[#e2e8f0] text-[#0b1c30] hover:bg-[#eff4ff] text-xs font-semibold px-4 h-8 rounded'}
                      >
                        Start Session
                      </Button>
                    </Link>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Attendance Rate Summary (Span 4) */}
        <div className="md:col-span-4 bg-white border border-[#e2e8f0] rounded-xl p-6 flex flex-col justify-between shadow-2xs">
          <div>
            <h3 className="font-display text-base font-bold text-[#0b1c30] mb-2">Overall Attendance Rate</h3>
            <div className="flex items-end gap-2 mb-4">
              <span className="text-[48px] leading-[48px] font-extrabold text-[#0b1c30] tracking-tight font-display">
                {avgAttendancePct}%
              </span>
              <span className="text-xs text-[#64748b] mb-1 font-medium">avg. presence</span>
            </div>

            <div className="space-y-3">
              {subjectsList.length > 0 ? (
                subjectsList.slice(0, 3).map((s: any) => (
                  <div key={s.id || s._id} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#64748b] font-medium">{s.subject_code || s.code}</span>
                      <span className="text-[#0b1c30] font-bold font-mono">{avgAttendancePct}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#f1f5f9] rounded-full overflow-hidden">
                      <div className="h-full bg-[#2170e4]" style={{ width: `${avgAttendancePct}%` }}></div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[#64748b] py-2">No active sessions logged yet.</p>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#e2e8f0] flex items-center justify-between text-xs text-[#64748b]">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#10b981]" /> AI ArcFace Scanner Active
            </span>
            <Link to="/faculty/attendance/history" className="text-[#0058be] font-semibold hover:underline">
              Session History
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

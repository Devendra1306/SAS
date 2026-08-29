import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Calendar, Clock, CheckCircle2, RefreshCw, BookOpen, AlertCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { attendanceService } from '@/services/attendance.service'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { AttendanceStatusBadge } from '@/components/attendance/AttendanceStatusBadge'
import { formatDate, formatTime } from '@/utils/format'

export default function TodayAttendance() {
  const { user } = useAuth()
  const studentId = user?.student_id || user?.username || '23A81A4301'
  const todayStr = new Date().toISOString().split('T')[0]

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['student-today-attendance', studentId],
    queryFn: () => attendanceService.getStudentAttendance(studentId, { date_from: todayStr, date_to: todayStr }),
  })

  const todayRecords: any[] = data?.records || (Array.isArray(data) ? data : [])

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-sans">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-[#e2e8f0] p-6 rounded-xl shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#0b1c30] tracking-tight font-display">Today's Class Schedule</h1>
            <Badge className="bg-[#ecfdf5] text-[#065f46] border-[#a7f3d0] text-xs">
              {formatDate(new Date())}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#64748b] mt-1">
            Real-time verification log for today's lectures.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="border-[#e2e8f0] bg-white text-[#0b1c30] hover:bg-[#eff4ff] text-xs h-9 rounded-lg"
        >
          <RefreshCw className="h-3.5 w-3.5 mr-1.5 text-slate-500" /> Refresh
        </Button>
      </div>

      {/* Class Cards */}
      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))
        ) : todayRecords.length === 0 ? (
          <Card className="bg-white border-[#e2e8f0] p-12 text-center text-slate-500 shadow-2xs">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-400" />
            <p className="text-sm font-semibold text-[#0b1c30]">No attendance marked for today yet</p>
            <p className="text-xs text-[#64748b] mt-1">When your faculty confirms attendance, your presence will show here.</p>
          </Card>
        ) : (
          todayRecords.map((rec: any, idx: number) => (
            <Card key={idx} className="bg-white border-[#e2e8f0] shadow-2xs">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#eff4ff] text-[#0058be] border border-[#dce9ff] flex items-center justify-center shrink-0">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#0b1c30] text-base">{rec.subject_name || 'Course Lecture'}</h3>
                    <div className="flex items-center gap-3 text-xs text-[#64748b] mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" /> {formatTime(rec.timestamp || rec.date)}
                      </span>
                      <span>•</span>
                      <span>Verified via {rec.verification_method || 'AI Face'}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <AttendanceStatusBadge status={rec.status} />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { BookOpen, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react'
import { analyticsService } from '@/services/analytics.service'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import { Skeleton } from '@/components/ui/Skeleton'

export default function SubjectAttendance() {
  const { user } = useAuth()
  const studentId = user?.student_id || user?.username || '23A81A4301'

  const { data: analytics, isLoading, refetch } = useQuery({
    queryKey: ['analytics', 'student', studentId],
    queryFn: () => analyticsService.getStudentAnalytics(studentId)
  })

  const list = Array.isArray(analytics) ? analytics : (analytics?.subject_stats || [])

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto font-sans">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-[#e2e8f0] p-6 rounded-xl shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#0b1c30] tracking-tight font-display">Course Attendance Breakdown</h1>
            <Badge className="bg-[#eff4ff] text-[#0058be] border-[#dce9ff] text-xs">
              {list.length} Enrolled Courses
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#64748b] mt-1">
            Track individual course percentages, conducted vs attended sessions, and compliance thresholds.
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

      {/* Grid of Subjects */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))
        ) : list.length === 0 ? (
          <div className="col-span-full p-12 text-center text-slate-500 bg-white rounded-xl border border-[#e2e8f0]">
            <BookOpen className="w-12 h-12 mx-auto mb-3 text-slate-400" />
            <p className="text-sm font-semibold text-[#0b1c30]">No subject attendance records found</p>
          </div>
        ) : (
          list.map((stat: any, idx: number) => {
            const percentage = Math.round(stat.percentage ?? 0)
            const isDanger = percentage < 50
            const isWarning = percentage >= 50 && percentage < 75

            let colorClass = 'bg-[#10b981]'
            if (isDanger) colorClass = 'bg-[#ba1a1a]'
            else if (isWarning) colorClass = 'bg-amber-500'

            return (
              <Card key={idx} className={`bg-white border shadow-2xs flex flex-col justify-between ${isDanger ? 'border-red-200' : 'border-[#e2e8f0]'}`}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-mono text-xs font-bold text-[#0058be] bg-[#eff4ff] border border-[#dce9ff] px-2 py-0.5 rounded">
                        {stat.subject_code || 'CS401'}
                      </span>
                      <CardTitle className="text-base font-bold text-[#0b1c30] mt-2 font-display">{stat.subject_name}</CardTitle>
                    </div>
                    {isDanger ? (
                      <div className="p-1.5 rounded-lg bg-[#ffdad6] text-[#ba1a1a]">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="p-1.5 rounded-lg bg-[#ecfdf5] text-[#065f46]">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pt-2">
                  <div className="flex justify-between items-end">
                    <span className={`text-3xl font-extrabold font-display ${isDanger ? 'text-[#ba1a1a]' : isWarning ? 'text-amber-600' : 'text-[#065f46]'}`}>
                      {percentage}%
                    </span>
                    <span className="text-xs text-[#64748b] font-medium">
                      {stat.classes_attended ?? stat.attended ?? 0} / {stat.classes_conducted ?? stat.conducted ?? 0} Classes
                    </span>
                  </div>

                  <Progress value={percentage} colorClass={colorClass} className="h-1.5 bg-slate-100" />

                  {isDanger ? (
                    <p className="text-[11px] text-[#ba1a1a] font-medium">
                      Warning: Below institutional 50% minimum threshold.
                    </p>
                  ) : (
                    <p className="text-[11px] text-[#64748b]">
                      Good standing • Attendance requirements satisfied.
                    </p>
                  )}
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}

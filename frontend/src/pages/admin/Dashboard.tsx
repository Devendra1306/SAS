import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  Users, GraduationCap, Clock, AlertTriangle, CheckCircle2,
  TrendingUp, ArrowRight, ShieldCheck, RefreshCw, BarChart2,
  UserCheck, UserX, Award, Calendar
} from 'lucide-react'
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts'
import { analyticsService } from '@/services/analytics.service'
import { attendanceService } from '@/services/attendance.service'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatDate, formatTime } from '@/utils/format'

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading, refetch } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => analyticsService.getDashboard(),
  })

  const { data: weeklyData, isLoading: weeklyLoading } = useQuery({
    queryKey: ['admin-weekly'],
    queryFn: () => analyticsService.getWeeklyAttendance(),
  })

  const { data: deptData, isLoading: deptLoading } = useQuery({
    queryKey: ['admin-department'],
    queryFn: () => analyticsService.getDepartmentStats(),
  })

  const { data: recentRecords, isLoading: recordsLoading } = useQuery({
    queryKey: ['admin-recent-attendance'],
    queryFn: () => attendanceService.getAttendanceRecords({ page: 1, page_size: 5 }),
  })

  const weeklyChartData = Array.isArray(weeklyData) ? weeklyData : (weeklyData?.data || [])
  const deptChartData = Array.isArray(deptData) ? deptData : (deptData?.departments || [])
  const recordsList: any[] = recentRecords?.records || (Array.isArray(recentRecords) ? recentRecords : [])

  const totalStudents = stats?.total_students || 0
  const totalFaculty = stats?.total_faculty || 0
  const presentToday = stats?.present_today || 0
  const absentToday = stats?.absent_today || 0
  const belowThreshold = stats?.below_threshold || 0
  const highAttendance = stats?.high_attendance || 0

  return (
    <div className="max-w-[1440px] mx-auto space-y-8 font-sans">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-display text-3xl font-extrabold text-[#0b1c30] tracking-tight">System Overview</h2>
          <p className="text-sm text-[#45464d] mt-0.5">Real-time telemetry and institutional attendance performance.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="border-[#e2e8f0] bg-white text-[#0b1c30] hover:bg-[#eff4ff] text-xs h-9"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5 text-slate-500" /> Refresh Live Metrics
          </Button>
          <Link to="/admin/students/register">
            <Button className="bg-[#0058be] hover:bg-[#004395] text-white text-xs h-9 font-semibold">
              <GraduationCap className="h-4 w-4 mr-1.5" /> Register Student
            </Button>
          </Link>
        </div>
      </div>

      {/* 6 Bento Grid KPI Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Students */}
        <div className="bg-white border border-[#e2e8f0] p-4 rounded-xl flex flex-col justify-between shadow-2xs hover:border-[#2170e4] transition-all">
          <div className="flex justify-between items-center text-[#64748b] mb-1">
            <span className="text-xs font-semibold">Total Students</span>
            <GraduationCap className="w-4 h-4 text-[#2170e4]" />
          </div>
          <div className="text-2xl font-bold font-display text-[#0b1c30]">{totalStudents}</div>
          <div className="text-[11px] text-[#0058be] mt-1 font-medium">Enrolled in SAS</div>
        </div>

        {/* Total Faculty */}
        <div className="bg-white border border-[#e2e8f0] p-4 rounded-xl flex flex-col justify-between shadow-2xs hover:border-[#2170e4] transition-all">
          <div className="flex justify-between items-center text-[#64748b] mb-1">
            <span className="text-xs font-semibold">Total Faculty</span>
            <Users className="w-4 h-4 text-[#2170e4]" />
          </div>
          <div className="text-2xl font-bold font-display text-[#0b1c30]">{totalFaculty}</div>
          <div className="text-[11px] text-[#0058be] mt-1 font-medium">Active Instructors</div>
        </div>

        {/* Present Today */}
        <div className="bg-white border border-[#e2e8f0] p-4 rounded-xl flex flex-col justify-between shadow-2xs hover:border-[#2170e4] transition-all">
          <div className="flex justify-between items-center text-[#64748b] mb-1">
            <span className="text-xs font-semibold">Present Today</span>
            <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
          </div>
          <div className="text-2xl font-bold font-display text-[#065f46]">{presentToday}</div>
          <div className="text-[11px] text-[#10b981] mt-1 font-medium">Biometric verified</div>
        </div>

        {/* Absent Today */}
        <div className="bg-white border border-[#e2e8f0] p-4 rounded-xl flex flex-col justify-between shadow-2xs hover:border-[#2170e4] transition-all">
          <div className="flex justify-between items-center text-[#64748b] mb-1">
            <span className="text-xs font-semibold">Absent Today</span>
            <UserX className="w-4 h-4 text-[#ba1a1a]" />
          </div>
          <div className="text-2xl font-bold font-display text-[#ba1a1a]">{absentToday}</div>
          <div className="text-[11px] text-[#ba1a1a] mt-1 font-medium">Unrecorded roster</div>
        </div>

        {/* Below 50% */}
        <div className="bg-[#ffdad6]/40 border border-[#ffdad6] p-4 rounded-xl flex flex-col justify-between shadow-2xs">
          <div className="flex justify-between items-center text-[#ba1a1a] mb-1">
            <span className="text-xs font-bold">Below 50%</span>
            <AlertTriangle className="w-4 h-4 text-[#ba1a1a]" />
          </div>
          <div className="text-2xl font-bold font-display text-[#ba1a1a]">{belowThreshold}</div>
          <Link to="/admin/attendance/low" className="text-[11px] text-[#ba1a1a] hover:underline font-bold mt-1">
            Critical Deficit →
          </Link>
        </div>

        {/* High Attendance */}
        <div className="bg-[#e5eeff]/50 border border-[#dce9ff] p-4 rounded-xl flex flex-col justify-between shadow-2xs">
          <div className="flex justify-between items-center text-[#0058be] mb-1">
            <span className="text-xs font-bold">High Attendance</span>
            <Award className="w-4 h-4 text-[#0058be]" />
          </div>
          <div className="text-2xl font-bold font-display text-[#0058be]">{highAttendance}</div>
          <Link to="/admin/attendance/high" className="text-[11px] text-[#0058be] hover:underline font-bold mt-1">
            ≥ 90% Rate →
          </Link>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Trend Line Chart */}
        <Card className="bg-white border-[#e2e8f0] shadow-2xs">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-[#0b1c30] font-display">Weekly Attendance Rate</CardTitle>
              <CardDescription className="text-xs text-[#64748b]">Real-time daily percentage aggregated from sessions</CardDescription>
            </div>
            <Badge className="bg-[#eff4ff] text-[#0058be] border-[#dce9ff] text-xs font-mono">Real-Time</Badge>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="w-full h-64 flex items-center justify-center">
              {weeklyChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 12 }} />
                    <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 12 }} unit="%" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderColor: '#e2e8f0',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                      formatter={(v: any) => [`${v}%`, 'Attendance Rate']}
                    />
                    <Line type="monotone" dataKey="attendance_rate" stroke="#2170e4" strokeWidth={3} dot={{ fill: '#2170e4', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-[#64748b] space-y-1">
                  <BarChart2 className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-medium">No weekly sessions recorded yet.</p>
                  <p className="text-[11px] text-slate-400">Weekly trend lines will generate automatically as attendance is taken.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Department Attendance Bar Chart */}
        <Card className="bg-white border-[#e2e8f0] shadow-2xs">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-[#0b1c30] font-display">Department-Wise Attendance</CardTitle>
              <CardDescription className="text-xs text-[#64748b]">Aggregated institutional average by academic division</CardDescription>
            </div>
            <Badge className="bg-[#eff4ff] text-[#0058be] border-[#dce9ff] text-xs font-mono">By Dept</Badge>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="w-full h-64 flex items-center justify-center">
              {deptChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deptChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="department" tick={{ fill: '#64748b', fontSize: 12 }} />
                    <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 12 }} unit="%" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderColor: '#e2e8f0',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                      formatter={(v: any) => [`${v}%`, 'Attendance Rate']}
                    />
                    <Bar dataKey="attendance_rate" fill="#0058be" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-[#64748b] space-y-1">
                  <BarChart2 className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-medium">No department statistics yet.</p>
                  <p className="text-[11px] text-slate-400">Department metrics will populate after courses and sessions are created.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Live Recognitions Table */}
      <Card className="bg-white border-[#e2e8f0] shadow-2xs overflow-hidden">
        <CardHeader className="pb-3 border-b border-[#e2e8f0] flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-[#0b1c30] font-display">Recent AI Face Recognitions</CardTitle>
            <CardDescription className="text-xs text-[#64748b]">Live verification log from active classroom sessions</CardDescription>
          </div>
          <Link to="/admin/attendance" className="text-xs font-semibold text-[#0058be] hover:underline flex items-center gap-1">
            <span>View Full Ledger</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {recordsList.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#eff4ff] border-b border-[#e2e8f0] text-xs font-semibold text-[#64748b]">
                    <th className="p-3">Student Name</th>
                    <th className="p-3">Student ID & Roll</th>
                    <th className="p-3">Course / Subject</th>
                    <th className="p-3">Time Detected</th>
                    <th className="p-3">Confidence</th>
                    <th className="p-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e8f0] text-xs">
                  {recordsList.map((rec: any, idx: number) => {
                    const isPresent = rec.status === 'PRESENT'
                    return (
                      <tr key={idx} className="hover:bg-[#f8f9ff] transition-colors">
                        <td className="p-3 font-semibold text-[#0b1c30]">{rec.student_name || rec.student_id}</td>
                        <td className="p-3 font-mono text-[#64748b]">{rec.roll_number || rec.student_id}</td>
                        <td className="p-3 font-medium text-[#0b1c30]">{rec.subject_name || rec.subject_code || '—'}</td>
                        <td className="p-3 font-mono text-[#64748b]">{formatTime(rec.timestamp || rec.date)}</td>
                        <td className="p-3 font-mono">
                          {rec.recognition_score ? (
                            <span className="text-[#065f46] font-bold bg-[#ecfdf5] border border-[#a7f3d0] px-2 py-0.5 rounded">
                              {Math.round(rec.recognition_score * 100)}%
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <Badge
                            className={isPresent
                              ? 'bg-[#ecfdf5] text-[#065f46] border-[#a7f3d0] text-[11px]'
                              : 'bg-[#ffdad6] text-[#ba1a1a] border-[#ffdad6] text-[11px]'}
                          >
                            {rec.status}
                          </Badge>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-[#64748b] space-y-2">
              <Users className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-semibold text-[#0b1c30]">No live face recognitions recorded yet</p>
              <p className="text-[11px] text-[#64748b] max-w-sm mx-auto">
                Once a faculty member starts an attendance session and scans student faces, real-time match records will appear here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

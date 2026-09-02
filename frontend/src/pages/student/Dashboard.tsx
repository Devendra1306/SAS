import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  GraduationCap, Calendar, BookOpen, Clock, AlertTriangle,
  Award, CheckCircle2, ArrowRight, ShieldCheck, RefreshCw, Library,
  MapPin, Navigation, Zap
} from 'lucide-react'
import toast from 'react-hot-toast'
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts'
import { useAuth } from '@/contexts/AuthContext'
import { analyticsService } from '@/services/analytics.service'
import { attendanceService } from '@/services/attendance.service'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatDate, formatTime } from '@/utils/format'

export default function StudentDashboard() {
  const { user, currentLocation, refreshLocation } = useAuth()
  const studentId = user?.student_id || user?.username || ''
  const [markingSpot, setMarkingSpot] = React.useState(false)

  const { data: rawAnalytics, isLoading: analyticsLoading, refetch: refetchAnalytics } = useQuery({
    queryKey: ['student-dashboard-analytics', studentId],
    queryFn: () => analyticsService.getStudentAnalytics(studentId),
    enabled: !!studentId,
  })

  const { data: rawHistory, isLoading: historyLoading, refetch: refetchHistory } = useQuery({
    queryKey: ['student-recent-history', studentId],
    queryFn: () => attendanceService.getStudentAttendance(studentId),
    enabled: !!studentId,
  })

  const handleGiveSpotAttendance = async () => {
    setMarkingSpot(true)
    try {
      // Sync fresh location
      const loc = await refreshLocation()
      const res = await attendanceService.spotMark({
        latitude: loc?.latitude || currentLocation?.latitude,
        longitude: loc?.longitude || currentLocation?.longitude,
        accuracy: loc?.accuracy || currentLocation?.accuracy
      })
      toast.success(res.message || '✓ Attendance marked on the spot!')
      refetchAnalytics()
      refetchHistory()
    } catch (err: any) {
      toast.error(err.response?.data?.detail || err.message || 'Spot attendance failed')
    } finally {
      setMarkingSpot(false)
    }
  }

  const subjectStats: any[] = rawAnalytics?.subject_stats || (Array.isArray(rawAnalytics) ? rawAnalytics : [])
  const historyList: any[] = rawHistory?.records || (Array.isArray(rawHistory) ? rawHistory : [])

  // Calculate overall percentage
  const totalConducted = subjectStats.reduce((acc, s) => acc + (s.classes_conducted || s.conducted || 0), 0)
  const totalAttended = subjectStats.reduce((acc, s) => acc + (s.classes_attended || s.attended || 0), 0)
  const overallPct = totalConducted > 0 ? Math.round((totalAttended / totalConducted) * 100) : (rawAnalytics?.overall_percentage || 0)

  // Circular gauge offsets (circumference = 2 * PI * 40 = 251.2)
  const circumference = 251.2
  const strokeDashoffset = circumference - (overallPct / 100) * circumference

  const trendData = rawAnalytics?.monthly_trend || [
    { month: 'Current', percentage: overallPct },
  ]

  const isVerifiedOnCampus = currentLocation?.verified_on_campus
  const distToCampus = currentLocation?.distance_meters != null ? Math.round(currentLocation.distance_meters) : null

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 font-sans">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl font-extrabold text-[#0b1c30] tracking-tight">
            Welcome, {user?.name || 'Student'}
          </h2>
          <p className="text-sm text-[#64748b] mt-0.5">
            {user?.student_id ? `${user.student_id} • ` : ''}Here is your live attendance record for the semester.
          </p>
        </div>

        {/* Live Location Telemetry Chip */}
        <div className="flex items-center gap-3">
          <div className="bg-white border border-[#e2e8f0] px-3.5 py-2 rounded-xl text-xs flex items-center gap-2.5 shadow-2xs">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <div>
              <span className="font-semibold text-[#0b1c30] block">
                {currentLocation ? (currentLocation.city || 'Tadepalligudem') : 'Tracking Location...'}
              </span>
              <span className="text-[10px] text-[#64748b] font-mono block">
                {distToCampus != null ? `${distToCampus}m from Campus Pin` : 'GPS Telemetry Active'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* On-The-Spot Attendance Action Card */}
      <div className="bg-gradient-to-r from-[#0058be] to-[#0b1c30] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-mono">
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>Instant Geofenced Check-In</span>
            </div>
            <h3 className="font-display text-2xl font-bold tracking-tight">
              Give Attendance On The Spot
            </h3>
            <p className="text-xs sm:text-sm text-[#93c5fd] leading-relaxed">
              When inside the classroom, click below to immediately verify your live GPS pin against the ongoing faculty lecture session and mark your attendance.
            </p>
            <div className="flex items-center gap-2 pt-1 font-mono text-xs text-[#bfdbfe]">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                Coordinates: {currentLocation ? `${currentLocation.latitude.toFixed(4)}, ${currentLocation.longitude.toFixed(4)}` : 'Acquiring...'}
              </span>
              {distToCampus != null && (
                <span className="text-emerald-300 font-semibold">• ({distToCampus}m to Campus)</span>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
            <Button
              onClick={handleGiveSpotAttendance}
              disabled={markingSpot}
              isLoading={markingSpot}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs h-12 px-6 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>⚡ MARK ATTENDANCE ON THE SPOT</span>
            </Button>
            <button
              onClick={() => refreshLocation()}
              className="text-[11px] font-mono text-[#93c5fd] hover:text-white flex items-center justify-center gap-1.5 py-1"
            >
              <RefreshCw className="w-3 h-3" /> Refresh GPS Pin
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Overall Attendance Card */}
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 flex flex-col items-center justify-center relative overflow-hidden shadow-2xs">
          <h3 className="font-display text-base font-bold text-[#0b1c30] mb-4 w-full text-left">Overall Attendance</h3>
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                className="text-[#eff4ff]"
                cx="50"
                cy="50"
                fill="transparent"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
              />
              <circle
                className="text-[#2170e4]"
                cx="50"
                cy="50"
                fill="transparent"
                r="40"
                stroke="currentColor"
                strokeDasharray="251.2"
                strokeDashoffset={strokeDashoffset}
                strokeWidth="8"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-2xl font-bold text-[#0b1c30]">{overallPct}%</span>
            </div>
          </div>
          <p className="text-xs font-semibold text-[#64748b] mt-2">Institutional Target: 75%</p>
        </div>

        {/* Today's Attendance */}
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 flex flex-col justify-between shadow-2xs">
          <div>
            <h3 className="font-display text-base font-bold text-[#0b1c30]">Classes Conducted</h3>
            <p className="text-xs text-[#64748b]">{formatDate(new Date())}</p>
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <span className="font-display text-4xl font-extrabold text-[#0b1c30]">{totalAttended}</span>
              <span className="font-display text-xl text-[#64748b]"> / {totalConducted}</span>
            </div>
            <div className="p-3 bg-[#eff4ff] text-[#2170e4] rounded-xl">
              <Calendar className="w-8 h-8" />
            </div>
          </div>
          <div className="w-full bg-[#eff4ff] h-2 rounded-full mt-4 overflow-hidden">
            <div
              className="bg-[#2170e4] h-full rounded-full"
              style={{ width: `${totalConducted > 0 ? (totalAttended / totalConducted) * 100 : 0}%` }}
            ></div>
          </div>
        </div>

        {/* Total Subjects */}
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 flex flex-col justify-between shadow-2xs">
          <div>
            <h3 className="font-display text-base font-bold text-[#0b1c30]">Enrolled Courses</h3>
            <p className="text-xs text-[#64748b]">Active semester subjects</p>
          </div>
          <div className="mt-4 flex items-end justify-between">
            <span className="font-display text-4xl font-extrabold text-[#0b1c30]">
              {subjectStats.length}
            </span>
            <div className="p-3 bg-slate-100 text-[#0b1c30] rounded-xl">
              <Library className="w-8 h-8" />
            </div>
          </div>
          <p className="text-xs text-[#64748b] mt-4 font-medium">Department theory & laboratory courses</p>
        </div>
      </div>

      {/* Complex Layout Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subject-wise Attendance */}
        <div className="lg:col-span-1 bg-white border border-[#e2e8f0] rounded-xl p-6 flex flex-col h-full shadow-2xs">
          <h3 className="font-display text-base font-bold text-[#0b1c30] mb-4">Subject-wise Attendance</h3>
          <div className="space-y-4 flex-1 overflow-y-auto pr-1">
            {subjectStats.length > 0 ? (
              subjectStats.map((stat: any, idx: number) => {
                const pct = Math.round(stat.percentage || 0)
                const isLow = pct < 50
                const isWarning = pct >= 50 && pct < 75
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between items-end text-xs">
                      <span className="font-medium text-[#0b1c30]">{stat.subject_name}</span>
                      <span className={`font-mono font-bold ${isLow ? 'text-[#ba1a1a]' : isWarning ? 'text-amber-600' : 'text-[#0b1c30]'}`}>
                        {pct}%
                      </span>
                    </div>
                    <div className="w-full bg-[#f1f5f9] h-1.5 rounded-full overflow-hidden relative">
                      <div
                        className={`h-full rounded-full ${
                          isLow ? 'bg-[#ba1a1a]' : isWarning ? 'bg-amber-500' : 'bg-[#2170e4]'
                        }`}
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="py-8 text-center text-[#64748b] text-xs space-y-1">
                <BookOpen className="w-6 h-6 text-slate-300 mx-auto" />
                <p>No subject statistics available yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Chart & Table Area */}
        <div className="lg:col-span-2 space-y-6 flex flex-col h-full">
          {/* Monthly Trend Chart */}
          <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 flex-1 shadow-2xs flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display text-base font-bold text-[#0b1c30]">Monthly Attendance Trend</h3>
              <Badge className="bg-[#eff4ff] text-[#0058be] border-[#dce9ff] text-xs">Semester</Badge>
            </div>
            <div className="w-full h-48 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} />
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
                  <Line type="monotone" dataKey="percentage" stroke="#2170e4" strokeWidth={3} dot={{ fill: '#2170e4', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent History Table */}
          <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden shadow-2xs">
            <div className="p-4 border-b border-[#e2e8f0] flex justify-between items-center bg-[#f8f9ff]">
              <h3 className="font-display text-sm font-bold text-[#0b1c30]">Recent Attendance Log</h3>
              <Link to="/student/attendance/history" className="text-xs font-semibold text-[#0058be] hover:underline">
                View Full Log
              </Link>
            </div>
            <div className="overflow-x-auto">
              {historyList.length > 0 ? (
                <table className="w-full text-left border-collapse">
                  <thead className="bg-[#eff4ff] text-xs text-[#64748b] border-b border-[#e2e8f0]">
                    <tr>
                      <th className="py-2.5 px-4 font-semibold">Date</th>
                      <th className="py-2.5 px-4 font-semibold">Subject</th>
                      <th className="py-2.5 px-4 font-semibold">Time</th>
                      <th className="py-2.5 px-4 font-semibold text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs text-[#0b1c30] divide-y divide-[#e2e8f0]">
                    {historyList.slice(0, 4).map((rec: any, idx: number) => {
                      const isPresent = rec.status === 'PRESENT'
                      return (
                        <tr key={idx} className="hover:bg-[#f8f9ff] transition-colors">
                          <td className="py-2.5 px-4">{formatDate(rec.date || rec.timestamp)}</td>
                          <td className="py-2.5 px-4 font-medium">{rec.subject_name}</td>
                          <td className="py-2.5 px-4 font-mono text-[#64748b]">{formatTime(rec.timestamp || rec.date)}</td>
                          <td className="py-2.5 px-4 text-right">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              isPresent
                                ? 'bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0]'
                                : 'bg-[#ffdad6] text-[#ba1a1a] border border-[#ffdad6]'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${isPresent ? 'bg-[#10b981]' : 'bg-[#ba1a1a]'}`}></span>
                              {rec.status}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="py-8 text-center text-xs text-[#64748b]">
                  No attendance records logged for your account yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

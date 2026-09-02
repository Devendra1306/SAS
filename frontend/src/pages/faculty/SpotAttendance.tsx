import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  MapPin, Users, CheckCircle2, AlertCircle, RefreshCw,
  Compass, Radio, ShieldCheck, Check, Clock, UserCheck
} from 'lucide-react'
import toast from 'react-hot-toast'
import { attendanceService } from '@/services/attendance.service'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useAuth } from '@/contexts/AuthContext'

export default function SpotAttendance() {
  const { currentLocation, refreshLocation } = useAuth()
  const queryClient = useQueryClient()
  const [markingId, setMarkingId] = useState<string | null>(null)
  const [markingAll, setMarkingAll] = useState(false)

  // Fetch active sessions to associate or view
  const { data: sessionsData, isLoading: sessionsLoading } = useQuery({
    queryKey: ['faculty-active-sessions'],
    queryFn: () => attendanceService.getSessions({ status: 'ACTIVE' }).then(r => r.data),
    refetchInterval: 8000
  })

  const activeSessions: any[] = sessionsData?.sessions || (Array.isArray(sessionsData) ? sessionsData : [])
  const activeSession = activeSessions[0] || null

  // Fetch tracked students
  const { data: trackedData, isLoading: trackedLoading, refetch: refetchTracked } = useQuery({
    queryKey: ['tracked-students', activeSession?.id || activeSession?._id],
    queryFn: () => attendanceService.getTrackedStudents({ session_id: activeSession?.id || activeSession?._id }),
    refetchInterval: 5000
  })

  const students: any[] = trackedData?.students || []
  const inRangeCount = trackedData?.in_range_count || students.filter(s => s.in_classroom_range).length
  const markedCount = trackedData?.marked_count || students.filter(s => s.is_marked).length

  // Mark single student on the spot
  const handleSpotMark = async (studentId: string) => {
    if (!activeSession) {
      toast.error('No active lecture session. Please start a session first.')
      return
    }
    setMarkingId(studentId)
    try {
      const res = await attendanceService.spotMark({
        session_id: activeSession.id || activeSession._id,
        student_id: studentId,
        latitude: currentLocation?.latitude,
        longitude: currentLocation?.longitude,
        accuracy: currentLocation?.accuracy
      })
      toast.success(res.message || 'Student marked present on the spot!')
      refetchTracked()
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to mark attendance')
    } finally {
      setMarkingId(null)
    }
  }

  // Mark all in-range students
  const handleMarkAllInRange = async () => {
    if (!activeSession) {
      toast.error('No active session.')
      return
    }
    const eligible = students.filter(s => s.in_classroom_range && !s.is_marked)
    if (eligible.length === 0) {
      toast('No unmarked students within classroom perimeter', { icon: 'ℹ️' })
      return
    }

    setMarkingAll(true)
    let count = 0
    for (const st of eligible) {
      try {
        await attendanceService.spotMark({
          session_id: activeSession.id || activeSession._id,
          student_id: st.student_id
        })
        count++
      } catch {
        // continue
      }
    }
    setMarkingAll(false)
    toast.success(`Marked ${count} student(s) present on the spot!`)
    refetchTracked()
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 font-sans">
      {/* Header Banner */}
      <div className="bg-white border border-[#e2e8f0] p-6 rounded-2xl shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge className="bg-[#eff4ff] text-[#0058be] border-[#dce9ff] text-xs">
              <Radio className="w-3 h-3 mr-1 animate-pulse text-[#0058be]" /> Live Telemetry
            </Badge>
            {activeSession ? (
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
                Active Lecture: {activeSession.subject_name || activeSession.subject_id}
              </Badge>
            ) : (
              <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-xs">
                No Active Session Running
              </Badge>
            )}
          </div>
          <h1 className="text-2xl font-bold text-[#0b1c30] tracking-tight font-display">
            On-The-Spot Classroom Attendance
          </h1>
          <p className="text-xs sm:text-sm text-[#64748b] mt-1">
            Real-time GPS proximity radar tracks students logging into the portal and enables instant spot attendance check-in.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              refreshLocation()
              refetchTracked()
            }}
            className="text-xs border-[#e2e8f0]"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Refresh Telemetry
          </Button>

          {activeSession && (
            <Button
              onClick={handleMarkAllInRange}
              disabled={markingAll || inRangeCount === 0}
              isLoading={markingAll}
              className="bg-[#0058be] hover:bg-[#004395] text-white text-xs font-bold"
            >
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              Mark All In-Perimeter ({inRangeCount})
            </Button>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-white border-[#e2e8f0]">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#eff4ff] text-[#0058be] flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-[#64748b]">Total Enrolled Students</p>
              <h3 className="text-xl font-bold text-[#0b1c30]">{students.length}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#e2e8f0]">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-[#64748b]">Within Classroom Perimeter (≤500m)</p>
              <h3 className="text-xl font-bold text-emerald-700">{inRangeCount}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#e2e8f0]">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-[#64748b]">Marked Present Today</p>
              <h3 className="text-xl font-bold text-blue-700">{markedCount} / {students.length}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tracked Students Table */}
      <Card className="bg-white border-[#e2e8f0]">
        <CardHeader className="pb-3 border-b border-[#f1f5f9]">
          <CardTitle className="text-base font-bold text-[#0b1c30] font-display flex items-center justify-between">
            <span>Student Live Location Radar</span>
            <span className="text-xs font-mono font-normal text-[#64748b]">Auto-updates every 5s</span>
          </CardTitle>
          <CardDescription className="text-xs text-[#64748b]">
            Telemetry reported upon login: students physically inside the classroom boundaries can be marked on the spot.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#f8f9ff] border-b border-[#e2e8f0] text-[#64748b] font-semibold">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Class</th>
                  <th className="py-3 px-4">Face Status</th>
                  <th className="py-3 px-4">Live Coordinates</th>
                  <th className="py-3 px-4">Distance to Class</th>
                  <th className="py-3 px-4">Perimeter Status</th>
                  <th className="py-3 px-4">Attendance</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f5f9]">
                {students.map((st) => {
                  const hasLocation = st.last_location?.latitude != null
                  const dist = st.distance_meters != null ? Math.round(st.distance_meters) : null

                  return (
                    <tr key={st.student_id} className="hover:bg-[#f8f9ff]/60 transition-colors">
                      <td className="py-3 px-4 font-medium text-[#0b1c30]">
                        <div>{st.name}</div>
                        <span className="text-[11px] font-mono text-[#64748b]">{st.student_id}</span>
                      </td>

                      <td className="py-3 px-4 text-[#64748b]">
                        {st.department} • Year {st.year} - {st.section}
                      </td>

                      <td className="py-3 px-4">
                        {st.is_face_enrolled ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Enrolled
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Not Enrolled</span>
                        )}
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px] text-[#0b1c30]">
                        {hasLocation ? (
                          <span>
                            {st.last_location.latitude.toFixed(4)}, {st.last_location.longitude.toFixed(4)}
                            <span className="block text-[10px] text-[#64748b]">
                              ±{Math.round(st.last_location.accuracy || 10)}m ({st.last_location.source || 'gps'})
                            </span>
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">No login signal yet</span>
                        )}
                      </td>

                      <td className="py-3 px-4 font-mono font-semibold">
                        {dist != null ? (
                          <span className={dist <= 500 ? 'text-emerald-700' : 'text-slate-600'}>
                            {dist > 1000 ? `${(dist / 1000).toFixed(1)} km` : `${dist}m`}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        {st.in_classroom_range ? (
                          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[11px]">
                            <Check className="w-3 h-3 mr-1 text-emerald-600" /> In Classroom
                          </Badge>
                        ) : hasLocation ? (
                          <Badge className="bg-slate-50 text-slate-600 border-slate-200 text-[11px]">
                            Outside (≥500m)
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[11px]">
                            Offline
                          </Badge>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        {st.is_marked ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-xs">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Present
                            <span className="text-[10px] text-[#64748b] font-normal block font-mono">
                              {st.verification_method || 'SPOT'}
                            </span>
                          </span>
                        ) : (
                          <span className="text-amber-600 font-medium text-xs">Pending</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        {st.is_marked ? (
                          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md">
                            Recorded ✓
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleSpotMark(st.student_id)}
                            disabled={markingId === st.student_id}
                            isLoading={markingId === st.student_id}
                            className="h-7 text-xs bg-[#0058be] hover:bg-[#004395] text-white"
                          >
                            <UserCheck className="w-3.5 h-3.5 mr-1" /> Mark Present
                          </Button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Clock, RefreshCw, Calendar, Users, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react'
import { attendanceService } from '@/services/attendance.service'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { AttendanceStatusBadge } from '@/components/attendance/AttendanceStatusBadge'
import { formatDate, formatTime } from '@/utils/format'

export default function AttendanceHistory() {
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null)

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['faculty-attendance-history'],
    queryFn: () => attendanceService.getAttendanceRecords({ page: 1, page_size: 50 }),
  })

  const recordsList: any[] = data?.records || (Array.isArray(data) ? data : [])

  // Group records by date & subject
  const sessionsMap: Record<string, any[]> = {}
  recordsList.forEach((r: any) => {
    const key = `${r.date || 'unknown'}_${r.subject_name || 'class'}`
    if (!sessionsMap[key]) sessionsMap[key] = []
    sessionsMap[key].push(r)
  })

  const sessionGroups = Object.entries(sessionsMap)

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto font-sans">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-[#e2e8f0] p-6 rounded-xl shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#0b1c30] tracking-tight font-display">Attendance History</h1>
            <Badge className="bg-[#eff4ff] text-[#0058be] border-[#dce9ff] text-xs">
              {sessionGroups.length} Archived Sessions
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#64748b] mt-1">
            Review past classroom roll calls, compliance rates, and student verification records.
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

      {/* Session Group List */}
      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))
        ) : sessionGroups.length === 0 ? (
          <Card className="bg-white border-[#e2e8f0] p-12 text-center text-slate-500 shadow-2xs">
            <Clock className="w-12 h-12 mx-auto mb-2 text-slate-400" />
            <p className="text-sm font-semibold text-[#0b1c30]">No session archives found</p>
          </Card>
        ) : (
          sessionGroups.map(([key, records]) => {
            const isExpanded = expandedSessionId === key
            const first = records[0]
            const presentCount = records.filter(r => r.status === 'PRESENT').length
            const attendancePct = Math.round((presentCount / records.length) * 100)

            return (
              <Card key={key} className="bg-white border-[#e2e8f0] overflow-hidden shadow-2xs">
                <div
                  onClick={() => setExpandedSessionId(isExpanded ? null : key)}
                  className="p-5 flex items-center justify-between cursor-pointer hover:bg-[#f8f9ff] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#eff4ff] text-[#0058be] border border-[#dce9ff] flex items-center justify-center font-bold text-xs">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#0b1c30] text-sm">{first?.subject_name || 'Course Lecture'}</h3>
                      <p className="text-xs text-[#64748b]">{formatDate(first?.date)} • Verified roll call archive</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                      <span className="text-[11px] text-[#64748b] block">Attendance Rate</span>
                      <span className="text-sm font-bold text-[#065f46]">{attendancePct}% ({presentCount}/{records.length})</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* Expanded Student Table */}
                {isExpanded && (
                  <div className="border-t border-[#e2e8f0] bg-[#f8f9ff] p-4">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-[#e2e8f0]">
                          <TableHead className="text-xs font-semibold text-[#64748b]">Student</TableHead>
                          <TableHead className="text-xs font-semibold text-[#64748b]">ID & Roll</TableHead>
                          <TableHead className="text-xs font-semibold text-[#64748b]">Time Recorded</TableHead>
                          <TableHead className="text-xs font-semibold text-[#64748b]">Verification</TableHead>
                          <TableHead className="text-right text-xs font-semibold text-[#64748b]">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {records.map((r: any, idx: number) => (
                          <TableRow key={r.id || idx} className="border-[#e2e8f0] bg-white">
                            <TableCell className="font-medium text-[#0b1c30] text-sm">{r.student_name || r.student_id}</TableCell>
                            <TableCell className="font-mono text-xs text-[#64748b]">{r.student_id}</TableCell>
                            <TableCell className="text-xs text-[#64748b]">{formatTime(r.timestamp || r.date)}</TableCell>
                            <TableCell>
                              <Badge className="bg-[#eff4ff] text-[#0058be] border-[#dce9ff] text-[10px] font-mono">
                                {r.verification_method || 'AI_FACE'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <AttendanceStatusBadge status={r.status} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}

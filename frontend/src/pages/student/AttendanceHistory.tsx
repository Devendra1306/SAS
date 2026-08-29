import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Clock, Calendar, RefreshCw, Filter } from 'lucide-react'
import { attendanceService } from '@/services/attendance.service'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { AttendanceStatusBadge } from '@/components/attendance/AttendanceStatusBadge'
import { formatDate, formatTime } from '@/utils/format'

export default function StudentAttendanceHistory() {
  const { user } = useAuth()
  const studentId = user?.student_id || user?.username || '23A81A4301'

  const [filters, setFilters] = useState({
    date_from: '',
    date_to: '',
    status: '',
  })

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['student-attendance-history', studentId, filters],
    queryFn: () => attendanceService.getStudentAttendance(studentId, filters),
  })

  const recordsList: any[] = data?.records || (Array.isArray(data) ? data : (data?.data || []))

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-sans">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-[#e2e8f0] p-6 rounded-xl shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#0b1c30] tracking-tight font-display">Attendance Archive</h1>
            <Badge className="bg-[#eff4ff] text-[#0058be] border-[#dce9ff] text-xs">
              {recordsList.length} Entries
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#64748b] mt-1">
            Complete historical roll call ledger for your student account.
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

      {/* Filter Bar */}
      <Card className="bg-white border-[#e2e8f0] shadow-2xs">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs text-[#64748b] font-medium">Start Date</label>
              <Input
                type="date"
                className="bg-white border-[#e2e8f0] text-[#0b1c30] text-sm h-10 rounded-lg"
                value={filters.date_from}
                onChange={e => setFilters({ ...filters, date_from: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-[#64748b] font-medium">End Date</label>
              <Input
                type="date"
                className="bg-white border-[#e2e8f0] text-[#0b1c30] text-sm h-10 rounded-lg"
                value={filters.date_to}
                onChange={e => setFilters({ ...filters, date_to: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-[#64748b] font-medium">Status Filter</label>
              <Select
                value={filters.status}
                onChange={e => setFilters({ ...filters, status: e.target.value })}
                className="bg-white border-[#e2e8f0] text-[#0b1c30] text-sm h-10 rounded-lg"
              >
                <option value="">All Statuses</option>
                <option value="PRESENT">Present</option>
                <option value="ABSENT">Absent</option>
                <option value="LATE">Late</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="bg-white border-[#e2e8f0] overflow-hidden shadow-2xs">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-[#f8f9ff]">
              <TableRow className="border-[#e2e8f0] hover:bg-transparent">
                <TableHead className="text-xs font-semibold text-[#64748b]">Course Subject</TableHead>
                <TableHead className="text-xs font-semibold text-[#64748b]">Lecture Date</TableHead>
                <TableHead className="text-xs font-semibold text-[#64748b]">Time Recorded</TableHead>
                <TableHead className="text-xs font-semibold text-[#64748b]">Method</TableHead>
                <TableHead className="text-right text-xs font-semibold text-[#64748b]">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-[#e2e8f0]">
                    <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-6 w-16 inline-block" /></TableCell>
                  </TableRow>
                ))
              ) : recordsList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-slate-500">
                    <Clock className="w-10 h-10 mx-auto mb-2 text-slate-400" />
                    <p className="text-sm font-semibold text-[#0b1c30]">No attendance entries match filters</p>
                  </TableCell>
                </TableRow>
              ) : (
                recordsList.map((rec: any, idx: number) => (
                  <TableRow key={rec.id || rec._id || idx} className="border-[#e2e8f0] hover:bg-[#f8f9ff] transition-colors">
                    <TableCell className="font-medium text-[#0b1c30] text-sm">
                      {rec.subject_name || rec.subject_code || 'Course Lecture'}
                    </TableCell>
                    <TableCell className="text-xs text-[#0b1c30]">
                      {formatDate(rec.date || rec.timestamp)}
                    </TableCell>
                    <TableCell className="text-xs text-[#64748b] font-mono">
                      {formatTime(rec.timestamp || rec.date)}
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-[#eff4ff] text-[#0058be] border-[#dce9ff] text-[10px] font-mono">
                        {rec.verification_method || 'AI_FACE'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <AttendanceStatusBadge status={rec.status} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

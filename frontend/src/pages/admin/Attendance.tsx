import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Download, Filter, Search, Calendar, RefreshCw, Clock,
  ShieldCheck, UserCheck, ChevronLeft, ChevronRight, FileSpreadsheet, FileText
} from 'lucide-react'
import toast from 'react-hot-toast'
import { attendanceService } from '@/services/attendance.service'
import { reportsService } from '@/services/reports.service'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { AttendanceStatusBadge } from '@/components/attendance/AttendanceStatusBadge'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatDate, formatTime } from '@/utils/format'

export default function Attendance() {
  const [page, setPage] = useState(1)
  const pageSize = 20
  const [filters, setFilters] = useState({
    date_from: '',
    date_to: '',
    status: '',
  })
  const [exporting, setExporting] = useState(false)

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['attendance-records', page, filters],
    queryFn: () => attendanceService.getAttendanceRecords({
      page,
      page_size: pageSize,
      date_from: filters.date_from || undefined,
      date_to: filters.date_to || undefined,
      status: filters.status || undefined,
    })
  })

  // Normalize API data response
  const recordsList: any[] = data?.records || (Array.isArray(data) ? data : (data?.data || []))
  const totalCount: number = data?.total ?? recordsList.length
  const totalPages = Math.ceil(totalCount / pageSize) || 1

  const handleExportCSV = async () => {
    setExporting(true)
    try {
      await reportsService.exportCSV(filters)
      toast.success('CSV report exported successfully')
    } catch {
      toast.error('Failed to export CSV')
    } finally {
      setExporting(false)
    }
  }

  const handleExportPDF = async () => {
    setExporting(true)
    try {
      await reportsService.exportPDF(filters)
      toast.success('PDF report exported successfully')
    } catch {
      toast.error('Failed to export PDF')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto font-sans">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-[#e2e8f0] p-6 rounded-xl shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#0b1c30] tracking-tight font-display">Attendance Records</h1>
            <Badge className="bg-[#eff4ff] text-[#0058be] border-[#dce9ff] text-xs">
              {totalCount} Total Entries
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#64748b] mt-1">
            Historical roll call logs, verification scores, and lecture timestamps.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="border-[#e2e8f0] bg-white text-[#0b1c30] hover:bg-[#eff4ff] text-xs h-9 rounded-lg"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5 text-slate-500" /> Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            isLoading={exporting}
            className="border-[#e2e8f0] bg-white text-[#0b1c30] hover:bg-[#eff4ff] text-xs h-9 rounded-lg"
          >
            <FileSpreadsheet className="w-4 h-4 mr-1.5 text-[#065f46]" /> Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPDF}
            isLoading={exporting}
            className="border-[#e2e8f0] bg-white text-[#0b1c30] hover:bg-[#eff4ff] text-xs h-9 rounded-lg"
          >
            <FileText className="w-4 h-4 mr-1.5 text-[#ba1a1a]" /> Export PDF
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <Card className="bg-white border-[#e2e8f0] shadow-2xs">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs text-[#64748b] font-medium">Date Range (From)</label>
              <Input
                type="date"
                className="bg-white border-[#e2e8f0] text-[#0b1c30] text-sm h-10 rounded-lg"
                value={filters.date_from}
                onChange={e => { setFilters({ ...filters, date_from: e.target.value }); setPage(1) }}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-[#64748b] font-medium">Date Range (To)</label>
              <Input
                type="date"
                className="bg-white border-[#e2e8f0] text-[#0b1c30] text-sm h-10 rounded-lg"
                value={filters.date_to}
                onChange={e => { setFilters({ ...filters, date_to: e.target.value }); setPage(1) }}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-[#64748b] font-medium">Attendance Status</label>
              <Select
                value={filters.status}
                onChange={e => { setFilters({ ...filters, status: e.target.value }); setPage(1) }}
                className="bg-white border-[#e2e8f0] text-[#0b1c30] text-sm h-10 rounded-lg"
              >
                <option value="">All Statuses (Present / Absent / Late)</option>
                <option value="PRESENT">Present Only</option>
                <option value="ABSENT">Absent Only</option>
                <option value="LATE">Late Only</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Records Table */}
      <Card className="bg-white border-[#e2e8f0] overflow-hidden shadow-2xs">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-[#f8f9ff]">
              <TableRow className="border-[#e2e8f0] hover:bg-transparent">
                <TableHead className="text-xs font-semibold text-[#64748b]">Student</TableHead>
                <TableHead className="text-xs font-semibold text-[#64748b]">Student ID & Roll</TableHead>
                <TableHead className="text-xs font-semibold text-[#64748b]">Subject / Course</TableHead>
                <TableHead className="text-xs font-semibold text-[#64748b]">Date & Time</TableHead>
                <TableHead className="text-xs font-semibold text-[#64748b]">Status</TableHead>
                <TableHead className="text-xs font-semibold text-[#64748b]">Method</TableHead>
                <TableHead className="text-right text-xs font-semibold text-[#64748b]">Confidence</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i} className="border-[#e2e8f0]">
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-12 inline-block" /></TableCell>
                  </TableRow>
                ))
              ) : recordsList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-slate-500">
                    <Clock className="w-10 h-10 mx-auto mb-2 text-slate-400" />
                    <p className="text-sm font-semibold text-[#0b1c30]">No attendance entries found</p>
                    <p className="text-xs text-[#64748b] mt-1">Try broadening your date or status filters.</p>
                  </TableCell>
                </TableRow>
              ) : (
                recordsList.map((record: any, idx: number) => {
                  const score = record.recognition_score || record.confidence_score
                  const isAi = record.verification_method === 'AI_FACE'
                  return (
                    <TableRow key={record.id || record._id || idx} className="border-[#e2e8f0] hover:bg-[#f8f9ff] transition-colors">
                      <TableCell>
                        <div className="font-semibold text-[#0b1c30] text-sm">
                          {record.student_name || 'Enrolled Student'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-mono text-xs text-[#0b1c30]">
                          <span className="font-semibold">{record.student_id}</span>
                          <span className="block text-[#64748b] text-[11px]">
                            {record.roll_number || record.roll_no || record.student_id}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-[#0b1c30] font-medium">
                          {record.subject_name || record.subject_code || 'Lecture'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs text-[#0b1c30]">
                          <span>{formatDate(record.date || record.timestamp)}</span>
                          <span className="block text-[#64748b] text-[11px] font-mono">
                            {formatTime(record.timestamp || record.date)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <AttendanceStatusBadge status={record.status} />
                      </TableCell>
                      <TableCell>
                        {isAi ? (
                          <Badge className="bg-[#eff4ff] text-[#0058be] border-[#dce9ff] text-[11px] flex items-center gap-1 w-fit font-mono">
                            <ShieldCheck className="w-3 h-3 text-[#0058be]" /> AI Face
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-slate-600 border-slate-200 bg-slate-50 text-[11px]">
                            Manual
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {score ? (
                          <span className="font-mono text-xs font-semibold text-[#065f46] bg-[#ecfdf5] border border-[#a7f3d0] px-2 py-0.5 rounded">
                            {Math.round(score * 100)}%
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#e2e8f0] bg-[#f8f9ff] text-xs text-[#64748b]">
            <span>
              Showing {recordsList.length > 0 ? (page - 1) * pageSize + 1 : 0} to{' '}
              {Math.min(page * pageSize, totalCount)} of {totalCount} records
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs border-[#e2e8f0] bg-white text-[#0b1c30] hover:bg-[#eff4ff]"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Previous
              </Button>
              <span className="font-semibold text-[#0b1c30] px-2">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs border-[#e2e8f0] bg-white text-[#0b1c30] hover:bg-[#eff4ff]"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

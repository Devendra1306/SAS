import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, Download, RefreshCw, Users, ShieldAlert, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { attendanceService } from '@/services/attendance.service'
import { reportsService } from '@/services/reports.service'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { Progress } from '@/components/ui/Progress'

export default function LowAttendance() {
  const [threshold, setThreshold] = useState(50)
  const [exporting, setExporting] = useState(false)

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['low-attendance', threshold],
    queryFn: () => attendanceService.getLowAttendance(threshold),
  })

  const studentsList: any[] = Array.isArray(data) ? data : (data?.students || data?.data || [])

  const handleExport = async () => {
    setExporting(true)
    try {
      await reportsService.exportCSV({ status: 'LOW_ATTENDANCE' })
      toast.success('Low attendance warning list exported')
    } catch {
      toast.error('Failed to export list')
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
            <h1 className="text-2xl font-bold text-[#0b1c30] tracking-tight font-display">Defaulters & Low Attendance</h1>
            <Badge className="bg-[#ffdad6] text-[#ba1a1a] border-[#ffdad6] text-xs font-mono">
              Cutoff: &lt; {threshold}%
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#64748b] mt-1">
            Automated compliance check identifying students falling behind institutional attendance criteria.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="border-[#e2e8f0] bg-white text-[#0b1c30] hover:bg-[#eff4ff] text-xs h-9 rounded-lg"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5 text-slate-500" /> Refresh
          </Button>
          <Button
            onClick={handleExport}
            isLoading={exporting}
            className="bg-[#ba1a1a] hover:bg-[#93000a] text-white font-medium text-xs h-9 rounded-lg shadow-xs"
          >
            <Download className="w-4 h-4 mr-1.5" /> Export Defaulter List
          </Button>
        </div>
      </div>

      {/* Threshold Selector Control */}
      <Card className="bg-white border-[#e2e8f0] shadow-2xs">
        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#ffdad6] flex items-center justify-center text-[#ba1a1a]">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#0b1c30]">Attendance Threshold Filter</p>
              <p className="text-[11px] text-[#64748b]">Students below this attendance percentage will be flagged</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min="10"
              max="90"
              value={threshold}
              onChange={e => setThreshold(Number(e.target.value))}
              className="w-20 bg-white border-[#e2e8f0] text-[#0b1c30] text-center font-mono font-bold text-sm h-9 rounded-lg"
            />
            <span className="text-xs font-semibold text-[#64748b]">%</span>
          </div>
        </CardContent>
      </Card>

      {/* Defaulter Table */}
      <Card className="bg-white border-[#e2e8f0] overflow-hidden shadow-2xs">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-[#f8f9ff]">
              <TableRow className="border-[#e2e8f0] hover:bg-transparent">
                <TableHead className="text-xs font-semibold text-[#64748b]">Student</TableHead>
                <TableHead className="text-xs font-semibold text-[#64748b]">Student ID & Roll</TableHead>
                <TableHead className="text-xs font-semibold text-[#64748b]">Subject / Course</TableHead>
                <TableHead className="text-xs font-semibold text-[#64748b]">Attended / Total</TableHead>
                <TableHead className="text-xs font-semibold text-[#64748b]">Attendance Gauge</TableHead>
                <TableHead className="text-right text-xs font-semibold text-[#64748b]">Risk Level</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i} className="border-[#e2e8f0]">
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-6 w-16 inline-block" /></TableCell>
                  </TableRow>
                ))
              ) : studentsList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                    <Users className="w-10 h-10 mx-auto mb-2 text-[#10b981]" />
                    <p className="text-sm font-semibold text-[#0b1c30]">No students below {threshold}%</p>
                    <p className="text-xs text-[#64748b] mt-1">All students meet current minimum attendance guidelines.</p>
                  </TableCell>
                </TableRow>
              ) : (
                studentsList.map((st: any, i: number) => {
                  const pct = Math.round(st.percentage || 0)
                  const isCritical = pct < 40
                  return (
                    <TableRow key={st.student_id || i} className="border-[#e2e8f0] hover:bg-[#f8f9ff] transition-colors">
                      <TableCell>
                        <div className="font-semibold text-[#0b1c30] text-sm">{st.student_name || st.name}</div>
                        <span className="text-xs text-[#64748b]">{st.department} • Sec {st.section || 'A'}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs text-[#0b1c30] font-semibold">{st.student_id}</span>
                        <span className="block text-[11px] text-[#64748b] font-mono">Roll: {st.roll_number || st.student_id}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-[#0b1c30] font-medium">{st.subject_name || st.subject_code || 'All Subjects'}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-semibold text-[#0b1c30]">
                          {st.classes_attended ?? st.attended ?? 0} / {st.classes_conducted ?? st.total ?? 0}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 w-36">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className={isCritical ? 'text-[#ba1a1a]' : 'text-amber-600'}>{pct}%</span>
                          </div>
                          <Progress value={pct} colorClass={isCritical ? 'bg-[#ba1a1a]' : 'bg-amber-500'} className="h-1.5 bg-slate-100" />
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant="outline"
                          className={isCritical
                            ? 'bg-[#ffdad6] text-[#ba1a1a] border-[#ffdad6] font-semibold text-[11px]'
                            : 'bg-amber-50 text-amber-800 border-amber-200 font-semibold text-[11px]'}
                        >
                          {isCritical ? 'Critical (<40%)' : 'Warning'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

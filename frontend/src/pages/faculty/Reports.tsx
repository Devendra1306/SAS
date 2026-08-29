import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { FileText, FileSpreadsheet, Download, RefreshCw, Calendar, BookOpen } from 'lucide-react'
import toast from 'react-hot-toast'
import { reportsService } from '@/services/reports.service'
import { subjectsService } from '@/services/subjects.service'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Label } from '@/components/ui/Label'

export default function FacultyReports() {
  const { user } = useAuth()
  const [exporting, setExporting] = useState(false)
  const [filters, setFilters] = useState({
    date_from: '',
    date_to: '',
    subject_id: '',
  })

  const { data: rawSubjects } = useQuery({
    queryKey: ['faculty-report-subjects'],
    queryFn: () => subjectsService.getSubjects(),
  })

  const subjectsList: any[] = Array.isArray(rawSubjects) ? rawSubjects : (rawSubjects?.subjects || rawSubjects?.data || [])

  const handleExportCSV = async () => {
    setExporting(true)
    try {
      await reportsService.exportCSV(filters)
      toast.success('CSV Report generated and downloaded!')
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
      toast.success('PDF Report generated and downloaded!')
    } catch {
      toast.error('Failed to export PDF')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-sans">
      {/* Banner */}
      <div className="bg-white border border-[#e2e8f0] p-6 rounded-xl shadow-2xs">
        <h1 className="text-2xl font-bold text-[#0b1c30] tracking-tight font-display">Faculty Course Attendance Reports</h1>
        <p className="text-xs sm:text-sm text-[#64748b] mt-1">
          Generate student attendance summaries and register rolls for your classes.
        </p>
      </div>

      {/* Filter Card */}
      <Card className="bg-white border-[#e2e8f0] shadow-2xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold text-[#0b1c30] font-display">Filter Parameters</CardTitle>
          <CardDescription className="text-xs text-[#64748b]">Select course and date range</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#0b1c30]">From Date</Label>
              <Input
                type="date"
                className="bg-white border-[#e2e8f0] text-[#0b1c30] text-sm h-10 rounded-lg"
                value={filters.date_from}
                onChange={e => setFilters({ ...filters, date_from: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#0b1c30]">To Date</Label>
              <Input
                type="date"
                className="bg-white border-[#e2e8f0] text-[#0b1c30] text-sm h-10 rounded-lg"
                value={filters.date_to}
                onChange={e => setFilters({ ...filters, date_to: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-[#0b1c30]">Course / Subject</Label>
            <Select
              value={filters.subject_id}
              onChange={e => setFilters({ ...filters, subject_id: e.target.value })}
              className="bg-white border-[#e2e8f0] text-[#0b1c30] text-sm h-10 rounded-lg"
            >
              <option value="">All My Assigned Subjects</option>
              {subjectsList.map((s: any) => (
                <option key={s.id || s._id} value={s.id || s._id}>
                  {s.subject_code || s.code} — {s.subject_name || s.name} ({s.department} • Y{s.year})
                </option>
              ))}
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Export Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Card className="bg-white border-[#e2e8f0] hover:border-[#2170e4] transition-colors shadow-2xs">
          <CardContent className="p-6 flex flex-col justify-between h-full space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#ecfdf5] border border-[#a7f3d0] flex items-center justify-center shrink-0">
                <FileSpreadsheet className="h-6 w-6 text-[#065f46]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#0b1c30] text-base">Export Class CSV</h3>
                <p className="text-xs text-[#64748b] mt-1">
                  Export raw attendance ledger for grading and department records.
                </p>
              </div>
            </div>
            <Button
              onClick={handleExportCSV}
              isLoading={exporting}
              className="w-full bg-[#065f46] hover:bg-[#044e39] text-white font-medium text-xs h-10 rounded-lg shadow-xs"
            >
              <Download className="w-4 h-4 mr-2" /> Download CSV
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#e2e8f0] hover:border-[#2170e4] transition-colors shadow-2xs">
          <CardContent className="p-6 flex flex-col justify-between h-full space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#ffdad6] border border-[#ffdad6] flex items-center justify-center shrink-0">
                <FileText className="h-6 w-6 text-[#ba1a1a]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#0b1c30] text-base">Export Printable PDF</h3>
                <p className="text-xs text-[#64748b] mt-1">
                  Formatted summary sheet suitable for department faculty review.
                </p>
              </div>
            </div>
            <Button
              onClick={handleExportPDF}
              isLoading={exporting}
              className="w-full bg-[#ba1a1a] hover:bg-[#93000a] text-white font-medium text-xs h-10 rounded-lg shadow-xs"
            >
              <Download className="w-4 h-4 mr-2" /> Download PDF
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

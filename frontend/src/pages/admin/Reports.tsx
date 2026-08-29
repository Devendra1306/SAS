import React, { useState } from 'react'
import { FileSpreadsheet, FileText, Download, Filter, Calendar, CheckCircle2, ShieldCheck, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { reportsService } from '@/services/reports.service'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'

export default function Reports() {
  const [exporting, setExporting] = useState(false)
  const [filters, setFilters] = useState({
    date_from: '',
    date_to: '',
    status: '',
  })

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
        <h1 className="text-2xl font-bold text-[#0b1c30] tracking-tight font-display">Institutional Attendance Reports</h1>
        <p className="text-xs sm:text-sm text-[#64748b] mt-1">
          Export standardized CSV datasets and formatted PDF reports with biometric verification scores.
        </p>
      </div>

      {/* Filter Card */}
      <Card className="bg-white border-[#e2e8f0] shadow-2xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold text-[#0b1c30] font-display">Report Parameters</CardTitle>
          <CardDescription className="text-xs text-[#64748b]">Specify date intervals and status filters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-[#64748b] font-medium">Filter Attendance Status</label>
            <Select
              value={filters.status}
              onChange={e => setFilters({ ...filters, status: e.target.value })}
              className="bg-white border-[#e2e8f0] text-[#0b1c30] text-sm h-10 rounded-lg"
            >
              <option value="">All Statuses (Complete Institutional Record)</option>
              <option value="PRESENT">Present Records Only</option>
              <option value="ABSENT">Absent Records Only</option>
              <option value="LATE">Late Records Only</option>
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
                <h3 className="font-semibold text-[#0b1c30] text-base">CSV Data Export</h3>
                <p className="text-xs text-[#64748b] mt-1">
                  Download raw tabular dataset compatible with Microsoft Excel, Google Sheets, and SIS databases.
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
                <h3 className="font-semibold text-[#0b1c30] text-base">PDF Document Export</h3>
                <p className="text-xs text-[#64748b] mt-1">
                  Generate official institutional PDF report with summary metrics, header stamps, and student sign-offs.
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

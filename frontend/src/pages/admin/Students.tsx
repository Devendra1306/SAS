import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  Search, UserPlus, Trash2, Edit3, ShieldCheck, AlertCircle,
  Users, RefreshCw, Filter, ChevronLeft, ChevronRight, CheckCircle2
} from 'lucide-react'
import toast from 'react-hot-toast'
import { studentsService } from '@/services/students.service'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/Dialog'
import { Label } from '@/components/ui/Label'

export default function Students() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [searchTerm, setSearchTerm] = useState('')
  const [department, setDepartment] = useState('')
  const [year, setYear] = useState<string>('')
  const [section, setSection] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 15

  // Edit Student Modal state
  const [editingStudent, setEditingStudent] = useState<any>(null)
  const [editFormData, setEditFormData] = useState({ name: '', email: '', phone: '', department: '', year: 1, section: 'A' })

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['students', page, department, year, section, searchTerm],
    queryFn: () => studentsService.getStudents({
      page,
      page_size: pageSize,
      department: department || undefined,
      year: year ? Number(year) : undefined,
      section: section || undefined,
      search: searchTerm || undefined,
    }),
  })

  // Normalize students array from API
  const studentsList: any[] = data?.students || (Array.isArray(data) ? data : (data?.data || []))
  const totalCount: number = data?.total ?? studentsList.length
  const totalPages = Math.ceil(totalCount / pageSize) || 1

  const deleteMutation = useMutation({
    mutationFn: (id: string) => studentsService.deleteStudent(id),
    onSuccess: () => {
      toast.success('Student record deactivated')
      queryClient.invalidateQueries({ queryKey: ['students'] })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'Failed to delete student')
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => studentsService.update(id, data),
    onSuccess: () => {
      toast.success('Student details updated')
      queryClient.invalidateQueries({ queryKey: ['students'] })
      setEditingStudent(null)
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'Failed to update student')
    }
  })

  const handleDelete = (student: any) => {
    if (window.confirm(`Are you sure you want to deactivate student ${student.name} (${student.student_id})?`)) {
      deleteMutation.mutate(student.student_id || student.id)
    }
  }

  const handleOpenEdit = (student: any) => {
    setEditingStudent(student)
    setEditFormData({
      name: student.name || '',
      email: student.email || '',
      phone: student.phone || '',
      department: student.department || 'CSE',
      year: student.year || 1,
      section: student.section || 'A',
    })
  }

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingStudent) return
    updateMutation.mutate({
      id: editingStudent.student_id || editingStudent.id,
      data: {
        ...editFormData,
        year: Number(editFormData.year),
      }
    })
  }

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto font-sans">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-[#e2e8f0] p-6 rounded-xl shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#0b1c30] tracking-tight font-display">Student Directory</h1>
            <Badge className="bg-[#eff4ff] text-[#0058be] border-[#dce9ff] text-xs">
              {totalCount} Total Enrolled
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#64748b] mt-1">
            Manage academic profiles, face biometric vector states, and portal credentials.
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
            onClick={() => navigate('/admin/students/register')}
            className="bg-[#0058be] hover:bg-[#004395] text-white font-medium shadow-xs text-xs h-9 rounded-lg"
          >
            <UserPlus className="w-4 h-4 mr-1.5" />
            Register Student
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <Card className="bg-white border-[#e2e8f0] shadow-2xs">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by name, student ID, roll no..."
                className="pl-9 bg-white border-[#e2e8f0] text-[#0b1c30] placeholder:text-slate-400 text-sm h-10 rounded-lg"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1) }}
              />
            </div>

            <Select
              value={department}
              onChange={(e) => { setDepartment(e.target.value); setPage(1) }}
              className="bg-white border-[#e2e8f0] text-[#0b1c30] text-sm h-10 rounded-lg"
            >
              <option value="">All Departments</option>
              <option value="CSE">CSE</option>
              <option value="ECE">ECE</option>
              <option value="EEE">EEE</option>
              <option value="MECH">MECH</option>
            </Select>

            <Select
              value={year}
              onChange={(e) => { setYear(e.target.value); setPage(1) }}
              className="bg-white border-[#e2e8f0] text-[#0b1c30] text-sm h-10 rounded-lg"
            >
              <option value="">All Years</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </Select>

            <Select
              value={section}
              onChange={(e) => { setSection(e.target.value); setPage(1) }}
              className="bg-white border-[#e2e8f0] text-[#0b1c30] text-sm h-10 rounded-lg"
            >
              <option value="">All Sections</option>
              <option value="A">Section A</option>
              <option value="B">Section B</option>
              <option value="C">Section C</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Student Table */}
      <Card className="bg-white border-[#e2e8f0] overflow-hidden shadow-2xs">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-[#f8f9ff]">
              <TableRow className="border-[#e2e8f0] hover:bg-transparent">
                <TableHead className="text-xs font-semibold text-[#64748b]">Student</TableHead>
                <TableHead className="text-xs font-semibold text-[#64748b]">Student ID & Roll</TableHead>
                <TableHead className="text-xs font-semibold text-[#64748b]">Department & Class</TableHead>
                <TableHead className="text-xs font-semibold text-[#64748b]">Account Status</TableHead>
                <TableHead className="text-xs font-semibold text-[#64748b]">Face Biometrics</TableHead>
                <TableHead className="text-right text-xs font-semibold text-[#64748b]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i} className="border-[#e2e8f0]">
                    <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-16 inline-block" /></TableCell>
                  </TableRow>
                ))
              ) : studentsList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                    <Users className="w-10 h-10 mx-auto mb-2 text-slate-400" />
                    <p className="text-sm font-semibold text-[#0b1c30]">No students matched your search</p>
                    <p className="text-xs text-[#64748b] mt-1">Try resetting the filters or register a new student.</p>
                  </TableCell>
                </TableRow>
              ) : (
                studentsList.map((student: any) => {
                  const isEnrolled = student.face_enrolled || (student.enrollment_count && student.enrollment_count > 0)
                  return (
                    <TableRow key={student.id || student.student_id} className="border-[#e2e8f0] hover:bg-[#f8f9ff] transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#eff4ff] text-[#0058be] border border-[#dce9ff] flex items-center justify-center font-bold text-xs shrink-0">
                            {student.name ? student.name.charAt(0).toUpperCase() : 'S'}
                          </div>
                          <div>
                            <p className="font-semibold text-[#0b1c30] text-sm">{student.name}</p>
                            <p className="text-xs text-[#64748b]">{student.email || '—'}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-mono text-xs text-[#0b1c30]">
                          <span className="font-semibold">{student.student_id}</span>
                          <span className="block text-[#64748b] text-[11px]">Roll: {student.roll_number || student.roll_no || student.student_id}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs text-[#0b1c30]">
                          <span className="font-medium">{student.department}</span>
                          <span className="text-[#64748b] block text-[11px]">Year {student.year} • Sec {student.section}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={student.is_active !== false
                            ? 'bg-[#ecfdf5] text-[#065f46] border-[#a7f3d0] text-[11px]'
                            : 'bg-slate-100 text-slate-600 border-slate-200 text-[11px]'}
                        >
                          {student.is_active !== false ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {isEnrolled ? (
                          <Badge className="bg-[#eff4ff] text-[#0058be] border-[#dce9ff] flex items-center gap-1 w-fit text-[11px]">
                            <ShieldCheck className="w-3 h-3 text-[#0058be]" />
                            {student.enrollment_count ? `${student.enrollment_count} Vectors` : 'Enrolled'}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-amber-700 border-amber-300 bg-amber-50 flex items-center gap-1 w-fit text-[11px]">
                            <AlertCircle className="w-3 h-3" /> Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Edit Student"
                            className="h-8 w-8 text-slate-500 hover:text-[#0b1c30] hover:bg-slate-100"
                            onClick={() => handleOpenEdit(student)}
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Deactivate Student"
                            className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleDelete(student)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
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
              Showing {studentsList.length > 0 ? (page - 1) * pageSize + 1 : 0} to{' '}
              {Math.min(page * pageSize, totalCount)} of {totalCount} students
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

      {/* Edit Student Dialog */}
      <Dialog open={!!editingStudent} onOpenChange={(open) => !open && setEditingStudent(null)}>
        <DialogContent className="bg-white border-[#e2e8f0] text-[#0b1c30]">
          <DialogHeader>
            <DialogTitle className="font-bold font-display">Edit Student Record</DialogTitle>
            <DialogDescription className="text-xs text-[#64748b]">
              Update academic details for {editingStudent?.student_id}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveEdit} className="space-y-4 py-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#0b1c30]">Full Name</Label>
              <Input
                className="bg-white border-[#e2e8f0] text-[#0b1c30] text-sm"
                value={editFormData.name}
                onChange={e => setEditFormData({ ...editFormData, name: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#0b1c30]">Email Address</Label>
                <Input
                  type="email"
                  className="bg-white border-[#e2e8f0] text-[#0b1c30] text-sm"
                  value={editFormData.email}
                  onChange={e => setEditFormData({ ...editFormData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#0b1c30]">Phone</Label>
                <Input
                  className="bg-white border-[#e2e8f0] text-[#0b1c30] text-sm"
                  value={editFormData.phone}
                  onChange={e => setEditFormData({ ...editFormData, phone: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#0b1c30]">Department</Label>
                <Select
                  value={editFormData.department}
                  onChange={e => setEditFormData({ ...editFormData, department: e.target.value })}
                  className="bg-white border-[#e2e8f0] text-[#0b1c30] text-sm"
                >
                  <option value="CSE">CSE</option>
                  <option value="ECE">ECE</option>
                  <option value="EEE">EEE</option>
                  <option value="MECH">MECH</option>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#0b1c30]">Year</Label>
                <Select
                  value={editFormData.year}
                  onChange={e => setEditFormData({ ...editFormData, year: Number(e.target.value) })}
                  className="bg-white border-[#e2e8f0] text-[#0b1c30] text-sm"
                >
                  <option value={1}>1st</option>
                  <option value={2}>2nd</option>
                  <option value={3}>3rd</option>
                  <option value={4}>4th</option>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#0b1c30]">Section</Label>
                <Select
                  value={editFormData.section}
                  onChange={e => setEditFormData({ ...editFormData, section: e.target.value })}
                  className="bg-white border-[#e2e8f0] text-[#0b1c30] text-sm"
                >
                  <option value="A">Sec A</option>
                  <option value="B">Sec B</option>
                  <option value="C">Sec C</option>
                </Select>
              </div>
            </div>
            <DialogFooter className="border-t border-[#e2e8f0] pt-4">
              <Button type="button" variant="outline" onClick={() => setEditingStudent(null)} className="border-[#e2e8f0] bg-white text-[#0b1c30]">
                Cancel
              </Button>
              <Button type="submit" isLoading={updateMutation.isPending} className="bg-[#0058be] hover:bg-[#004395] text-white">
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

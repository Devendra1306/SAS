import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, BookOpen, RefreshCw, Layers } from 'lucide-react'
import toast from 'react-hot-toast'
import { subjectsService } from '@/services/subjects.service'
import { facultyService } from '@/services/faculty.service'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Select } from '@/components/ui/Select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/Dialog'
import { Skeleton } from '@/components/ui/Skeleton'

export default function Subjects() {
  const queryClient = useQueryClient()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    subject_code: '',
    subject_name: '',
    department: 'CSE',
    year: 4,
    section: 'A',
    faculty_id: ''
  })

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => subjectsService.getSubjects(),
  })

  const { data: rawFaculty } = useQuery({
    queryKey: ['faculty'],
    queryFn: () => facultyService.getFaculty(),
  })

  const subjectsList: any[] = Array.isArray(data) ? data : (data?.subjects || data?.data || [])
  const facultyList: any[] = Array.isArray(rawFaculty) ? rawFaculty : (rawFaculty?.faculty || rawFaculty?.data || [])

  const createMutation = useMutation({
    mutationFn: (data: any) => subjectsService.createSubject(data),
    onSuccess: () => {
      toast.success('Subject created and assigned successfully')
      queryClient.invalidateQueries({ queryKey: ['subjects'] })
      setIsAddDialogOpen(false)
      setFormData({ subject_code: '', subject_name: '', department: 'CSE', year: 4, section: 'A', faculty_id: '' })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'Failed to create subject')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => subjectsService.deleteSubject(id),
    onSuccess: () => {
      toast.success('Subject deleted')
      queryClient.invalidateQueries({ queryKey: ['subjects'] })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'Failed to delete subject')
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate({
      ...formData,
      year: Number(formData.year)
    })
  }

  const handleDelete = (subj: any) => {
    if (window.confirm(`Delete subject ${subj.subject_name} (${subj.subject_code})?`)) {
      deleteMutation.mutate(subj.id || subj._id)
    }
  }

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto font-sans">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-[#e2e8f0] p-6 rounded-xl shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#0b1c30] tracking-tight font-display">Subject Catalog</h1>
            <Badge className="bg-[#eff4ff] text-[#0058be] border-[#dce9ff] text-xs">
              {subjectsList.length} Courses Offered
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#64748b] mt-1">
            Configure curriculum courses, assign faculty instructors, and map sections.
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
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-[#0058be] hover:bg-[#004395] text-white font-medium shadow-xs text-xs h-9 rounded-lg"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Add Subject
          </Button>
        </div>
      </div>

      {/* Main Table */}
      <Card className="bg-white border-[#e2e8f0] overflow-hidden shadow-2xs">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-[#f8f9ff]">
              <TableRow className="border-[#e2e8f0] hover:bg-transparent">
                <TableHead className="text-xs font-semibold text-[#64748b]">Course Code</TableHead>
                <TableHead className="text-xs font-semibold text-[#64748b]">Subject Title</TableHead>
                <TableHead className="text-xs font-semibold text-[#64748b]">Department</TableHead>
                <TableHead className="text-xs font-semibold text-[#64748b]">Class / Section</TableHead>
                <TableHead className="text-xs font-semibold text-[#64748b]">Assigned Faculty</TableHead>
                <TableHead className="text-right text-xs font-semibold text-[#64748b]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i} className="border-[#e2e8f0]">
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-8 inline-block" /></TableCell>
                  </TableRow>
                ))
              ) : subjectsList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                    <BookOpen className="w-10 h-10 mx-auto mb-2 text-slate-400" />
                    <p className="text-sm font-semibold text-[#0b1c30]">No subjects registered</p>
                    <p className="text-xs text-[#64748b] mt-1">Click 'Add Subject' to create courses.</p>
                  </TableCell>
                </TableRow>
              ) : (
                subjectsList.map((subject: any) => {
                  const code = subject.subject_code || subject.code
                  const name = subject.subject_name || subject.name
                  return (
                    <TableRow key={subject.id || subject._id} className="border-[#e2e8f0] hover:bg-[#f8f9ff] transition-colors">
                      <TableCell>
                        <span className="font-mono text-xs font-semibold text-[#0058be] bg-[#eff4ff] border border-[#dce9ff] px-2 py-0.5 rounded">
                          {code}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-[#0b1c30] text-sm">{name}</div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-[#0b1c30] font-medium">{subject.department}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-[#64748b]">Year {subject.year} • Sec {subject.section}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs text-[#0b1c30] border-[#e2e8f0] bg-white">
                          {subject.faculty_name || 'Assigned Instructor'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Delete Subject"
                          className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleDelete(subject)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Subject Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="bg-white border-[#e2e8f0] text-[#0b1c30]">
          <DialogHeader>
            <DialogTitle className="font-bold font-display">Create New Subject</DialogTitle>
            <DialogDescription className="text-xs text-[#64748b]">
              Configure course details and assign instructor
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#0b1c30]">Course Code *</Label>
                <Input
                  className="bg-white border-[#e2e8f0] text-[#0b1c30] font-mono uppercase text-sm"
                  placeholder="e.g. CS401"
                  required
                  value={formData.subject_code}
                  onChange={(e) => setFormData({ ...formData, subject_code: e.target.value.toUpperCase() })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#0b1c30]">Department *</Label>
                <Select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="bg-white border-[#e2e8f0] text-[#0b1c30] text-sm"
                >
                  <option value="CSE">CSE</option>
                  <option value="ECE">ECE</option>
                  <option value="EEE">EEE</option>
                  <option value="MECH">MECH</option>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#0b1c30]">Subject Name *</Label>
              <Input
                className="bg-white border-[#e2e8f0] text-[#0b1c30] text-sm"
                placeholder="e.g. Distributed Cloud Systems"
                required
                value={formData.subject_name}
                onChange={(e) => setFormData({ ...formData, subject_name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#0b1c30]">Academic Year *</Label>
                <Select
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                  className="bg-white border-[#e2e8f0] text-[#0b1c30] text-sm"
                >
                  <option value={1}>1st Year</option>
                  <option value={2}>2nd Year</option>
                  <option value={3}>3rd Year</option>
                  <option value={4}>4th Year</option>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#0b1c30]">Class Section *</Label>
                <Select
                  value={formData.section}
                  onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                  className="bg-white border-[#e2e8f0] text-[#0b1c30] text-sm"
                >
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                  <option value="C">Section C</option>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#0b1c30]">Assigned Instructor</Label>
              <Select
                value={formData.faculty_id}
                onChange={(e) => setFormData({ ...formData, faculty_id: e.target.value })}
                className="bg-white border-[#e2e8f0] text-[#0b1c30] text-sm"
              >
                <option value="">Select Instructor</option>
                {facultyList.map((f: any) => (
                  <option key={f.id || f._id || f.faculty_id} value={f.id || f._id}>
                    {f.name} ({f.faculty_id} - {f.department})
                  </option>
                ))}
              </Select>
            </div>

            <DialogFooter className="border-t border-[#e2e8f0] pt-4">
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)} className="border-[#e2e8f0] bg-white text-[#0b1c30]">
                Cancel
              </Button>
              <Button type="submit" isLoading={createMutation.isPending} className="bg-[#0058be] hover:bg-[#004395] text-white font-medium">
                Save Subject
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, Edit3, BookOpen, Mail, RefreshCw, Users, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
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

export default function Faculty() {
  const queryClient = useQueryClient()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    faculty_id: '',
    name: '',
    email: '',
    department: 'CSE',
    password: 'Faculty@123',
  })

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['faculty'],
    queryFn: () => facultyService.getFaculty(),
  })

  const facultyList: any[] = Array.isArray(data) ? data : (data?.faculty || data?.data || [])

  const createMutation = useMutation({
    mutationFn: (data: any) => facultyService.createFaculty(data),
    onSuccess: () => {
      toast.success('Faculty member added successfully')
      queryClient.invalidateQueries({ queryKey: ['faculty'] })
      setIsAddDialogOpen(false)
      setFormData({ faculty_id: '', name: '', email: '', department: 'CSE', password: 'Faculty@123' })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'Failed to create faculty member')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => facultyService.deleteFaculty(id),
    onSuccess: () => {
      toast.success('Faculty member deactivated')
      queryClient.invalidateQueries({ queryKey: ['faculty'] })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'Failed to delete faculty')
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate(formData)
  }

  const handleDelete = (faculty: any) => {
    if (window.confirm(`Deactivate faculty member ${faculty.name} (${faculty.faculty_id})?`)) {
      deleteMutation.mutate(faculty.faculty_id || faculty.id)
    }
  }

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto font-sans">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-[#e2e8f0] p-6 rounded-xl shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#0b1c30] tracking-tight font-display">Faculty Management</h1>
            <Badge className="bg-[#eff4ff] text-[#0058be] border-[#dce9ff] text-xs">
              {facultyList.length} Faculty Members
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#64748b] mt-1">
            Assign instructors to academic departments and configure course permissions.
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
            <Plus className="w-4 h-4 mr-1.5" /> Add Faculty Member
          </Button>
        </div>
      </div>

      {/* Main Table */}
      <Card className="bg-white border-[#e2e8f0] overflow-hidden shadow-2xs">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-[#f8f9ff]">
              <TableRow className="border-[#e2e8f0] hover:bg-transparent">
                <TableHead className="text-xs font-semibold text-[#64748b]">Instructor</TableHead>
                <TableHead className="text-xs font-semibold text-[#64748b]">Faculty ID</TableHead>
                <TableHead className="text-xs font-semibold text-[#64748b]">Department</TableHead>
                <TableHead className="text-xs font-semibold text-[#64748b]">Assigned Subjects</TableHead>
                <TableHead className="text-xs font-semibold text-[#64748b]">Status</TableHead>
                <TableHead className="text-right text-xs font-semibold text-[#64748b]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i} className="border-[#e2e8f0]">
                    <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-8 inline-block" /></TableCell>
                  </TableRow>
                ))
              ) : facultyList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                    <Users className="w-10 h-10 mx-auto mb-2 text-slate-400" />
                    <p className="text-sm font-semibold text-[#0b1c30]">No faculty members found</p>
                    <p className="text-xs text-[#64748b] mt-1">Click 'Add Faculty Member' to register instructors.</p>
                  </TableCell>
                </TableRow>
              ) : (
                facultyList.map((faculty: any) => (
                  <TableRow key={faculty.id || faculty.faculty_id} className="border-[#e2e8f0] hover:bg-[#f8f9ff] transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#eff4ff] text-[#0058be] border border-[#dce9ff] flex items-center justify-center font-bold text-xs shrink-0">
                          {faculty.name ? faculty.name.charAt(0).toUpperCase() : 'F'}
                        </div>
                        <div>
                          <p className="font-semibold text-[#0b1c30] text-sm">{faculty.name}</p>
                          <p className="text-xs text-[#64748b] flex items-center gap-1">
                            <Mail className="h-3 w-3 text-slate-400" /> {faculty.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs font-semibold text-[#0058be] bg-[#eff4ff] border border-[#dce9ff] px-2 py-0.5 rounded">
                        {faculty.faculty_id}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-[#0b1c30] font-medium">{faculty.department}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs text-[#0b1c30] border-[#e2e8f0] bg-white">
                        <BookOpen className="h-3 w-3 mr-1 text-[#64748b]" />
                        {faculty.subject_ids ? `${faculty.subject_ids.length} Subjects` : 'Assigned'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={faculty.is_active !== false
                          ? 'bg-[#ecfdf5] text-[#065f46] border-[#a7f3d0] text-[11px]'
                          : 'bg-slate-100 text-slate-600 border-slate-200 text-[11px]'}
                      >
                        {faculty.is_active !== false ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Deactivate Faculty"
                        className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(faculty)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Faculty Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="bg-white border-[#e2e8f0] text-[#0b1c30]">
          <DialogHeader>
            <DialogTitle className="font-bold font-display">Add New Faculty Member</DialogTitle>
            <DialogDescription className="text-xs text-[#64748b]">
              Register instructor profile and portal credentials
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#0b1c30]">Faculty ID *</Label>
                <Input
                  className="bg-white border-[#e2e8f0] text-[#0b1c30] text-sm uppercase font-mono"
                  placeholder="e.g. FAC004"
                  required
                  value={formData.faculty_id}
                  onChange={(e) => setFormData({ ...formData, faculty_id: e.target.value.toUpperCase() })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#0b1c30]">Department *</Label>
                <Select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="bg-white border-[#e2e8f0] text-[#0b1c30] text-sm"
                >
                  <option value="CSE">Computer Science (CSE)</option>
                  <option value="ECE">Electronics (ECE)</option>
                  <option value="EEE">Electrical (EEE)</option>
                  <option value="MECH">Mechanical (MECH)</option>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#0b1c30]">Full Name *</Label>
              <Input
                className="bg-white border-[#e2e8f0] text-[#0b1c30] text-sm"
                placeholder="e.g. Dr. Rajesh Sharma"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#0b1c30]">Institutional Email *</Label>
              <Input
                className="bg-white border-[#e2e8f0] text-[#0b1c30] text-sm"
                type="email"
                placeholder="rajesh.sharma@sas.edu"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#0b1c30]">Initial Password *</Label>
              <Input
                className="bg-white border-[#e2e8f0] text-[#0b1c30] text-sm"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <DialogFooter className="border-t border-[#e2e8f0] pt-4">
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)} className="border-[#e2e8f0] bg-white text-[#0b1c30]">
                Cancel
              </Button>
              <Button type="submit" isLoading={createMutation.isPending} className="bg-[#0058be] hover:bg-[#004395] text-white font-medium">
                Save Faculty
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { BookOpen, PlayCircle, Users, Layers, GraduationCap, RefreshCw } from 'lucide-react'
import { subjectsService } from '@/services/subjects.service'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'

export default function MySubjects() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['my-subjects'],
    queryFn: () => subjectsService.getSubjects(),
  })

  const subjectsList: any[] = Array.isArray(data) ? data : (data?.subjects || data?.data || [])

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto font-sans">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-[#e2e8f0] p-6 rounded-xl shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#0b1c30] tracking-tight font-display">Assigned Subjects</h1>
            <Badge className="bg-[#eff4ff] text-[#0058be] border-[#dce9ff] text-xs">
              {subjectsList.length} Courses
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#64748b] mt-1">
            Courses mapped to your profile for current semester roll calls.
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

      {/* Grid of Subject Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))
        ) : subjectsList.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-500 bg-white rounded-xl border border-[#e2e8f0]">
            <BookOpen className="w-12 h-12 mx-auto mb-3 text-slate-400" />
            <p className="text-sm font-semibold text-[#0b1c30]">No courses assigned to your account</p>
            <p className="text-xs text-[#64748b] mt-1">Contact your Administrator to map subjects to your ID.</p>
          </div>
        ) : (
          subjectsList.map((subject: any) => {
            const code = subject.subject_code || subject.code
            const name = subject.subject_name || subject.name
            return (
              <Card key={subject.id || subject._id} className="bg-white border-[#e2e8f0] hover:border-[#2170e4] transition-all shadow-2xs flex flex-col justify-between">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-xs font-bold text-[#0058be] bg-[#eff4ff] border border-[#dce9ff] px-2.5 py-1 rounded-lg">
                      {code}
                    </span>
                    <Badge variant="outline" className="text-xs text-[#64748b] border-[#e2e8f0] bg-[#f8f9ff]">
                      {subject.department}
                    </Badge>
                  </div>
                  <CardTitle className="text-base font-bold text-[#0b1c30] mt-3 leading-snug font-display">{name}</CardTitle>
                  <CardDescription className="text-xs text-[#64748b]">
                    Year {subject.year} • Section {subject.section}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-2 border-t border-[#e2e8f0] flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-[#64748b]">
                    <GraduationCap className="h-4 w-4 text-slate-400" />
                    <span>Active Semester</span>
                  </div>
                  <Link to="/faculty/attendance/start">
                    <Button size="sm" className="bg-[#0058be] hover:bg-[#004395] text-white font-medium text-xs h-8 rounded-lg">
                      <PlayCircle className="w-3.5 h-3.5 mr-1" /> Take Attendance
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}

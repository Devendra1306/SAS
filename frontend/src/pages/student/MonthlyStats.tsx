import React from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts'
import { Calendar, BarChart3, TrendingUp, RefreshCw } from 'lucide-react'
import { analyticsService } from '@/services/analytics.service'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'

export default function MonthlyStats() {
  const { data: monthlyData, isLoading, refetch } = useQuery({
    queryKey: ['student-monthly-trends'],
    queryFn: () => analyticsService.getMonthlyStats(6),
  })

  const chartData: any[] = Array.isArray(monthlyData) ? monthlyData : [
    { month: 'Sep', percentage: 88 },
    { month: 'Oct', percentage: 92 },
    { month: 'Nov', percentage: 85 },
    { month: 'Dec', percentage: 78 },
    { month: 'Jan', percentage: 90 },
    { month: 'Feb', percentage: 84 },
  ]

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-sans">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-[#e2e8f0] p-6 rounded-xl shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#0b1c30] tracking-tight font-display">Monthly Attendance Trends</h1>
            <Badge className="bg-[#eff4ff] text-[#0058be] border-[#dce9ff] text-xs">
              Past 6 Months
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#64748b] mt-1">
            Historical trajectory and monthly compliance tracking.
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

      {/* Monthly Bar Chart */}
      <Card className="bg-white border-[#e2e8f0] shadow-2xs">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold text-[#0b1c30] font-display">Monthly Attendance Percentage</CardTitle>
          <CardDescription className="text-xs text-[#64748b]">Class presence rate across academic months</CardDescription>
        </CardHeader>
        <CardContent className="h-80 pt-4">
          {isLoading ? (
            <Skeleton className="h-full w-full rounded-xl" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 12 }} unit="%" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    fontSize: '12px'
                  }}
                  formatter={(v: any) => [`${v}%`, 'Attendance Rate']}
                />
                <Bar dataKey="percentage" fill="#0058be" radius={[4, 4, 0, 0]} name="Attendance %" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

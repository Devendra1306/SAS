import api from './api'

export const analyticsService = {
  getDashboardStats: () => api.get('/analytics/dashboard').then(r => r.data),
  getDashboard: () => api.get('/analytics/dashboard').then(r => r.data),
  getWeeklyAttendance: () => api.get('/analytics/weekly').then(r => r.data),
  getWeeklyTrends: () => api.get('/analytics/weekly').then(r => r.data),
  getMonthlyAttendance: (monthsOrMonth: any = 6, year?: any) => {
    const m = typeof monthsOrMonth === 'number' ? monthsOrMonth : 6
    return api.get(`/analytics/monthly?months=${m}`).then(r => r.data)
  },
  getMonthlyStats: (monthsOrMonth: any = 6, year?: any) => {
    const m = typeof monthsOrMonth === 'number' ? monthsOrMonth : 6
    return api.get(`/analytics/monthly?months=${m}`).then(r => r.data)
  },
  getSubjectStats: () => api.get('/analytics/subject').then(r => r.data),
  getDepartmentStats: () => api.get('/analytics/department').then(r => r.data),
  getStudentStats: (studentId: string) => api.get(`/analytics/student/${studentId}`).then(r => r.data),
  getStudentAnalytics: (studentId: string) => api.get(`/analytics/student/${studentId}`).then(r => r.data),
}

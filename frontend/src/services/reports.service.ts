import api from './api'

export const reportsService = {
  exportCSV: (params?: Record<string, any>) =>
    api.get('/reports/export', {
      params: { format: 'csv', ...params },
      responseType: 'blob',
    }).then(r => {
      const url = URL.createObjectURL(r.data)
      const a = document.createElement('a')
      a.href = url
      a.download = 'attendance_report.csv'
      a.click()
      URL.revokeObjectURL(url)
    }),

  exportPDF: (params?: Record<string, any>) =>
    api.get('/reports/export', {
      params: { format: 'pdf', ...params },
      responseType: 'blob',
    }).then(r => {
      const url = URL.createObjectURL(r.data)
      const a = document.createElement('a')
      a.href = url
      a.download = 'attendance_report.pdf'
      a.click()
      URL.revokeObjectURL(url)
    }),
}

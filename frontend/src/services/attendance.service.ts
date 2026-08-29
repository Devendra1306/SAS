import api from './api'

export const attendanceService = {
  getSessions: (params?: any) => api.get('/attendance/sessions', { params }),
  getFacultySessions: (facultyId?: string, params?: any) =>
    api.get('/attendance/sessions', { params: { faculty_id: facultyId, ...params } }).then(r => r.data),
  startSession: (data: any) => api.post('/attendance/session', data).then(r => r.data),
  createSession: (data: any) => api.post('/attendance/session', data).then(r => r.data),
  endSession: (id: string) => api.put(`/attendance/session/${id}/end`).then(r => r.data),
  getSession: (id: string) => api.get(`/attendance/session/${id}`).then(r => r.data),
  getSessionAttendance: (id: string) => api.get(`/attendance/session/${id}`).then(r => r.data),
  getSessionRoster: (sessionId: string) => api.get(`/attendance/session/${sessionId}/roster`).then(r => r.data),
  getRecords: (sessionId: string) => api.get(`/attendance/session/${sessionId}/records`),
  getAuthorizedLocations: () => api.get('/attendance/locations').then(r => r.data),
  verifyLocation: (data: { latitude: number; longitude: number; classroom_id?: string; accuracy?: number }) =>
    api.post('/attendance/verify-location', data).then(r => r.data),
  calibrateLocation: (data: { name: string; latitude: number; longitude: number; allowed_radius_meters?: number; classroom_id?: string }) =>
    api.post('/attendance/calibrate-location', data).then(r => r.data),
  recognize: (data: { session_id: string; frame_base64: string }) => api.post('/attendance/recognize', data).then(r => r.data),
  recognizeOne: (data: { session_id: string; frame_base64?: string; manual_student_id?: string }) =>
    api.post('/attendance/recognize-one', data).then(r => r.data),
  markAttendance: (data: any) => api.post('/attendance/mark', data).then(r => r.data),
  getAll: (params?: any) => api.get('/attendance', { params }).then(r => r.data),
  getAttendance: (params?: any) => api.get('/attendance', { params }).then(r => r.data),
  getAttendanceRecords: (params?: any) => api.get('/attendance', { params }).then(r => r.data),
  getStudentAttendance: (studentId: string, paramsOrSubjectId?: any) => {
    const params = typeof paramsOrSubjectId === 'string' ? { subject_id: paramsOrSubjectId } : paramsOrSubjectId
    return api.get(`/attendance/student/${studentId}`, { params }).then(r => r.data)
  },
  getLowAttendance: (threshold: number = 50) => api.get('/attendance/low', { params: { threshold } }).then(r => r.data),
  getHighAttendance: (threshold: number = 90) => api.get('/attendance/high', { params: { threshold } }).then(r => r.data),
  updateAttendance: (id: string, data: { status: string; reason?: string }) => api.put(`/attendance/${id}`, data).then(r => r.data),
}

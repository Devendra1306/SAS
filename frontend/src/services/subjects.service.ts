import api from './api'

export const subjectsService = {
  getAll: (params?: Record<string, any>) => api.get('/subjects', { params }).then(r => r.data),
  getSubjects: (params?: Record<string, any>) => api.get('/subjects', { params }).then(r => r.data),
  getSubjectsByFaculty: (facultyId?: string) => api.get('/subjects', { params: { faculty_id: facultyId } }).then(r => r.data),
  getById: (id: string) => api.get(`/subjects/${id}`).then(r => r.data),
  create: (data: any) => api.post('/subjects', data).then(r => r.data),
  createSubject: (data: any) => api.post('/subjects', data).then(r => r.data),
  update: (id: string, data: any) => api.put(`/subjects/${id}`, data).then(r => r.data),
  updateSubject: (id: string, data: any) => api.put(`/subjects/${id}`, data).then(r => r.data),
  delete: (id: string) => api.delete(`/subjects/${id}`).then(r => r.data),
  deleteSubject: (id: string) => api.delete(`/subjects/${id}`).then(r => r.data),
}

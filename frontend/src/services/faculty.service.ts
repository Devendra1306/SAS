import api from './api'

export const facultyService = {
  getAll: (params?: Record<string, any>) => api.get('/faculty', { params }).then(r => r.data),
  getFaculty: (params?: Record<string, any>) => api.get('/faculty', { params }).then(r => r.data),
  getById: (id: string) => api.get(`/faculty/${id}`).then(r => r.data),
  create: (data: any) => api.post('/faculty', data).then(r => r.data),
  createFaculty: (data: any) => api.post('/faculty', data).then(r => r.data),
  update: (id: string, data: any) => api.put(`/faculty/${id}`, data).then(r => r.data),
  updateFaculty: (id: string, data: any) => api.put(`/faculty/${id}`, data).then(r => r.data),
  delete: (id: string) => api.delete(`/faculty/${id}`).then(r => r.data),
  deleteFaculty: (id: string) => api.delete(`/faculty/${id}`).then(r => r.data),
}

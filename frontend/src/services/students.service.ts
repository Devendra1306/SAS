import api from './api'

export const studentsService = {
  getAll: (params?: any) => api.get('/students', { params }).then(r => r.data),
  getStudents: (params?: any) => api.get('/students', { params }).then(r => r.data),
  getById: (id: string) => api.get(`/students/${id}`).then(r => r.data),
  create: (data: any) => api.post('/students', data).then(r => r.data),
  createStudent: (data: any) => api.post('/students', data).then(r => r.data),
  update: (id: string, data: any) => api.put(`/students/${id}`, data).then(r => r.data),
  updateStudent: (id: string, data: any) => api.put(`/students/${id}`, data).then(r => r.data),
  delete: (id: string) => api.delete(`/students/${id}`).then(r => r.data),
  deleteStudent: (id: string) => api.delete(`/students/${id}`).then(r => r.data),
  enrollFace: (id: string, formData: FormData) =>
    api.post(`/students/${id}/face-enrollment`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data),
}

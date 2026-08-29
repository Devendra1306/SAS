import api from './api'

export const authService = {
  login: (data: { username_or_email: string; password: string }) =>
    api.post('/auth/login', data).then(r => r.data),

  studentLogin: (data: { student_id_or_email: string; password: string }) =>
    api.post('/auth/student-login', data).then(r => r.data),

  refresh: (refresh_token: string) =>
    api.post('/auth/refresh', { refresh_token }).then(r => r.data),

  logout: () =>
    api.post('/auth/logout').then(r => r.data).catch(() => {}),

  getMe: () =>
    api.get('/auth/me').then(r => r.data),
}

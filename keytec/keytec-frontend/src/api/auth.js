import { api } from './client'

export const authApi = {
  register: (payload) => api.post('/register', payload).then(r => r.data),
  login:    (payload) => api.post('/login', payload).then(r => r.data),
  logout:   ()        => api.post('/logout').then(r => r.data),
  me:       ()        => api.get('/me').then(r => r.data),
  update:   (payload) => api.put('/me', payload).then(r => r.data),
}

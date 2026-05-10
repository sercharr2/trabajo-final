import { api } from './client'

export const designsApi = {
  list: () => api.get('/designs').then(r => r.data),
  gallery: (params = {}) => api.get('/designs/gallery', { params }).then(r => r.data),
  get: (id) => api.get(`/designs/${id}`).then(r => r.data),
  create: (payload) => api.post('/designs', payload).then(r => r.data),
  update: (id, payload) => api.put(`/designs/${id}`, payload).then(r => r.data),
  remove: (id) => api.delete(`/designs/${id}`).then(r => r.data),
}

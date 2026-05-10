import { api } from './client'

export const cartApi = {
  get: () => api.get('/cart').then(r => r.data),
  add: (payload) => api.post('/cart', payload).then(r => r.data),
  update: (id, quantity) => api.put(`/cart/${id}`, { quantity }).then(r => r.data),
  remove: (id) => api.delete(`/cart/${id}`).then(r => r.data),
  clear: () => api.delete('/cart').then(r => r.data),
}

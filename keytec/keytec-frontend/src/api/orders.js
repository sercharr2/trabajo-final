import { api } from './client'

export const ordersApi = {
  list: () => api.get('/orders').then(r => r.data),
  get: (number) => api.get(`/orders/${number}`).then(r => r.data),
  checkout: (payload) => api.post('/orders', payload).then(r => r.data),
}

import { api } from './client'

export const adminApi = {
  // Productos
  listProducts: (params = {}) => api.get('/admin/products', { params }).then(r => r.data),
  getProduct: (id) => api.get(`/admin/products/${id}`).then(r => r.data),
  createProduct: (payload) => api.post('/admin/products', payload).then(r => r.data),
  updateProduct: (id, payload) => api.put(`/admin/products/${id}`, payload).then(r => r.data),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`).then(r => r.data),
  uploadImage: (id, formData) =>
    api.post(`/admin/products/${id}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data),
  deleteImage: (id, imgId) => api.delete(`/admin/products/${id}/images/${imgId}`).then(r => r.data),
  // Pedidos
  listOrders: (params = {}) => api.get('/admin/orders', { params }).then(r => r.data),
  getOrder: (number) => api.get(`/admin/orders/${number}`).then(r => r.data),
  updateOrderStatus: (number, status) =>
    api.patch(`/admin/orders/${number}/status`, { status }).then(r => r.data),
  // Usuarios
  listUsers: (params = {}) => api.get('/admin/users', { params }).then(r => r.data),
  getUser: (id) => api.get(`/admin/users/${id}`).then(r => r.data),
  // Stats
  stats: () => api.get('/admin/stats').then(r => r.data),
}

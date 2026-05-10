import { api } from './client'

export const productsApi = {
  list: (params = {}) => api.get('/products', { params }).then(r => r.data),
  featured: () => api.get('/products/featured').then(r => r.data),
  get: (slug) => api.get(`/products/${slug}`).then(r => r.data),
  reviews: (slug) => api.get(`/products/${slug}/reviews`).then(r => r.data),
  postReview: (slug, payload) => api.post(`/products/${slug}/reviews`, payload).then(r => r.data),
}

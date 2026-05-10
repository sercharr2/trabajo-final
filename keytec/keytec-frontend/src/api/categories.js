import { api } from './client'

export const categoriesApi = {
  list: () => api.get('/categories').then(r => r.data),
  get: (slug) => api.get(`/categories/${slug}`).then(r => r.data),
}

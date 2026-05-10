import axios from 'axios'
import toast from 'react-hot-toast'

/**
 * Cliente axios central para el backend Laravel de KeyTec.
 * - baseURL apunta a la API v1.
 * - Inyecta el token de Sanctum (guardado en localStorage por el store de auth).
 * - Maneja 401 cerrando sesión.
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
})

// Interceptor de petición → añade Bearer token.
// Zustand persist guarda con la forma { state: { token, user }, version: 0 }
api.interceptors.request.use((config) => {
  const raw = localStorage.getItem('keytec_auth')
  if (raw) {
    try {
      const parsed = JSON.parse(raw)
      const token = parsed?.state?.token ?? parsed?.token
      if (token) config.headers.Authorization = `Bearer ${token}`
    } catch { /* ignora */ }
  }
  return config
})

// Interceptor de respuesta → maneja errores comunes
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status
    const message = error?.response?.data?.message || error.message

    if (status === 401) {
      // Token caducado o inválido
      localStorage.removeItem('keytec_auth')
      if (window.location.pathname !== '/login') {
        toast.error('Sesión expirada, inicia sesión de nuevo')
        window.location.href = '/login'
      }
    } else if (status === 403) {
      toast.error('No tienes permiso para esta acción')
    } else if (status === 422) {
      // Errores de validación: el componente puede leerlos de error.response.data.errors
    } else if (status >= 500) {
      toast.error('Error del servidor, vuelve a intentarlo')
    } else if (!error.response) {
      toast.error('No se puede conectar con el servidor')
    }

    return Promise.reject(error)
  }
)

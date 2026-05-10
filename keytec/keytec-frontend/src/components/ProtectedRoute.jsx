import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/auth'

/** Bloquea rutas si el usuario no está autenticado. */
export default function ProtectedRoute({ children }) {
  const token = useAuthStore((s) => s.token)
  const location = useLocation()

  if (!token) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }
  return children
}

/** Bloquea rutas que requieren rol admin. */
export function AdminRoute({ children }) {
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)
  const location = useLocation()

  if (!token) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }
  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />
  }
  return children
}

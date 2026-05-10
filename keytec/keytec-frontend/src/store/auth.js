import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Store de autenticación.
 * Persiste en localStorage bajo la clave "keytec_auth"
 * (esa misma clave la lee el interceptor axios para añadir el Bearer token).
 */
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,

      isAuthenticated: () => !!get().token,
      isAdmin: () => get().user?.role === 'admin',

      setAuth: ({ user, token }) => set({ user, token }),
      setUser: (user) => set({ user }),
      logout: () => set({ user: null, token: null }),
    }),
    { name: 'keytec_auth' }
  )
)

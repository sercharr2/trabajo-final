import { create } from 'zustand'

/** Estado UI ligero (modales, drawer del carrito, etc.). */
export const useUIStore = create((set) => ({
  cartOpen: false,
  setCartOpen: (open) => set({ cartOpen: open }),
  toggleCart: () => set((s) => ({ cartOpen: !s.cartOpen })),

  mobileMenuOpen: false,
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
}))

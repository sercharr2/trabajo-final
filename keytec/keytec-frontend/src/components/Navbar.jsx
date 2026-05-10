import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Search, ShoppingCart, User, Menu, X, LogOut, Package,
  Palette, ShieldCheck, Heart,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/auth'
import { cartApi } from '../api/cart'
import { authApi } from '../api/auth'
import { cn } from '../utils/format'

export default function Navbar() {
  const navigate = useNavigate()
  const { token, user, logout } = useAuthStore()
  const [search, setSearch] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  // Cuenta de items en el carrito (sólo si está autenticado)
  const { data: cart } = useQuery({
    queryKey: ['cart'],
    queryFn: cartApi.get,
    enabled: !!token,
    staleTime: 30_000,
  })
  const cartCount = cart?.count ?? 0

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) {
      navigate(`/productos?search=${encodeURIComponent(search.trim())}`)
      setSearch('')
      setMobileOpen(false)
    }
  }

  const handleLogout = async () => {
    try { await authApi.logout() } catch { /* ignora */ }
    logout()
    setUserMenuOpen(false)
    toast.success('Sesión cerrada')
    navigate('/')
  }

  const navLinkStyle = ({ isActive }) =>
    cn(
      'px-3 py-2 rounded-md text-sm font-medium transition-colors',
      isActive
        ? 'text-[var(--color-primary)] bg-[var(--color-primary)]/10'
        : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
    )

  return (
    <header className="sticky top-0 z-40 bg-[var(--color-bg)]/80 backdrop-blur-lg border-b border-[var(--color-border)]">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img src="/keytec-logo.svg" alt="KeyTec" className="w-8 h-8" />
            <span className="text-xl font-bold tracking-tight">
              Key<span className="text-[var(--color-primary)]">Tec</span>
            </span>
          </Link>

          {/* Nav links (desktop) */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink to="/productos" className={navLinkStyle}>Tienda</NavLink>
            <NavLink to="/productos?category=teclados" className={navLinkStyle}>Teclados</NavLink>
            <NavLink to="/productos?category=keycaps" className={navLinkStyle}>Keycaps</NavLink>
            <NavLink to="/productos?category=switches" className={navLinkStyle}>Switches</NavLink>
            <NavLink to="/personalizar" className={navLinkStyle}>
              <span className="inline-flex items-center gap-1.5">
                <Palette size={14} /> Personalizar
              </span>
            </NavLink>
          </div>

          {/* Buscador (desktop) */}
          <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-xs">
            <div className="relative w-full">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-dim)]"
              />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar..."
                className="w-full pl-9 pr-3 py-2 rounded-lg text-sm
                  bg-[var(--color-surface)] border border-[var(--color-border)]
                  hover:border-[var(--color-border-hover)]
                  focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>
          </form>

          {/* Iconos derecha */}
          <div className="flex items-center gap-1">
            {/* Carrito */}
            <Link
              to="/carrito"
              className="relative p-2 rounded-md text-[var(--color-text-muted)]
                hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)] transition-colors"
              aria-label="Carrito"
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1
                  bg-[var(--color-primary)] text-white text-[10px] font-bold
                  rounded-full flex items-center justify-center">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {/* Usuario */}
            {token ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen((o) => !o)}
                  onBlur={() => setTimeout(() => setUserMenuOpen(false), 150)}
                  className="flex items-center gap-2 p-2 rounded-md
                    text-[var(--color-text-muted)] hover:text-[var(--color-text)]
                    hover:bg-[var(--color-surface-2)] transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-[var(--color-primary)]/20 border border-[var(--color-primary)]/40 flex items-center justify-center text-xs font-bold text-[var(--color-primary)]">
                    {user?.name?.[0]?.toUpperCase() ?? 'U'}
                  </div>
                  <span className="hidden sm:inline text-sm">{user?.name?.split(' ')[0]}</span>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-[var(--color-surface)]
                    border border-[var(--color-border)] rounded-xl shadow-2xl py-1.5 animate-fade-in">
                    <div className="px-4 py-2 border-b border-[var(--color-border)]">
                      <p className="text-sm font-medium text-[var(--color-text)] truncate">{user?.name}</p>
                      <p className="text-xs text-[var(--color-text-dim)] truncate">{user?.email}</p>
                    </div>
                    <Link
                      to="/cuenta"
                      onMouseDown={(e) => e.preventDefault()}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)]"
                    >
                      <User size={14} /> Mi cuenta
                    </Link>
                    <Link
                      to="/cuenta/pedidos"
                      onMouseDown={(e) => e.preventDefault()}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)]"
                    >
                      <Package size={14} /> Mis pedidos
                    </Link>
                    <Link
                      to="/cuenta/disenos"
                      onMouseDown={(e) => e.preventDefault()}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)]"
                    >
                      <Heart size={14} /> Mis diseños
                    </Link>
                    {user?.role === 'admin' && (
                      <Link
                        to="/admin"
                        onMouseDown={(e) => e.preventDefault()}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--color-accent)] hover:bg-[var(--color-surface-2)] border-t border-[var(--color-border)]"
                      >
                        <ShieldCheck size={14} /> Panel admin
                      </Link>
                    )}
                    <button
                      onMouseDown={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[var(--color-danger)] hover:bg-[var(--color-surface-2)] border-t border-[var(--color-border)]"
                    >
                      <LogOut size={14} /> Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium
                  text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)]"
              >
                <User size={16} /> Entrar
              </Link>
            )}

            {/* Botón menú móvil */}
            <button
              className="md:hidden p-2 rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)]"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Menú"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Menú móvil */}
        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-2 animate-fade-in">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-dim)]" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar..."
                  className="w-full pl-9 pr-3 py-2 rounded-lg text-sm
                    bg-[var(--color-surface)] border border-[var(--color-border)]
                    focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>
            </form>
            <NavLink to="/productos" className={navLinkStyle} onClick={() => setMobileOpen(false)}>Tienda</NavLink>
            <NavLink to="/productos?category=teclados" className={navLinkStyle} onClick={() => setMobileOpen(false)}>Teclados</NavLink>
            <NavLink to="/productos?category=keycaps" className={navLinkStyle} onClick={() => setMobileOpen(false)}>Keycaps</NavLink>
            <NavLink to="/productos?category=switches" className={navLinkStyle} onClick={() => setMobileOpen(false)}>Switches</NavLink>
            <NavLink to="/personalizar" className={navLinkStyle} onClick={() => setMobileOpen(false)}>Personalizar</NavLink>
            {!token && (
              <Link to="/login" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-md text-sm font-medium text-[var(--color-primary)]">
                Iniciar sesión
              </Link>
            )}
          </div>
        )}
      </nav>
    </header>
  )
}

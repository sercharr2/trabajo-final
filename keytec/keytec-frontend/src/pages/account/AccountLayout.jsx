import { NavLink, Outlet } from 'react-router-dom'
import { User, Package, Heart } from 'lucide-react'
import { useAuthStore } from '../../store/auth'

export default function AccountLayout() {
  const user = useAuthStore((s) => s.user)

  const linkStyle = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors
     ${isActive
       ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
       : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)]'}`

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">Mi cuenta</h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          Hola, <span className="text-[var(--color-text)]">{user?.name}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-8">
        <aside>
          <nav className="space-y-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-2">
            <NavLink to="/cuenta" end className={linkStyle}>
              <User size={16} /> Perfil
            </NavLink>
            <NavLink to="/cuenta/pedidos" className={linkStyle}>
              <Package size={16} /> Mis pedidos
            </NavLink>
            <NavLink to="/cuenta/disenos" className={linkStyle}>
              <Heart size={16} /> Mis diseños
            </NavLink>
          </nav>
        </aside>
        <div>
          <Outlet />
        </div>
      </div>
    </div>
  )
}

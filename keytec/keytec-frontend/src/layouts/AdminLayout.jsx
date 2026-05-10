import { NavLink, Outlet, Link } from 'react-router-dom'
import { LayoutDashboard, Boxes, ShoppingBag, Users, ArrowLeft, ShieldCheck } from 'lucide-react'

export default function AdminLayout() {
  const linkStyle = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors
     ${isActive
       ? 'bg-[var(--color-primary)]/15 text-[var(--color-primary)] border border-[var(--color-primary)]/30'
       : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)]'}`

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 border-r border-[var(--color-border)] bg-[var(--color-surface)]/50 p-4 flex flex-col">
        <Link to="/" className="flex items-center gap-2 mb-8 px-2 py-2">
          <img src="/keytec-logo.svg" alt="" className="w-7 h-7" />
          <div>
            <p className="text-base font-bold leading-tight">
              Key<span className="text-[var(--color-primary)]">Tec</span>
            </p>
            <p className="text-[10px] uppercase tracking-wider text-[var(--color-accent)] flex items-center gap-1">
              <ShieldCheck size={10} /> Admin
            </p>
          </div>
        </Link>

        <nav className="space-y-1 flex-1">
          <NavLink to="/admin" end className={linkStyle}>
            <LayoutDashboard size={16} /> Dashboard
          </NavLink>
          <NavLink to="/admin/productos" className={linkStyle}>
            <Boxes size={16} /> Productos
          </NavLink>
          <NavLink to="/admin/pedidos" className={linkStyle}>
            <ShoppingBag size={16} /> Pedidos
          </NavLink>
          <NavLink to="/admin/usuarios" className={linkStyle}>
            <Users size={16} /> Usuarios
          </NavLink>
        </nav>

        <Link to="/" className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] mt-auto">
          <ArrowLeft size={14} /> Volver a la tienda
        </Link>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}

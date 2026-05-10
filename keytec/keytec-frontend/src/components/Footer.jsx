import { Link } from 'react-router-dom'
import { Code2, Send, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-[var(--color-border)] bg-[var(--color-surface)]/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Marca */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <img src="/keytec-logo.svg" alt="KeyTec" className="w-8 h-8" />
              <span className="text-lg font-bold">
                Key<span className="text-[var(--color-primary)]">Tec</span>
              </span>
            </div>
            <p className="text-sm text-[var(--color-text-muted)]">
              Teclados mecánicos y keycaps personalizables.
              Hechos para los que escriben con pasión.
            </p>
          </div>

          {/* Tienda */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-text)] mb-3">Tienda</h3>
            <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
              <li><Link to="/productos?category=teclados" className="hover:text-[var(--color-primary)]">Teclados</Link></li>
              <li><Link to="/productos?category=keycaps" className="hover:text-[var(--color-primary)]">Keycaps</Link></li>
              <li><Link to="/productos?category=switches" className="hover:text-[var(--color-primary)]">Switches</Link></li>
              <li><Link to="/personalizar" className="hover:text-[var(--color-primary)]">Personalizador</Link></li>
            </ul>
          </div>

          {/* Cuenta */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-text)] mb-3">Cuenta</h3>
            <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
              <li><Link to="/login" className="hover:text-[var(--color-primary)]">Iniciar sesión</Link></li>
              <li><Link to="/registro" className="hover:text-[var(--color-primary)]">Registrarse</Link></li>
              <li><Link to="/cuenta/pedidos" className="hover:text-[var(--color-primary)]">Mis pedidos</Link></li>
              <li><Link to="/cuenta/disenos" className="hover:text-[var(--color-primary)]">Mis diseños</Link></li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-text)] mb-3">Contacto</h3>
            <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
              <li>Avilés, Asturias</li>
              <li>info@keytec.es</li>
            </ul>
            <div className="flex gap-3 mt-4">
              <a href="#" aria-label="GitHub" className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"><Code2 size={18} /></a>
              <a href="#" aria-label="Twitter" className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"><Send size={18} /></a>
              <a href="mailto:info@keytec.es" aria-label="Email" className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"><Mail size={18} /></a>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[var(--color-border)] flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-[var(--color-text-dim)]">
          <p>© {new Date().getFullYear()} KeyTec. Proyecto fin de FP DAW · Sergio Charro</p>
          <p>Hecho con React + Laravel</p>
        </div>
      </div>
    </footer>
  )
}

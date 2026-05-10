import { useQuery } from '@tanstack/react-query'
import {
  ShoppingBag, Users, Boxes, TrendingUp, Euro, Package,
} from 'lucide-react'
import { adminApi } from '../../api/admin'
import Spinner from '../../components/ui/Spinner'
import { formatPrice, formatDateTime } from '../../utils/format'
import { Link } from 'react-router-dom'

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: adminApi.stats,
  })
  const { data: ordersPage } = useQuery({
    queryKey: ['admin', 'orders', { per_page: 5 }],
    queryFn: () => adminApi.listOrders({ per_page: 5 }),
  })

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  const cards = [
    { label: 'Ventas totales', value: formatPrice(stats?.total_revenue ?? 0), icon: Euro, color: 'var(--color-primary)' },
    { label: 'Pedidos', value: stats?.total_orders ?? 0, icon: ShoppingBag, color: 'var(--color-accent)' },
    { label: 'Productos', value: stats?.total_products ?? 0, icon: Boxes, color: 'var(--color-success)' },
    { label: 'Clientes', value: stats?.total_users ?? 0, icon: Users, color: 'var(--color-warning)' },
  ]

  const recent = ordersPage?.data ?? []

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-[var(--color-text-muted)] mt-1">Resumen general de KeyTec</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5">
            <div className="flex items-start justify-between mb-2">
              <span className="text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
                {c.label}
              </span>
              <c.icon size={18} style={{ color: c.color }} />
            </div>
            <p className="text-2xl font-bold">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Pedidos recientes */}
      <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold flex items-center gap-2">
            <Package size={18} className="text-[var(--color-primary)]" /> Pedidos recientes
          </h2>
          <Link to="/admin/pedidos" className="text-sm text-[var(--color-primary)] hover:underline">
            Ver todos
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="text-sm text-[var(--color-text-muted)] py-4">No hay pedidos todavía</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-[var(--color-text-muted)] border-b border-[var(--color-border)]">
                <th className="pb-2">Pedido</th>
                <th className="pb-2">Cliente</th>
                <th className="pb-2">Fecha</th>
                <th className="pb-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((o) => (
                <tr key={o.id} className="border-b border-[var(--color-border)] last:border-0">
                  <td className="py-3">
                    <Link to={`/admin/pedidos`} className="font-mono text-[var(--color-primary)] hover:underline">
                      {o.order_number}
                    </Link>
                  </td>
                  <td className="py-3">{o.user?.name || '—'}</td>
                  <td className="py-3 text-[var(--color-text-muted)] text-xs">
                    {formatDateTime(o.created_at)}
                  </td>
                  <td className="py-3 text-right font-medium">{formatPrice(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <p className="text-xs text-[var(--color-text-dim)] text-center">
        <TrendingUp size={12} className="inline mr-1" />
        Estadísticas calculadas en tiempo real desde la base de datos
      </p>
    </div>
  )
}

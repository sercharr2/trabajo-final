import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Package, ChevronRight } from 'lucide-react'
import { ordersApi } from '../../api/orders'
import Spinner from '../../components/ui/Spinner'
import { formatPrice, formatDate } from '../../utils/format'

const STATUS_STYLES = {
  pending:    { label: 'Pendiente',  cls: 'bg-[var(--color-warning)]/10 text-[var(--color-warning)] border-[var(--color-warning)]/30' },
  paid:       { label: 'Pagado',     cls: 'bg-[var(--color-accent)]/10 text-[var(--color-accent)] border-[var(--color-accent)]/30' },
  shipped:    { label: 'Enviado',    cls: 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] border-[var(--color-primary)]/30' },
  delivered:  { label: 'Entregado',  cls: 'bg-[var(--color-success)]/10 text-[var(--color-success)] border-[var(--color-success)]/30' },
  cancelled:  { label: 'Cancelado',  cls: 'bg-[var(--color-danger)]/10 text-[var(--color-danger)] border-[var(--color-danger)]/30' },
}

export default function Orders() {
  const { data, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: ordersApi.list,
  })

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  const orders = data?.data ?? []

  if (!orders.length) {
    return (
      <div className="text-center py-16 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl">
        <Package className="mx-auto text-[var(--color-text-dim)] mb-3" size={36} />
        <p className="text-lg mb-2">Aún no tienes pedidos</p>
        <Link to="/productos" className="text-sm text-[var(--color-primary)] hover:underline">
          Explora la tienda
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => {
        const status = STATUS_STYLES[order.status] || STATUS_STYLES.pending
        return (
          <Link
            key={order.id}
            to={`/cuenta/pedidos/${order.order_number}`}
            className="block bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5
              hover:border-[var(--color-primary)]/50 transition-colors"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <p className="font-mono font-semibold">{order.order_number}</p>
                  <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold border rounded ${status.cls}`}>
                    {status.label}
                  </span>
                </div>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {formatDate(order.created_at)} · {order.items?.length || 0} producto(s)
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold text-[var(--color-primary)]">
                  {formatPrice(order.total)}
                </span>
                <ChevronRight size={18} className="text-[var(--color-text-dim)]" />
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}

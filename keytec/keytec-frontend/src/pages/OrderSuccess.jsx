import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { CheckCircle2, Package, ChevronRight } from 'lucide-react'
import { ordersApi } from '../api/orders'
import Button from '../components/ui/Button'
import Spinner from '../components/ui/Spinner'
import { formatPrice, formatDate } from '../utils/format'

export default function OrderSuccess() {
  const { number } = useParams()

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', number],
    queryFn: () => ordersApi.get(number),
    enabled: !!number,
  })

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>
  if (!order) return null

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 animate-fade-in">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--color-success)]/10 border border-[var(--color-success)]/30 mb-4">
          <CheckCircle2 className="text-[var(--color-success)]" size={32} />
        </div>
        <h1 className="text-3xl font-bold">¡Pedido confirmado!</h1>
        <p className="text-[var(--color-text-muted)] mt-2">
          Te enviaremos un correo de confirmación en breve.
        </p>
      </div>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 space-y-4">
        <div className="flex justify-between items-center pb-4 border-b border-[var(--color-border)]">
          <div>
            <p className="text-xs text-[var(--color-text-muted)]">Número de pedido</p>
            <p className="font-mono font-semibold">{order.order_number}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[var(--color-text-muted)]">Fecha</p>
            <p className="text-sm">{formatDate(order.created_at)}</p>
          </div>
        </div>

        <div className="space-y-3">
          {order.items?.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>{item.product_name} <span className="text-[var(--color-text-muted)]">×{item.quantity}</span></span>
              <span>{formatPrice(item.subtotal)}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-[var(--color-border)] pt-4 space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-[var(--color-text-muted)]">Subtotal</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--color-text-muted)]">Envío</span>
            <span>{order.shipping_cost > 0 ? formatPrice(order.shipping_cost) : 'Gratis'}</span>
          </div>
          <div className="flex justify-between font-semibold text-base pt-2 border-t border-[var(--color-border)]">
            <span>Total</span>
            <span className="text-[var(--color-primary)]">{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <Link to="/cuenta/pedidos" className="flex-1">
          <Button variant="secondary" className="w-full">
            <Package size={16} /> Ver mis pedidos
          </Button>
        </Link>
        <Link to="/productos" className="flex-1">
          <Button className="w-full">
            Seguir comprando <ChevronRight size={16} />
          </Button>
        </Link>
      </div>
    </div>
  )
}

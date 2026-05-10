import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, MapPin, CreditCard } from 'lucide-react'
import { ordersApi } from '../../api/orders'
import Spinner from '../../components/ui/Spinner'
import { formatPrice, formatDateTime } from '../../utils/format'

export default function OrderDetail() {
  const { number } = useParams()
  const { data: order, isLoading } = useQuery({
    queryKey: ['order', number],
    queryFn: () => ordersApi.get(number),
  })

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>
  if (!order) return null

  const addr = order.shipping_address || {}

  return (
    <div className="space-y-6">
      <Link
        to="/cuenta/pedidos"
        className="inline-flex items-center gap-1 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
      >
        <ChevronLeft size={14} /> Mis pedidos
      </Link>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6">
        <div className="flex justify-between flex-wrap gap-3">
          <div>
            <p className="text-xs text-[var(--color-text-muted)]">Número de pedido</p>
            <p className="font-mono font-semibold text-lg">{order.order_number}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[var(--color-text-muted)]">Fecha</p>
            <p>{formatDateTime(order.created_at)}</p>
          </div>
        </div>
      </div>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6">
        <h2 className="font-semibold mb-4">Productos</h2>
        <div className="space-y-3">
          {order.items?.map((item) => (
            <div key={item.id} className="flex gap-4">
              <div className="w-16 h-16 rounded bg-[var(--color-surface-2)] overflow-hidden shrink-0">
                {item.product?.images?.[0]?.url && (
                  <img src={item.product.images[0].url} alt="" className="w-full h-full object-cover" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium">{item.product_name}</p>
                {item.design && (
                  <p className="text-xs text-[var(--color-accent)]">🎨 Diseño: {item.design.name}</p>
                )}
                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                  {formatPrice(item.unit_price)} × {item.quantity}
                </p>
              </div>
              <span className="font-semibold">{formatPrice(item.subtotal)}</span>
            </div>
          ))}
        </div>
        <div className="mt-5 pt-4 border-t border-[var(--color-border)] space-y-1 text-sm">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <MapPin size={16} className="text-[var(--color-primary)]" />
            <h3 className="font-medium">Dirección de envío</h3>
          </div>
          <p>{addr.name}</p>
          <p className="text-sm text-[var(--color-text-muted)]">{addr.address}</p>
          <p className="text-sm text-[var(--color-text-muted)]">
            {addr.postal_code} {addr.city}, {addr.country}
          </p>
        </div>
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard size={16} className="text-[var(--color-primary)]" />
            <h3 className="font-medium">Método de pago</h3>
          </div>
          <p className="capitalize">{order.payment_method}</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">Estado: {order.status}</p>
        </div>
      </div>
    </div>
  )
}

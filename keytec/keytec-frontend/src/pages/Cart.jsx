import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { cartApi } from '../api/cart'
import { useAuthStore } from '../store/auth'
import Button from '../components/ui/Button'
import Spinner from '../components/ui/Spinner'
import { formatPrice } from '../utils/format'

export default function Cart() {
  const navigate = useNavigate()
  const token = useAuthStore((s) => s.token)
  const queryClient = useQueryClient()

  const { data: cart, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: cartApi.get,
    enabled: !!token,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, quantity }) => cartApi.update(id, quantity),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
    onError: () => toast.error('No se pudo actualizar la cantidad'),
  })

  const removeMutation = useMutation({
    mutationFn: (id) => cartApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      toast.success('Producto eliminado')
    },
  })

  const clearMutation = useMutation({
    mutationFn: () => cartApi.clear(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      toast.success('Carrito vaciado')
    },
  })

  if (!token) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center animate-fade-in">
        <ShoppingBag size={48} className="mx-auto text-[var(--color-text-dim)] mb-4" />
        <h1 className="text-2xl font-semibold mb-3">Tu carrito está vacío</h1>
        <p className="text-[var(--color-text-muted)] mb-6">
          Inicia sesión para añadir productos al carrito
        </p>
        <Link to="/login"><Button>Iniciar sesión</Button></Link>
      </div>
    )
  }

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  const items = cart?.items ?? []
  const subtotal = cart?.subtotal ?? 0
  const shippingCost = subtotal >= 80 ? 0 : 4.99
  const total = subtotal + shippingCost

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center animate-fade-in">
        <ShoppingBag size={48} className="mx-auto text-[var(--color-text-dim)] mb-4" />
        <h1 className="text-2xl font-semibold mb-3">Tu carrito está vacío</h1>
        <p className="text-[var(--color-text-muted)] mb-6">
          Añade productos a tu carrito para continuar
        </p>
        <Link to="/productos"><Button>Ir a la tienda</Button></Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="flex items-baseline justify-between mb-6">
        <h1 className="text-3xl font-semibold">Carrito</h1>
        <button
          onClick={() => clearMutation.mutate()}
          className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-danger)]"
        >
          Vaciar carrito
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
        {/* Lista de items */}
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 flex gap-4"
            >
              <Link to={`/productos/${item.product.slug}`} className="shrink-0">
                <div className="w-24 h-24 rounded-lg bg-[var(--color-surface-2)] overflow-hidden">
                  {item.product.image_url && (
                    <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
                  )}
                </div>
              </Link>
              <div className="flex-1 min-w-0">
                <Link
                  to={`/productos/${item.product.slug}`}
                  className="font-medium hover:text-[var(--color-primary)] line-clamp-1"
                >
                  {item.product.name}
                </Link>
                {item.design && (
                  <p className="text-xs text-[var(--color-accent)] mt-0.5">
                    🎨 Diseño: {item.design.name}
                  </p>
                )}
                <p className="text-sm text-[var(--color-text-muted)] mt-1">
                  {formatPrice(item.product.price)} c/u
                </p>
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex items-center bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-md text-sm">
                    <button
                      onClick={() => updateMutation.mutate({ id: item.id, quantity: Math.max(1, item.quantity - 1) })}
                      disabled={item.quantity <= 1}
                      className="p-1.5 hover:bg-[var(--color-surface)] rounded-l-md disabled:opacity-50"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="px-3 font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateMutation.mutate({ id: item.id, quantity: Math.min(item.product.stock, item.quantity + 1) })}
                      disabled={item.quantity >= item.product.stock}
                      className="p-1.5 hover:bg-[var(--color-surface)] rounded-r-md disabled:opacity-50"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                  <button
                    onClick={() => removeMutation.mutate(item.id)}
                    className="text-[var(--color-text-muted)] hover:text-[var(--color-danger)] p-1.5"
                    aria-label="Eliminar"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-lg font-semibold">{formatPrice(item.line_total)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Resumen */}
        <aside className="lg:sticky lg:top-20 self-start">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 space-y-4">
            <h3 className="font-semibold text-lg">Resumen</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Envío</span>
                <span className={shippingCost === 0 ? 'text-[var(--color-success)]' : ''}>
                  {shippingCost === 0 ? 'Gratis' : formatPrice(shippingCost)}
                </span>
              </div>
              {subtotal < 80 && (
                <p className="text-xs text-[var(--color-text-dim)]">
                  Te faltan {formatPrice(80 - subtotal)} para envío gratis
                </p>
              )}
              <div className="border-t border-[var(--color-border)] pt-3 flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span className="text-[var(--color-primary)]">{formatPrice(total)}</span>
              </div>
            </div>
            <Button
              size="lg"
              className="w-full"
              onClick={() => navigate('/checkout')}
            >
              Tramitar pedido <ArrowRight size={16} />
            </Button>
            <Link
              to="/productos"
              className="block text-center text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
            >
              Seguir comprando
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}

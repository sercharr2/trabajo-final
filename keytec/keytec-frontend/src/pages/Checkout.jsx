import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CreditCard, MapPin, ChevronLeft, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import { cartApi } from '../api/cart'
import { ordersApi } from '../api/orders'
import { useAuthStore } from '../store/auth'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Spinner from '../components/ui/Spinner'
import { formatPrice } from '../utils/format'

export default function Checkout() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)

  const { data: cart, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: cartApi.get,
  })

  const [form, setForm] = useState({
    name: '',
    address: '',
    city: '',
    postal_code: '',
    country: 'España',
    payment_method: 'stripe',
  })
  const [errors, setErrors] = useState({})

  // Pre-rellena con los datos del usuario si los tiene
  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        name: user.name || '',
        address: user.address || '',
        city: user.city || '',
        postal_code: user.postal_code || '',
        country: user.country || 'España',
      }))
    }
  }, [user])

  const checkoutMutation = useMutation({
    mutationFn: ordersApi.checkout,
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      toast.success('Pedido realizado correctamente')
      navigate(`/pedido/${order.order_number}`, { replace: true })
    },
    onError: (err) => {
      const data = err?.response?.data
      if (data?.errors) setErrors(data.errors)
      toast.error(data?.message || 'No se pudo procesar el pedido')
    },
  })

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>
  if (!cart?.items?.length) {
    return (
      <div className="text-center py-20">
        <p className="mb-4">Tu carrito está vacío</p>
        <Link to="/productos"><Button>Ir a la tienda</Button></Link>
      </div>
    )
  }

  const subtotal = cart.subtotal
  const shippingCost = subtotal >= 80 ? 0 : 4.99
  const total = subtotal + shippingCost

  const handleSubmit = (e) => {
    e.preventDefault()
    setErrors({})
    checkoutMutation.mutate({
      shipping_address: {
        name: form.name,
        address: form.address,
        city: form.city,
        postal_code: form.postal_code,
        country: form.country,
      },
      payment_method: form.payment_method,
    })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <Link to="/carrito" className="inline-flex items-center gap-1 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] mb-4">
        <ChevronLeft size={14} /> Volver al carrito
      </Link>
      <h1 className="text-3xl font-semibold mb-8">Tramitar pedido</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
        {/* Formulario */}
        <div className="space-y-6">
          {/* Dirección de envío */}
          <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin size={18} className="text-[var(--color-primary)]" />
              <h2 className="text-lg font-semibold">Dirección de envío</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nombre completo" required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                error={errors['shipping_address.name']?.[0]}
                containerClassName="md:col-span-2"
              />
              <Input
                label="Dirección" required
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                error={errors['shipping_address.address']?.[0]}
                placeholder="Calle, número, piso..."
                containerClassName="md:col-span-2"
              />
              <Input
                label="Ciudad" required
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                error={errors['shipping_address.city']?.[0]}
              />
              <Input
                label="Código postal" required
                value={form.postal_code}
                onChange={(e) => setForm({ ...form, postal_code: e.target.value })}
                error={errors['shipping_address.postal_code']?.[0]}
              />
              <Input
                label="País" required
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                error={errors['shipping_address.country']?.[0]}
                containerClassName="md:col-span-2"
              />
            </div>
          </section>

          {/* Método de pago */}
          <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard size={18} className="text-[var(--color-primary)]" />
              <h2 className="text-lg font-semibold">Método de pago</h2>
            </div>
            <div className="space-y-2">
              {[
                { id: 'stripe', label: 'Tarjeta de crédito/débito', desc: 'Pago seguro con Stripe' },
                { id: 'paypal', label: 'PayPal', desc: 'Pago con tu cuenta PayPal' },
                { id: 'transfer', label: 'Transferencia bancaria', desc: 'El pedido se procesa al confirmar la transferencia' },
              ].map((method) => (
                <label
                  key={method.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors
                    ${form.payment_method === method.id
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                      : 'border-[var(--color-border)] hover:border-[var(--color-border-hover)]'}`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={method.id}
                    checked={form.payment_method === method.id}
                    onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
                    className="mt-1 accent-[var(--color-primary)]"
                  />
                  <div>
                    <p className="font-medium">{method.label}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{method.desc}</p>
                  </div>
                </label>
              ))}
            </div>
            <p className="mt-4 text-xs text-[var(--color-text-dim)] flex items-center gap-1.5">
              <Lock size={12} /> Esta es una versión demo: no se realiza un cobro real.
            </p>
          </section>
        </div>

        {/* Resumen */}
        <aside className="lg:sticky lg:top-20 self-start">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 space-y-4">
            <h3 className="font-semibold">Resumen del pedido</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {cart.items.map((item) => (
                <div key={item.id} className="flex gap-3 text-sm">
                  <div className="w-12 h-12 rounded bg-[var(--color-surface-2)] overflow-hidden shrink-0">
                    {item.product.image_url && (
                      <img src={item.product.image_url} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="line-clamp-1">{item.product.name}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">x{item.quantity}</p>
                  </div>
                  <span className="text-sm font-medium">{formatPrice(item.line_total)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-[var(--color-border)] pt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Envío</span>
                <span>{shippingCost === 0 ? 'Gratis' : formatPrice(shippingCost)}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg pt-2 border-t border-[var(--color-border)]">
                <span>Total</span>
                <span className="text-[var(--color-primary)]">{formatPrice(total)}</span>
              </div>
            </div>
            <Button
              type="submit"
              size="lg"
              className="w-full"
              loading={checkoutMutation.isPending}
            >
              <Lock size={14} /> Confirmar pedido
            </Button>
          </div>
        </aside>
      </form>
    </div>
  )
}

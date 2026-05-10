import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { adminApi } from '../../api/admin'
import Spinner from '../../components/ui/Spinner'
import { formatPrice, formatDateTime } from '../../utils/format'

const STATUSES = [
  { value: 'pending',   label: 'Pendiente',  color: 'var(--color-warning)' },
  { value: 'paid',      label: 'Pagado',     color: 'var(--color-accent)' },
  { value: 'processing',label: 'Procesando', color: 'var(--color-warning)' },
  { value: 'shipped',   label: 'Enviado',    color: 'var(--color-primary)' },
  { value: 'delivered', label: 'Entregado',  color: 'var(--color-success)' },
  { value: 'cancelled', label: 'Cancelado',  color: 'var(--color-danger)' },
]

export default function AdminOrders() {
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'orders', { status: filter }],
    queryFn: () => adminApi.listOrders(filter ? { status: filter } : {}),
  })

  const updateStatus = useMutation({
    mutationFn: ({ number, status }) => adminApi.updateOrderStatus(number, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] })
      toast.success('Estado actualizado')
    },
    onError: () => toast.error('No se pudo actualizar el estado'),
  })

  const orders = data?.data ?? []

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Pedidos</h1>
        <p className="text-[var(--color-text-muted)] text-sm mt-1">{orders.length} pedidos</p>
      </div>

      {/* Filtro */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('')}
          className={`px-3 py-1.5 text-sm rounded-md border ${
            filter === ''
              ? 'bg-[var(--color-primary)]/15 text-[var(--color-primary)] border-[var(--color-primary)]/40'
              : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
          }`}
        >
          Todos
        </button>
        {STATUSES.map((s) => (
          <button
            key={s.value}
            onClick={() => setFilter(s.value)}
            className={`px-3 py-1.5 text-sm rounded-md border ${
              filter === s.value
                ? 'bg-[var(--color-primary)]/15 text-[var(--color-primary)] border-[var(--color-primary)]/40'
                : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-[var(--color-text-muted)] bg-[var(--color-surface-2)] border-b border-[var(--color-border)]">
                <th className="px-4 py-3">Pedido</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface-2)]/50">
                  <td className="px-4 py-3 font-mono text-[var(--color-primary)]">{o.order_number}</td>
                  <td className="px-4 py-3">
                    <p>{o.user?.name || '—'}</p>
                    <p className="text-xs text-[var(--color-text-dim)]">{o.user?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-[var(--color-text-muted)] text-xs">{formatDateTime(o.created_at)}</td>
                  <td className="px-4 py-3 font-medium">{formatPrice(o.total)}</td>
                  <td className="px-4 py-3">
                    <select
                      value={o.status}
                      onChange={(e) => updateStatus.mutate({ number: o.order_number, status: e.target.value })}
                      className="px-2 py-1 rounded bg-[var(--color-bg)] border border-[var(--color-border)] text-xs focus:outline-none focus:border-[var(--color-primary)]"
                    >
                      {STATUSES.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-[var(--color-text-muted)]">No hay pedidos</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

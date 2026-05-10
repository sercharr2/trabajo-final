/** Formatea un número como moneda EUR. */
export function formatPrice(value) {
  if (value === null || value === undefined) return '—'
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(Number(value))
}

/** Formatea una fecha ISO en formato corto español. */
export function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('es-ES', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

/** Formatea fecha + hora. */
export function formatDateTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleString('es-ES', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

/** Trunca texto a n caracteres añadiendo … */
export function truncate(text, n = 100) {
  if (!text) return ''
  return text.length <= n ? text : text.slice(0, n - 1) + '…'
}

/** Une clases condicionalmente (similar a `clsx`). */
export function cn(...args) {
  return args.filter(Boolean).join(' ')
}

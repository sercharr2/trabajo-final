import { cn } from '../../utils/format'

/**
 * Botón reutilizable con variantes de estilo.
 * Variantes: primary | secondary | ghost | danger | outline
 * Tamaños:   sm | md | lg
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  children,
  disabled,
  ...props
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all ' +
    'disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none ' +
    'focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 ' +
    'focus-visible:ring-offset-[var(--color-bg)]'

  const variants = {
    primary:
      'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] ' +
      'shadow-lg shadow-[var(--color-primary)]/20',
    secondary:
      'bg-[var(--color-surface-2)] text-[var(--color-text)] border border-[var(--color-border)] ' +
      'hover:border-[var(--color-border-hover)] hover:bg-[var(--color-surface)]',
    outline:
      'bg-transparent text-[var(--color-primary)] border border-[var(--color-primary)] ' +
      'hover:bg-[var(--color-primary)]/10',
    ghost:
      'bg-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)] ' +
      'hover:bg-[var(--color-surface-2)]',
    danger:
      'bg-[var(--color-danger)] text-white hover:bg-red-600',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  )
}

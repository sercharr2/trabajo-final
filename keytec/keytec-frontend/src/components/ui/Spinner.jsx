import { cn } from '../../utils/format'

export default function Spinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' }
  return (
    <span
      role="status"
      aria-label="Cargando"
      className={cn(
        'inline-block border-2 border-[var(--color-primary)] border-t-transparent',
        'rounded-full animate-spin',
        sizes[size],
        className
      )}
    />
  )
}

export function FullPageSpinner() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  )
}

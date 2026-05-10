import { forwardRef } from 'react'
import { cn } from '../../utils/format'

const Input = forwardRef(function Input(
  { label, error, className = '', containerClassName = '', ...props },
  ref
) {
  return (
    <label className={cn('block', containerClassName)}>
      {label && (
        <span className="block mb-1.5 text-sm font-medium text-[var(--color-text)]">
          {label}
        </span>
      )}
      <input
        ref={ref}
        className={cn(
          'w-full px-3 py-2 rounded-lg bg-[var(--color-surface)]',
          'text-[var(--color-text)] placeholder:text-[var(--color-text-dim)]',
          'border border-[var(--color-border)] hover:border-[var(--color-border-hover)]',
          'focus:outline-none focus:border-[var(--color-primary)]',
          'focus:ring-2 focus:ring-[var(--color-primary)]/30 transition-colors',
          error && 'border-[var(--color-danger)] focus:border-[var(--color-danger)]',
          className
        )}
        {...props}
      />
      {error && (
        <span className="block mt-1 text-xs text-[var(--color-danger)]">{error}</span>
      )}
    </label>
  )
})

export default Input

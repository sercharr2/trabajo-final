import { Link } from 'react-router-dom'
import { Star, Palette } from 'lucide-react'
import { formatPrice } from '../utils/format'

/**
 * Tarjeta de producto. Recibe el objeto producto serializado por la API.
 */
export default function ProductCard({ product }) {
  if (!product) return null
  const onSale = product.sale_price && product.sale_price < product.price
  const outOfStock = product.stock <= 0

  return (
    <Link
      to={`/productos/${product.slug}`}
      className="group bg-[var(--color-surface)] border border-[var(--color-border)]
        rounded-2xl overflow-hidden transition-all
        hover:border-[var(--color-primary)]/60 hover:-translate-y-0.5
        hover:shadow-xl hover:shadow-[var(--color-primary)]/10"
    >
      {/* Imagen */}
      <div className="relative aspect-[4/3] bg-[var(--color-surface-2)] overflow-hidden">
        {product.primary_image_url ? (
          <img
            src={product.primary_image_url}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[var(--color-text-dim)] text-sm">
            sin imagen
          </div>
        )}
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1.5">
          {onSale && (
            <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase
              bg-[var(--color-danger)] text-white rounded">
              Oferta
            </span>
          )}
          {product.is_customizable && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider
              bg-[var(--color-accent)]/20 text-[var(--color-accent)] border border-[var(--color-accent)]/40 rounded">
              <Palette size={10} /> Custom
            </span>
          )}
        </div>
        {outOfStock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="px-3 py-1 bg-[var(--color-surface)] text-[var(--color-danger)] text-xs font-bold rounded">
              Sin stock
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        {product.category && (
          <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-dim)] mb-1">
            {product.category.name}
          </p>
        )}
        <h3 className="font-medium text-[var(--color-text)] line-clamp-1 group-hover:text-[var(--color-primary)] transition-colors">
          {product.name}
        </h3>
        {product.short_description && (
          <p className="text-xs text-[var(--color-text-muted)] mt-1 line-clamp-2 min-h-[2rem]">
            {product.short_description}
          </p>
        )}

        <div className="flex items-end justify-between mt-3">
          <div>
            {onSale ? (
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-[var(--color-primary)]">
                  {formatPrice(product.sale_price)}
                </span>
                <span className="text-xs text-[var(--color-text-dim)] line-through">
                  {formatPrice(product.price)}
                </span>
              </div>
            ) : (
              <span className="text-lg font-bold text-[var(--color-text)]">
                {formatPrice(product.current_price ?? product.price)}
              </span>
            )}
          </div>
          {product.avg_rating > 0 && (
            <div className="flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
              <Star size={12} className="fill-[var(--color-warning)] text-[var(--color-warning)]" />
              <span>{product.avg_rating}</span>
              {product.review_count > 0 && (
                <span className="text-[var(--color-text-dim)]">({product.review_count})</span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

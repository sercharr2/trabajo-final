import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Star, ShoppingCart, Palette, Truck, ShieldCheck,
  ChevronLeft, Minus, Plus,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { productsApi } from '../api/products'
import { cartApi } from '../api/cart'
import { useAuthStore } from '../store/auth'
import Button from '../components/ui/Button'
import Spinner from '../components/ui/Spinner'
import { formatPrice, formatDate } from '../utils/format'

export default function ProductDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const token = useAuthStore((s) => s.token)

  const [imageIdx, setImageIdx] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState('description')

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => productsApi.get(slug),
    enabled: !!slug,
  })

  const { data: reviews } = useQuery({
    queryKey: ['product-reviews', slug],
    queryFn: () => productsApi.reviews(slug),
    enabled: !!slug,
  })

  const addToCartMutation = useMutation({
    mutationFn: (payload) => cartApi.add(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      toast.success('Añadido al carrito')
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'No se pudo añadir')
    },
  })

  const handleAddToCart = () => {
    if (!token) {
      toast('Inicia sesión para comprar', { icon: '🔒' })
      navigate('/login', { state: { from: `/productos/${slug}` } })
      return
    }
    addToCartMutation.mutate({ product_id: product.id, quantity })
  }

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>
  if (error || !product) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center px-4">
        <p className="text-lg mb-3">Producto no encontrado</p>
        <Link to="/productos" className="text-[var(--color-primary)] hover:underline">Volver a la tienda</Link>
      </div>
    )
  }

  const onSale = product.sale_price && product.sale_price < product.price
  const images = product.images?.length ? product.images : [{ url: product.primary_image_url }]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] mb-6">
        <Link to="/productos" className="hover:text-[var(--color-primary)] flex items-center gap-1">
          <ChevronLeft size={14} /> Tienda
        </Link>
        {product.category && (
          <>
            <span>/</span>
            <Link to={`/productos?category=${product.category.slug}`} className="hover:text-[var(--color-primary)]">
              {product.category.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-[var(--color-text)]">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Galería */}
        <div>
          <div className="aspect-square rounded-2xl overflow-hidden bg-[var(--color-surface)] border border-[var(--color-border)]">
            {images[imageIdx]?.url ? (
              <img src={images[imageIdx].url} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[var(--color-text-dim)]">
                Sin imagen disponible
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 mt-3">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setImageIdx(i)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors
                    ${i === imageIdx ? 'border-[var(--color-primary)]' : 'border-[var(--color-border)]'}`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {product.category && (
            <p className="text-xs uppercase tracking-wider text-[var(--color-text-dim)] mb-2">
              {product.category.name}
            </p>
          )}
          <h1 className="text-3xl md:text-4xl font-bold leading-tight">{product.name}</h1>

          {/* Rating */}
          {product.avg_rating > 0 && (
            <div className="flex items-center gap-2 mt-3">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i} size={16}
                    className={i < Math.round(product.avg_rating)
                      ? 'fill-[var(--color-warning)] text-[var(--color-warning)]'
                      : 'text-[var(--color-text-dim)]'}
                  />
                ))}
              </div>
              <span className="text-sm text-[var(--color-text-muted)]">
                {product.avg_rating} ({product.review_count} reseñas)
              </span>
            </div>
          )}

          {/* Precio */}
          <div className="mt-5 flex items-baseline gap-3">
            <span className="text-4xl font-bold text-[var(--color-primary)]">
              {formatPrice(product.current_price ?? product.price)}
            </span>
            {onSale && (
              <span className="text-lg text-[var(--color-text-dim)] line-through">
                {formatPrice(product.price)}
              </span>
            )}
            {onSale && (
              <span className="px-2 py-0.5 text-xs font-bold uppercase rounded bg-[var(--color-danger)] text-white">
                -{Math.round((1 - product.sale_price / product.price) * 100)}%
              </span>
            )}
          </div>

          {/* Stock */}
          <p className={`mt-3 text-sm ${product.stock > 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}`}>
            {product.stock > 0 ? `✓ En stock (${product.stock} disponibles)` : '✗ Agotado'}
          </p>

          {/* Descripción corta */}
          {product.short_description && (
            <p className="mt-5 text-[var(--color-text-muted)]">{product.short_description}</p>
          )}

          {/* Cantidad + acciones */}
          {product.stock > 0 && (
            <div className="mt-6 flex flex-wrap gap-3 items-center">
              <div className="flex items-center bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="p-3 hover:bg-[var(--color-surface-2)] rounded-l-lg"
                  aria-label="Reducir"
                >
                  <Minus size={14} />
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                  className="p-3 hover:bg-[var(--color-surface-2)] rounded-r-lg"
                  aria-label="Aumentar"
                >
                  <Plus size={14} />
                </button>
              </div>
              <Button size="lg" onClick={handleAddToCart} loading={addToCartMutation.isPending}>
                <ShoppingCart size={16} /> Añadir al carrito
              </Button>
              {product.is_customizable && (
                <Link to="/personalizar">
                  <Button size="lg" variant="outline">
                    <Palette size={16} /> Personalizar
                  </Button>
                </Link>
              )}
            </div>
          )}

          {/* Trust badges */}
          <div className="mt-8 grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2 p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg">
              <Truck size={16} className="text-[var(--color-primary)]" />
              <span className="text-[var(--color-text-muted)]">Envío gratis &gt; 80€</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg">
              <ShieldCheck size={16} className="text-[var(--color-primary)]" />
              <span className="text-[var(--color-text-muted)]">Garantía 2 años</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-12">
        <div className="border-b border-[var(--color-border)] flex gap-1 overflow-x-auto">
          <TabButton active={activeTab === 'description'} onClick={() => setActiveTab('description')}>
            Descripción
          </TabButton>
          {product.attributes?.length > 0 && (
            <TabButton active={activeTab === 'specs'} onClick={() => setActiveTab('specs')}>
              Especificaciones
            </TabButton>
          )}
          <TabButton active={activeTab === 'reviews'} onClick={() => setActiveTab('reviews')}>
            Reseñas ({reviews?.length ?? 0})
          </TabButton>
        </div>

        <div className="py-6">
          {activeTab === 'description' && (
            <div className="prose prose-invert max-w-none text-[var(--color-text-muted)] whitespace-pre-line">
              {product.description || 'Este producto no tiene descripción extendida.'}
            </div>
          )}
          {activeTab === 'specs' && (
            <table className="w-full max-w-2xl">
              <tbody>
                {product.attributes?.map((attr) => (
                  <tr key={attr.id} className="border-b border-[var(--color-border)]">
                    <td className="py-3 pr-4 font-medium text-[var(--color-text)] w-1/3">{attr.name}</td>
                    <td className="py-3 text-[var(--color-text-muted)]">{attr.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {activeTab === 'reviews' && (
            <div className="space-y-4 max-w-3xl">
              {reviews?.length === 0 && (
                <p className="text-[var(--color-text-muted)]">Aún no hay reseñas. ¡Sé el primero!</p>
              )}
              {reviews?.map((r) => (
                <div key={r.id} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{r.user?.name || 'Usuario'}</span>
                    <span className="text-xs text-[var(--color-text-dim)]">{formatDate(r.created_at)}</span>
                  </div>
                  <div className="flex mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i} size={14}
                        className={i < r.rating
                          ? 'fill-[var(--color-warning)] text-[var(--color-warning)]'
                          : 'text-[var(--color-text-dim)]'}
                      />
                    ))}
                  </div>
                  {r.comment && <p className="text-sm text-[var(--color-text-muted)]">{r.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function TabButton({ active, children, ...props }) {
  return (
    <button
      {...props}
      className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors
        ${active
          ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
          : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}`}
    >
      {children}
    </button>
  )
}

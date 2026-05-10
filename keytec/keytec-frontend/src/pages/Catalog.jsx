import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Filter, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { productsApi } from '../api/products'
import { categoriesApi } from '../api/categories'
import ProductCard from '../components/ProductCard'
import Button from '../components/ui/Button'
import Spinner from '../components/ui/Spinner'

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [showFilters, setShowFilters] = useState(false)

  // Estado local de los filtros, sincronizado con la URL
  const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '')
  const [inStock, setInStock]   = useState(searchParams.get('in_stock') === '1')

  const filters = useMemo(() => {
    const obj = {}
    for (const [k, v] of searchParams) obj[k] = v
    if (!obj.page) obj.page = 1
    if (!obj.sort) obj.sort = 'newest'
    return obj
  }, [searchParams])

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['products', filters],
    queryFn: () => productsApi.list(filters),
    keepPreviousData: true,
  })
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.list,
  })

  // Reset de la página cuando cambian los filtros
  useEffect(() => {
    if (searchParams.get('page') && searchParams.get('page') !== '1') {
      // ok, the page was set by user navigation; nothing to do
    }
  }, [searchParams])

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams)
    if (value === '' || value === null || value === undefined || value === false) {
      next.delete(key)
    } else {
      next.set(key, value)
    }
    if (key !== 'page') next.delete('page')
    setSearchParams(next)
  }

  const applyPriceFilter = () => {
    const next = new URLSearchParams(searchParams)
    if (minPrice) next.set('min_price', minPrice); else next.delete('min_price')
    if (maxPrice) next.set('max_price', maxPrice); else next.delete('max_price')
    next.delete('page')
    setSearchParams(next)
  }

  const clearAll = () => {
    setMinPrice(''); setMaxPrice(''); setInStock(false)
    setSearchParams({})
  }

  const products = data?.data ?? []
  const meta = data?.meta || { current_page: 1, last_page: 1, total: 0 }

  // Categorías raíz
  const rootCategories = (categories ?? []).filter(c => !c.parent_id)
  const activeCategory = filters.category

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="flex items-baseline justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-semibold">Tienda</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            {meta.total} productos
            {filters.search && <> · resultados para "<span className="text-[var(--color-text)]">{filters.search}</span>"</>}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setShowFilters(o => !o)} className="lg:hidden">
          <Filter size={14} /> Filtros
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
        {/* Sidebar de filtros */}
        <aside className={`${showFilters ? 'block' : 'hidden'} lg:block space-y-6`}>
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-sm">Categorías</h3>
              {Object.keys(filters).filter(k => !['page','sort'].includes(k)).length > 0 && (
                <button onClick={clearAll} className="text-xs text-[var(--color-primary)] hover:underline">
                  Limpiar
                </button>
              )}
            </div>
            <ul className="space-y-1">
              <li>
                <button
                  onClick={() => updateParam('category', '')}
                  className={`w-full text-left px-2 py-1.5 rounded text-sm transition-colors
                    ${!activeCategory
                      ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                      : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}`}
                >
                  Todos
                </button>
              </li>
              {rootCategories.map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => updateParam('category', cat.slug)}
                    className={`w-full text-left px-2 py-1.5 rounded text-sm transition-colors
                      ${activeCategory === cat.slug
                        ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                        : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}`}
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5">
            <h3 className="font-medium text-sm mb-3">Precio</h3>
            <div className="flex gap-2 mb-2">
              <input
                type="number"
                placeholder="Mín"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full px-2.5 py-1.5 text-sm rounded bg-[var(--color-bg)] border border-[var(--color-border)] focus:outline-none focus:border-[var(--color-primary)]"
              />
              <input
                type="number"
                placeholder="Máx"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full px-2.5 py-1.5 text-sm rounded bg-[var(--color-bg)] border border-[var(--color-border)] focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>
            <Button size="sm" variant="secondary" className="w-full" onClick={applyPriceFilter}>
              Aplicar
            </Button>
          </div>

          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={inStock}
                onChange={(e) => {
                  setInStock(e.target.checked)
                  updateParam('in_stock', e.target.checked ? '1' : '')
                }}
                className="w-4 h-4 rounded accent-[var(--color-primary)]"
              />
              <span>Solo en stock</span>
            </label>
          </div>
        </aside>

        {/* Grid de productos */}
        <div>
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex flex-wrap gap-2">
              {filters.category && (
                <FilterChip label={`Categoría: ${filters.category}`} onClear={() => updateParam('category', '')} />
              )}
              {filters.search && (
                <FilterChip label={`Búsqueda: ${filters.search}`} onClear={() => updateParam('search', '')} />
              )}
              {filters.min_price && (
                <FilterChip label={`Desde ${filters.min_price}€`} onClear={() => { setMinPrice(''); updateParam('min_price', '') }} />
              )}
              {filters.max_price && (
                <FilterChip label={`Hasta ${filters.max_price}€`} onClear={() => { setMaxPrice(''); updateParam('max_price', '') }} />
              )}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-[var(--color-text-muted)]">Ordenar:</span>
              <select
                value={filters.sort}
                onChange={(e) => updateParam('sort', e.target.value)}
                className="px-2 py-1.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded focus:outline-none focus:border-[var(--color-primary)]"
              >
                <option value="newest">Más nuevos</option>
                <option value="price_asc">Precio (asc)</option>
                <option value="price_desc">Precio (desc)</option>
                <option value="popular">Populares</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20"><Spinner size="lg" /></div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 text-[var(--color-text-muted)]">
              <p className="text-lg mb-2">No hay productos con esos criterios</p>
              <button onClick={clearAll} className="text-[var(--color-primary)] hover:underline text-sm">
                Limpiar filtros
              </button>
            </div>
          ) : (
            <>
              <div className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 transition-opacity ${isFetching ? 'opacity-60' : ''}`}>
                {products.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>

              {/* Paginación */}
              {meta.last_page > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <Button
                    variant="secondary" size="sm"
                    disabled={meta.current_page === 1}
                    onClick={() => updateParam('page', meta.current_page - 1)}
                  >
                    <ChevronLeft size={14} /> Anterior
                  </Button>
                  <span className="text-sm text-[var(--color-text-muted)] px-3">
                    Página {meta.current_page} de {meta.last_page}
                  </span>
                  <Button
                    variant="secondary" size="sm"
                    disabled={meta.current_page === meta.last_page}
                    onClick={() => updateParam('page', meta.current_page + 1)}
                  >
                    Siguiente <ChevronRight size={14} />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function FilterChip({ label, onClear }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full
      bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/30">
      {label}
      <button onClick={onClear} className="hover:bg-[var(--color-primary)]/20 rounded-full p-0.5">
        <X size={12} />
      </button>
    </span>
  )
}

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit, Trash2, X, Search, Image as ImageIcon, Upload, Star } from 'lucide-react'
import toast from 'react-hot-toast'
import { adminApi } from '../../api/admin'
import { categoriesApi } from '../../api/categories'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Spinner from '../../components/ui/Spinner'
import { formatPrice } from '../../utils/format'

export default function AdminProducts() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(null) // null | {} (nuevo) | product

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'products', { search }],
    queryFn: () => adminApi.listProducts({ search, per_page: 50 }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => adminApi.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] })
      toast.success('Producto eliminado')
    },
    onError: () => toast.error('No se pudo eliminar'),
  })

  const products = data?.data ?? []

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold">Productos</h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-1">{products.length} productos</p>
        </div>
        <Button onClick={() => setEditing({})}>
          <Plus size={16} /> Nuevo producto
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-dim)]" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar productos..."
          className="w-full pl-9 pr-3 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] focus:outline-none focus:border-[var(--color-primary)]"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-[var(--color-text-muted)] bg-[var(--color-surface-2)] border-b border-[var(--color-border)]">
                <th className="px-4 py-3">Producto</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3">Precio</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface-2)]/50">
                  <td className="px-4 py-3">
                    <p className="font-medium">{p.name}</p>
                    <p className="text-xs text-[var(--color-text-dim)] font-mono">{p.sku}</p>
                  </td>
                  <td className="px-4 py-3 text-[var(--color-text-muted)]">{p.category?.name || '—'}</td>
                  <td className="px-4 py-3 font-medium">{formatPrice(p.price)}</td>
                  <td className="px-4 py-3">
                    <span className={p.stock > 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {p.is_active ? (
                      <span className="px-2 py-0.5 text-[10px] rounded bg-[var(--color-success)]/10 text-[var(--color-success)]">
                        Activo
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[10px] rounded bg-[var(--color-text-dim)]/10 text-[var(--color-text-dim)]">
                        Inactivo
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setEditing(p)}
                      className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
                      aria-label="Editar"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`¿Eliminar "${p.name}"?`)) deleteMutation.mutate(p.id)
                      }}
                      className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-danger)]"
                      aria-label="Eliminar"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-[var(--color-text-muted)]">No hay productos</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <ProductFormModal
          product={editing.id ? editing : null}
          onClose={() => setEditing(null)}
          onSaved={() => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'products'] })
          }}
        />
      )}
    </div>
  )
}

// ─── Modal con tabs: Datos | Imágenes ─────────────────────────────────
function ProductFormModal({ product, onClose, onSaved }) {
  const isEditing = !!product
  const [tab, setTab] = useState('data')
  const [currentProduct, setCurrentProduct] = useState(product)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 space-y-4"
      >
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">{isEditing ? 'Editar producto' : 'Nuevo producto'}</h2>
          <button type="button" onClick={onClose} className="p-1 hover:bg-[var(--color-surface-2)] rounded">
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-[var(--color-border)]">
          <button
            type="button"
            onClick={() => setTab('data')}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === 'data'
                ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            Datos
          </button>
          <button
            type="button"
            onClick={() => setTab('images')}
            disabled={!currentProduct?.id}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
              tab === 'images'
                ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
            title={!currentProduct?.id ? 'Guarda el producto primero' : ''}
          >
            <ImageIcon size={14} className="inline mr-1" />
            Imágenes {currentProduct?.images && `(${currentProduct.images.length})`}
          </button>
        </div>

        {tab === 'data' && (
          <DataForm
            product={currentProduct}
            onSaved={(saved) => {
              setCurrentProduct(saved)
              onSaved?.()
              if (!isEditing) setTab('images') // tras crear nuevo, salta a imagenes
            }}
            onClose={onClose}
          />
        )}

        {tab === 'images' && currentProduct?.id && (
          <ImagesPanel
            product={currentProduct}
            onChange={(p) => { setCurrentProduct(p); onSaved?.() }}
          />
        )}
      </div>
    </div>
  )
}

// ─── Pestaña: datos del producto ──────────────────────────────────────
function DataForm({ product, onSaved, onClose }) {
  const isEditing = !!product
  const [form, setForm] = useState({
    name: product?.name || '',
    short_description: product?.short_description || '',
    description: product?.description || '',
    price: product?.price ?? '',
    sale_price: product?.sale_price ?? '',
    stock: product?.stock ?? 0,
    sku: product?.sku || '',
    category_id: product?.category_id || product?.category?.id || '',
    is_active: product?.is_active ?? true,
    is_featured: product?.is_featured ?? false,
    is_customizable: product?.is_customizable ?? false,
  })
  const [errors, setErrors] = useState({})

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.list,
  })

  const saveMutation = useMutation({
    mutationFn: (payload) => isEditing
      ? adminApi.updateProduct(product.id, payload)
      : adminApi.createProduct(payload),
    onSuccess: (saved) => {
      toast.success(isEditing ? 'Producto actualizado' : 'Producto creado')
      onSaved?.(saved)
    },
    onError: (err) => {
      const data = err?.response?.data
      if (data?.errors) setErrors(data.errors)
      toast.error(data?.message || 'No se pudo guardar')
    },
  })

  const submit = (e) => {
    e.preventDefault()
    setErrors({})
    saveMutation.mutate({
      ...form,
      price: parseFloat(form.price) || 0,
      sale_price: form.sale_price ? parseFloat(form.sale_price) : null,
      stock: parseInt(form.stock) || 0,
      category_id: form.category_id ? parseInt(form.category_id) : null,
    })
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Nombre" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={errors.name?.[0]} containerClassName="md:col-span-2" />
        <Input label="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} error={errors.sku?.[0]} />
        <div>
          <label className="block mb-1.5 text-sm font-medium">Categoría</label>
          <select
            value={form.category_id}
            onChange={(e) => setForm({ ...form, category_id: e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] focus:outline-none focus:border-[var(--color-primary)]"
          >
            <option value="">— sin categoría —</option>
            {(categories ?? []).map((c) => (
              <option key={c.id} value={c.id}>{c.parent_id ? '— ' : ''}{c.name}</option>
            ))}
          </select>
        </div>
        <Input label="Precio (€)" type="number" step="0.01" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} error={errors.price?.[0]} />
        <Input label="Precio oferta (€)" type="number" step="0.01" value={form.sale_price ?? ''} onChange={(e) => setForm({ ...form, sale_price: e.target.value })} error={errors.sale_price?.[0]} />
        <Input label="Stock" type="number" required value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} error={errors.stock?.[0]} />
        <Input label="Descripción corta" value={form.short_description} onChange={(e) => setForm({ ...form, short_description: e.target.value })} error={errors.short_description?.[0]} containerClassName="md:col-span-2" />
        <div className="md:col-span-2">
          <label className="block mb-1.5 text-sm font-medium">Descripción completa</label>
          <textarea
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] focus:outline-none focus:border-[var(--color-primary)]"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-sm">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4 accent-[var(--color-primary)]" />
          Activo
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} className="w-4 h-4 accent-[var(--color-primary)]" />
          Destacado
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.is_customizable} onChange={(e) => setForm({ ...form, is_customizable: e.target.checked })} className="w-4 h-4 accent-[var(--color-primary)]" />
          Personalizable
        </label>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
        <Button type="button" variant="ghost" onClick={onClose}>Cerrar</Button>
        <Button type="submit" loading={saveMutation.isPending}>
          {isEditing ? 'Guardar cambios' : 'Crear y subir imágenes'}
        </Button>
      </div>
    </form>
  )
}

// ─── Pestaña: imágenes del producto ───────────────────────────────────
function ImagesPanel({ product, onChange }) {
  const queryClient = useQueryClient()
  const [uploading, setUploading] = useState(false)
  const [isPrimary, setIsPrimary] = useState(false)

  const refresh = async () => {
    const fresh = await adminApi.getProduct(product.id)
    onChange?.(fresh)
    queryClient.invalidateQueries({ queryKey: ['admin', 'products'] })
  }

  const handleFiles = async (files) => {
    if (!files?.length) return
    setUploading(true)
    try {
      for (const file of files) {
        const fd = new FormData()
        fd.append('image', file)
        if (isPrimary) fd.append('is_primary', '1')
        await adminApi.uploadImage(product.id, fd)
      }
      toast.success(`${files.length} imagen(es) subida(s)`)
      await refresh()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error al subir')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (img) => {
    if (!confirm('¿Eliminar esta imagen?')) return
    try {
      await adminApi.deleteImage(product.id, img.id)
      toast.success('Imagen eliminada')
      await refresh()
    } catch {
      toast.error('No se pudo eliminar')
    }
  }

  const images = product.images || []

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <label className="block">
        <div
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors
            ${uploading
              ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
              : 'border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-surface-2)]'}`}
        >
          {uploading ? (
            <>
              <Spinner className="mx-auto mb-2" />
              <p className="text-sm text-[var(--color-text-muted)]">Subiendo imágenes...</p>
            </>
          ) : (
            <>
              <Upload size={32} className="mx-auto mb-2 text-[var(--color-primary)]" />
              <p className="text-sm font-medium">Haz clic o arrastra para subir imágenes</p>
              <p className="text-xs text-[var(--color-text-dim)] mt-1">JPG, PNG, WebP - Máx 4 MB</p>
            </>
          )}
        </div>
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          disabled={uploading}
          onChange={(e) => handleFiles(Array.from(e.target.files || []))}
        />
      </label>

      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={isPrimary}
          onChange={(e) => setIsPrimary(e.target.checked)}
          className="w-4 h-4 accent-[var(--color-primary)]"
        />
        Marcar la próxima subida como imagen principal
      </label>

      {/* Galería de imágenes existentes */}
      {images.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-2">Imágenes actuales ({images.length})</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {images.map((img) => (
              <div key={img.id} className="relative group rounded-lg overflow-hidden bg-[var(--color-surface-2)] border border-[var(--color-border)]">
                <img src={img.url} alt={img.alt_text || ''} className="w-full h-32 object-cover" />
                {img.is_primary && (
                  <span className="absolute top-1 left-1 px-1.5 py-0.5 text-[10px] rounded bg-[var(--color-warning)]/90 text-black font-bold flex items-center gap-1">
                    <Star size={10} className="fill-current" /> Principal
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(img)}
                  className="absolute top-1 right-1 p-1 rounded bg-[var(--color-danger)]/90 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Eliminar imagen"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

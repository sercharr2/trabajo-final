import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Palette, Edit, Trash2, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import { designsApi } from '../../api/designs'
import Spinner from '../../components/ui/Spinner'
import Button from '../../components/ui/Button'
import { formatDate } from '../../utils/format'

export default function Designs() {
  const queryClient = useQueryClient()
  const { data: designs, isLoading } = useQuery({
    queryKey: ['designs'],
    queryFn: designsApi.list,
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => designsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['designs'] })
      toast.success('Diseño eliminado')
    },
  })

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Mis diseños guardados</h2>
        <Link to="/personalizar">
          <Button size="sm"><Plus size={14} /> Nuevo diseño</Button>
        </Link>
      </div>

      {!designs?.length ? (
        <div className="text-center py-16 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl">
          <Palette className="mx-auto text-[var(--color-text-dim)] mb-3" size={36} />
          <p className="text-lg mb-2">No tienes diseños guardados</p>
          <Link to="/personalizar" className="text-sm text-[var(--color-primary)] hover:underline">
            Crear tu primer diseño
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {designs.map((design) => (
            <div
              key={design.id}
              className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5"
            >
              {/* Preview con muestra de colores */}
              <div
                className="h-24 rounded-lg mb-4 p-3 flex flex-wrap gap-1"
                style={{ background: design.base_color }}
              >
                {design.keys?.slice(0, 24).map((k) => (
                  <div
                    key={k.id}
                    className="w-6 h-6 rounded-sm border border-white/10"
                    style={{ background: k.color }}
                    title={k.label || k.key_code}
                  />
                ))}
              </div>
              <h3 className="font-medium">{design.name}</h3>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">
                {design.layout} · {design.keys?.length || 0} teclas · {formatDate(design.created_at)}
              </p>
              {design.is_public && (
                <span className="inline-block mt-2 px-2 py-0.5 text-[10px] uppercase tracking-wider rounded bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
                  Público
                </span>
              )}
              <div className="flex gap-2 mt-4">
                <Link to={`/personalizar/${design.id}`} className="flex-1">
                  <Button variant="secondary" size="sm" className="w-full">
                    <Edit size={12} /> Editar
                  </Button>
                </Link>
                <button
                  onClick={() => {
                    if (confirm(`¿Eliminar el diseño "${design.name}"?`)) {
                      deleteMutation.mutate(design.id)
                    }
                  }}
                  className="px-3 py-1.5 rounded-md text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 text-sm"
                  aria-label="Eliminar"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

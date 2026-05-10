import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Save, Trash2, Palette, Type, Eye, EyeOff, RotateCcw, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import { LAYOUTS, PRESET_PALETTES, FONT_OPTIONS } from '../utils/keyboardLayouts'
import { designsApi } from '../api/designs'
import { useAuthStore } from '../store/auth'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Spinner from '../components/ui/Spinner'
import KeyboardCanvas3D from '../components/KeyboardCanvas3D'

export default function KeycapDesigner() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const token = useAuthStore((s) => s.token)

  const [layoutKey, setLayoutKey] = useState('TKL')
  const [baseColor, setBaseColor] = useState('#1a1a26')
  const [keyColors, setKeyColors] = useState({})
  const [selectedKey, setSelectedKey] = useState(null)
  const [name, setName] = useState('Mi diseño')
  const [isPublic, setIsPublic] = useState(false)
  const [showLabels, setShowLabels] = useState(true)

  const layout = LAYOUTS[layoutKey]

  // Cargar diseño existente si hay :id
  const { data: existingDesign, isLoading: loadingDesign } = useQuery({
    queryKey: ['design', id],
    queryFn: () => designsApi.get(id),
    enabled: !!id && !!token,
  })

  useEffect(() => {
    if (existingDesign) {
      setName(existingDesign.name)
      setLayoutKey(existingDesign.layout)
      setBaseColor(existingDesign.base_color)
      setIsPublic(!!existingDesign.is_public)
      const map = {}
      existingDesign.keys?.forEach((k) => {
        map[k.key_code] = {
          color: k.color,
          text_color: k.text_color,
          label: k.label,
          font: k.font,
        }
      })
      setKeyColors(map)
    }
  }, [existingDesign])

  const setKeyAttribute = (code, attr, value) => {
    setKeyColors((prev) => ({
      ...prev,
      [code]: { ...(prev[code] || {}), [attr]: value },
    }))
  }

  const applyPaletteRandom = (palette) => {
    setBaseColor(palette[0])
    const next = {}
    layout.forEach((k) => {
      next[k.code] = {
        ...(keyColors[k.code] || {}),
        color: palette[1 + Math.floor(Math.random() * (palette.length - 1))],
        text_color: palette[0],
      }
    })
    setKeyColors(next)
  }

  const resetDesign = () => {
    setKeyColors({})
    setBaseColor('#1a1a26')
    setSelectedKey(null)
  }

  const saveMutation = useMutation({
    mutationFn: (payload) => id
      ? designsApi.update(id, payload)
      : designsApi.create(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['designs'] })
      toast.success(id ? 'Diseño actualizado' : 'Diseño guardado')
      if (!id) navigate(`/personalizar/${data.id}`, { replace: true })
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'No se pudo guardar')
    },
  })

  const handleSave = () => {
    if (!token) {
      toast('Inicia sesión para guardar tus diseños', { icon: '🔒' })
      navigate('/login', { state: { from: '/personalizar' } })
      return
    }
    const keys = Object.entries(keyColors)
      .filter(([, v]) => v?.color)
      .map(([code, v]) => ({
        key_code: code,
        color: v.color,
        text_color: v.text_color || '#ffffff',
        label: v.label || null,
        font: v.font || null,
      }))
    saveMutation.mutate({
      name, layout: layoutKey, base_color: baseColor, is_public: isPublic, keys,
    })
  }

  const selectedConfig = selectedKey ? keyColors[selectedKey] : null
  const selectedKeyData = selectedKey ? layout.find((k) => k.code === selectedKey) : null

  if (id && loadingDesign) {
    return <div className="flex justify-center py-20"><Spinner size="lg" /></div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="flex items-baseline justify-between flex-wrap gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-semibold flex items-center gap-2">
            <Palette className="text-[var(--color-primary)]" /> Personalizador 3D
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Haz click en una tecla para personalizarla. Arrastra para rotar la vista.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => setShowLabels((s) => !s)}>
            {showLabels ? <EyeOff size={14} /> : <Eye size={14} />}
            {showLabels ? 'Ocultar texto' : 'Mostrar texto'}
          </Button>
          <Button variant="secondary" size="sm" onClick={resetDesign}>
            <RotateCcw size={14} /> Reset
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Canvas 3D */}
        <div>
          <KeyboardCanvas3D
            layout={layout}
            keyColors={keyColors}
            baseColor={baseColor}
            selectedKey={selectedKey}
            onSelectKey={setSelectedKey}
            showLabels={showLabels}
          />

          <p className="text-xs text-[var(--color-text-dim)] mt-2 text-center">
            🖱️ Arrastrar: rotar · Ctrl + arrastrar: mover · Scroll: zoom · Click en tecla: editar
          </p>

          {/* Paletas */}
          <div className="mt-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={16} className="text-[var(--color-primary)]" />
              <h3 className="font-medium text-sm">Paletas predefinidas</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {PRESET_PALETTES.map((p) => (
                <button
                  key={p.name}
                  onClick={() => applyPaletteRandom(p.colors)}
                  className="flex items-center gap-2 p-2 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors text-left"
                >
                  <div className="flex">
                    {p.colors.map((c, i) => (
                      <div key={i} className="w-4 h-4 rounded" style={{ background: c, marginLeft: i ? -4 : 0 }} />
                    ))}
                  </div>
                  <span className="text-xs">{p.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Panel de control */}
        <aside className="space-y-4 self-start lg:sticky lg:top-20">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 space-y-3">
            <h3 className="font-medium text-sm mb-2">Diseño</h3>
            <Input
              label="Nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <div>
              <label className="block mb-1.5 text-sm font-medium">Layout</label>
              <select
                value={layoutKey}
                onChange={(e) => setLayoutKey(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] focus:outline-none focus:border-[var(--color-primary)]"
              >
                <option value="60%">60%</option>
                <option value="65%">65%</option>
                <option value="TKL">TKL (80%)</option>
                <option value="Full">Full Size</option>
              </select>
            </div>
            <div>
              <label className="block mb-1.5 text-sm font-medium">Color base (placa)</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={baseColor}
                  onChange={(e) => setBaseColor(e.target.value)}
                  className="w-12 h-10 rounded-lg cursor-pointer bg-[var(--color-bg)] border border-[var(--color-border)]"
                />
                <input
                  type="text"
                  value={baseColor}
                  onChange={(e) => setBaseColor(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg font-mono text-sm bg-[var(--color-bg)] border border-[var(--color-border)] focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="w-4 h-4 accent-[var(--color-primary)]"
              />
              <span>Compartir en la galería pública</span>
            </label>
          </div>

          {/* Editor de tecla */}
          {selectedKey && selectedKeyData ? (
            <div className="bg-[var(--color-surface)] border border-[var(--color-primary)]/40 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-sm">
                  Tecla: <span className="text-[var(--color-primary)] font-mono">{selectedKeyData.label}</span>
                </h3>
                <button
                  onClick={() => setSelectedKey(null)}
                  className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                >
                  Cerrar
                </button>
              </div>

              <div>
                <label className="block mb-1 text-xs">Color de la tecla</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={selectedConfig?.color || '#2a2a3a'}
                    onChange={(e) => setKeyAttribute(selectedKey, 'color', e.target.value)}
                    className="w-12 h-10 rounded-lg cursor-pointer bg-[var(--color-bg)] border border-[var(--color-border)]"
                  />
                  <input
                    type="text"
                    value={selectedConfig?.color || '#2a2a3a'}
                    onChange={(e) => setKeyAttribute(selectedKey, 'color', e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg font-mono text-sm bg-[var(--color-bg)] border border-[var(--color-border)]"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 text-xs">Color del texto</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={selectedConfig?.text_color || '#ffffff'}
                    onChange={(e) => setKeyAttribute(selectedKey, 'text_color', e.target.value)}
                    className="w-12 h-10 rounded-lg cursor-pointer bg-[var(--color-bg)] border border-[var(--color-border)]"
                  />
                  <input
                    type="text"
                    value={selectedConfig?.text_color || '#ffffff'}
                    onChange={(e) => setKeyAttribute(selectedKey, 'text_color', e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg font-mono text-sm bg-[var(--color-bg)] border border-[var(--color-border)]"
                  />
                </div>
              </div>

              <Input
                label="Etiqueta (opcional)"
                value={selectedConfig?.label ?? ''}
                onChange={(e) => setKeyAttribute(selectedKey, 'label', e.target.value)}
                placeholder={selectedKeyData.label}
                maxLength={10}
              />

              <div>
                <label className="block mb-1 text-xs flex items-center gap-1"><Type size={12} /> Fuente</label>
                <select
                  value={selectedConfig?.font || 'Inter'}
                  onChange={(e) => setKeyAttribute(selectedKey, 'font', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] focus:outline-none focus:border-[var(--color-primary)]"
                >
                  {FONT_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>

              <button
                onClick={() => {
                  setKeyColors((prev) => {
                    const next = { ...prev }
                    delete next[selectedKey]
                    return next
                  })
                }}
                className="w-full text-xs text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 py-2 rounded-md flex items-center justify-center gap-1"
              >
                <Trash2 size={12} /> Resetear esta tecla
              </button>
            </div>
          ) : (
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 text-center">
              <Palette className="mx-auto text-[var(--color-text-dim)] mb-2" size={28} />
              <p className="text-sm text-[var(--color-text-muted)]">
                Haz click en una tecla del modelo 3D para personalizarla
              </p>
            </div>
          )}

          <Button
            size="lg"
            className="w-full"
            onClick={handleSave}
            loading={saveMutation.isPending}
          >
            <Save size={16} /> {id ? 'Actualizar diseño' : 'Guardar diseño'}
          </Button>
        </aside>
      </div>
    </div>
  )
}

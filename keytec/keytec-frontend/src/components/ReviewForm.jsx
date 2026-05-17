import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Star, Send } from 'lucide-react'
import toast from 'react-hot-toast'
import { productsApi } from '../api/products'
import Button from './ui/Button'
import Input from './ui/Input'

/**
 * Formulario para escribir una resena en un producto.
 * Solo se muestra cuando el usuario esta autenticado.
 */
export default function ReviewForm({ slug, onSubmitted }) {
  const queryClient = useQueryClient()
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [errors, setErrors] = useState({})

  const mutation = useMutation({
    mutationFn: (payload) => productsApi.postReview(slug, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-reviews', slug] })
      queryClient.invalidateQueries({ queryKey: ['product', slug] })
      toast.success('¡Gracias por tu reseña!')
      setRating(0); setTitle(''); setBody(''); setErrors({})
      onSubmitted?.()
    },
    onError: (err) => {
      const data = err?.response?.data
      if (data?.errors) setErrors(data.errors)
      toast.error(data?.message || 'No se pudo publicar la reseña')
    },
  })

  const submit = (e) => {
    e.preventDefault()
    setErrors({})
    if (rating === 0) {
      setErrors({ rating: ['Elige una puntuación de 1 a 5 estrellas'] })
      return
    }
    mutation.mutate({ rating, title: title || null, body: body || null })
  }

  return (
    <form
      onSubmit={submit}
      className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 space-y-4"
    >
      <h3 className="font-medium">Escribe tu reseña</h3>

      {/* Selector de estrellas */}
      <div>
        <label className="block mb-1.5 text-sm font-medium">Puntuación</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(n)}
              className="transition-transform hover:scale-110"
              aria-label={`${n} estrellas`}
            >
              <Star
                size={28}
                className={(hover || rating) >= n
                  ? 'fill-[var(--color-warning)] text-[var(--color-warning)]'
                  : 'text-[var(--color-text-dim)]'}
              />
            </button>
          ))}
        </div>
        {errors.rating && (
          <p className="text-xs text-[var(--color-danger)] mt-1">{errors.rating[0]}</p>
        )}
      </div>

      <Input
        label="Título (opcional)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Ej: Excelente teclado para gaming"
        maxLength={120}
        error={errors.title?.[0]}
      />

      <div>
        <label className="block mb-1.5 text-sm font-medium">Comentario</label>
        <textarea
          rows={4}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={1000}
          placeholder="Cuéntanos tu experiencia con este producto..."
          className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)]
            focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/30"
        />
        <p className="text-xs text-[var(--color-text-dim)] mt-1">{body.length}/1000</p>
        {errors.body && (
          <p className="text-xs text-[var(--color-danger)] mt-1">{errors.body[0]}</p>
        )}
      </div>

      <Button type="submit" loading={mutation.isPending} className="w-full sm:w-auto">
        <Send size={14} /> Publicar reseña
      </Button>
    </form>
  )
}

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { UserPlus } from 'lucide-react'
import { authApi } from '../api/auth'
import { useAuthStore } from '../store/auth'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

export default function Register() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  })
  const [errors, setErrors] = useState({})

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      setAuth({ user: data.user, token: data.token })
      toast.success(`¡Cuenta creada! Bienvenido ${data.user.name}`)
      navigate('/', { replace: true })
    },
    onError: (err) => {
      const data = err?.response?.data
      if (data?.errors) setErrors(data.errors)
      toast.error(data?.message || 'No se pudo crear la cuenta')
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    setErrors({})
    if (form.password !== form.password_confirmation) {
      setErrors({ password_confirmation: ['Las contraseñas no coinciden'] })
      return
    }
    registerMutation.mutate(form)
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 animate-fade-in">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30 mb-4">
            <UserPlus className="text-[var(--color-primary)]" size={26} />
          </div>
          <h1 className="text-3xl font-semibold text-[var(--color-text)]">
            Crea tu cuenta
          </h1>
          <p className="text-[var(--color-text-muted)] mt-2 text-sm">
            Únete a la comunidad KeyTec
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-8 space-y-5"
        >
          <Input
            label="Nombre"
            type="text"
            autoComplete="name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            error={errors.name?.[0]}
            placeholder="Tu nombre"
          />
          <Input
            label="Correo electrónico"
            type="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            error={errors.email?.[0]}
            placeholder="tucorreo@ejemplo.com"
          />
          <Input
            label="Contraseña"
            type="password"
            autoComplete="new-password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            error={errors.password?.[0]}
            placeholder="Mínimo 8 caracteres"
          />
          <Input
            label="Repite la contraseña"
            type="password"
            autoComplete="new-password"
            required
            value={form.password_confirmation}
            onChange={(e) =>
              setForm({ ...form, password_confirmation: e.target.value })
            }
            error={errors.password_confirmation?.[0]}
          />

          <Button
            type="submit"
            className="w-full"
            size="lg"
            loading={registerMutation.isPending}
          >
            Crear cuenta
          </Button>

          <p className="text-center text-sm text-[var(--color-text-muted)]">
            ¿Ya tienes cuenta?{' '}
            <Link
              to="/login"
              className="text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] font-medium"
            >
              Inicia sesión
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

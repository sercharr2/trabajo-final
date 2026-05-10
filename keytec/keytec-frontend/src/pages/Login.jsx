import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { LogIn } from 'lucide-react'
import { authApi } from '../api/auth'
import { useAuthStore } from '../store/auth'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const setAuth = useAuthStore((s) => s.setAuth)
  const from = location.state?.from || '/'

  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setAuth({ user: data.user, token: data.token })
      toast.success(`¡Bienvenido, ${data.user.name}!`)
      navigate(from, { replace: true })
    },
    onError: (err) => {
      const data = err?.response?.data
      if (data?.errors) setErrors(data.errors)
      toast.error(data?.message || 'No se pudo iniciar sesión')
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    setErrors({})
    loginMutation.mutate(form)
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 animate-fade-in">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30 mb-4">
            <LogIn className="text-[var(--color-primary)]" size={26} />
          </div>
          <h1 className="text-3xl font-semibold text-[var(--color-text)]">
            Inicia sesión
          </h1>
          <p className="text-[var(--color-text-muted)] mt-2 text-sm">
            Accede a tu cuenta de KeyTec
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-8 space-y-5"
        >
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
            autoComplete="current-password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            error={errors.password?.[0]}
            placeholder="••••••••"
          />

          <Button
            type="submit"
            className="w-full"
            size="lg"
            loading={loginMutation.isPending}
          >
            Entrar
          </Button>

          <p className="text-center text-sm text-[var(--color-text-muted)]">
            ¿No tienes cuenta?{' '}
            <Link
              to="/registro"
              className="text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] font-medium"
            >
              Regístrate
            </Link>
          </p>
        </form>

        <p className="text-center text-xs text-[var(--color-text-dim)] mt-6">
          Demo: <code className="text-[var(--color-accent)]">admin@keytec.es</code> /
          <code className="text-[var(--color-accent)]"> password</code>
        </p>
      </div>
    </div>
  )
}

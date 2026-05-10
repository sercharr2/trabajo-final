import { useState, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { authApi } from '../../api/auth'
import { useAuthStore } from '../../store/auth'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

export default function Profile() {
  const { user, setUser } = useAuthStore()
  const [form, setForm] = useState({
    name: '', phone: '', address: '', city: '', postal_code: '', country: '',
  })
  const [pwd, setPwd] = useState({ password: '', password_confirmation: '' })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        postal_code: user.postal_code || '',
        country: user.country || 'España',
      })
    }
  }, [user])

  const updateMutation = useMutation({
    mutationFn: authApi.update,
    onSuccess: (data) => {
      setUser(data)
      toast.success('Perfil actualizado')
      setPwd({ password: '', password_confirmation: '' })
    },
    onError: (err) => {
      const data = err?.response?.data
      if (data?.errors) setErrors(data.errors)
      toast.error(data?.message || 'No se pudo actualizar')
    },
  })

  const submit = (e) => {
    e.preventDefault()
    setErrors({})
    const payload = { ...form }
    if (pwd.password) {
      payload.password = pwd.password
      payload.password_confirmation = pwd.password_confirmation
    }
    updateMutation.mutate(payload)
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6">
        <h2 className="font-semibold mb-4">Información personal</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={errors.name?.[0]} />
          <Input label="Email" type="email" value={user?.email || ''} disabled />
          <Input label="Teléfono" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} error={errors.phone?.[0]} />
        </div>
      </section>

      <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6">
        <h2 className="font-semibold mb-4">Dirección de envío</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Dirección" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} containerClassName="md:col-span-2" error={errors.address?.[0]} />
          <Input label="Ciudad" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} error={errors.city?.[0]} />
          <Input label="Código postal" value={form.postal_code} onChange={(e) => setForm({ ...form, postal_code: e.target.value })} error={errors.postal_code?.[0]} />
          <Input label="País" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} containerClassName="md:col-span-2" error={errors.country?.[0]} />
        </div>
      </section>

      <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6">
        <h2 className="font-semibold mb-4">Cambiar contraseña</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Nueva contraseña" type="password" autoComplete="new-password" value={pwd.password} onChange={(e) => setPwd({ ...pwd, password: e.target.value })} error={errors.password?.[0]} />
          <Input label="Repite la contraseña" type="password" autoComplete="new-password" value={pwd.password_confirmation} onChange={(e) => setPwd({ ...pwd, password_confirmation: e.target.value })} />
        </div>
        <p className="text-xs text-[var(--color-text-dim)] mt-2">
          Déjalo en blanco si no quieres cambiarla.
        </p>
      </section>

      <div className="flex justify-end">
        <Button type="submit" loading={updateMutation.isPending}>Guardar cambios</Button>
      </div>
    </form>
  )
}

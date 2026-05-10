import { useQuery } from '@tanstack/react-query'
import { Mail, Phone } from 'lucide-react'
import { adminApi } from '../../api/admin'
import Spinner from '../../components/ui/Spinner'
import { formatDate } from '../../utils/format'

export default function AdminUsers() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => adminApi.listUsers({ per_page: 50 }),
  })

  const users = data?.data ?? []

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Usuarios</h1>
        <p className="text-[var(--color-text-muted)] text-sm mt-1">{users.length} usuarios registrados</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {users.map((user) => (
            <div
              key={user.id}
              className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/15 border border-[var(--color-primary)]/30 flex items-center justify-center font-bold text-[var(--color-primary)]">
                    {user.name?.[0]?.toUpperCase() ?? 'U'}
                  </div>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      Desde {formatDate(user.created_at)}
                    </p>
                  </div>
                </div>
                {user.role === 'admin' && (
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
                    Admin
                  </span>
                )}
              </div>
              <div className="text-xs text-[var(--color-text-muted)] space-y-1">
                <p className="flex items-center gap-2"><Mail size={12} /> {user.email}</p>
                {user.phone && <p className="flex items-center gap-2"><Phone size={12} /> {user.phone}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

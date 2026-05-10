import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 text-center animate-fade-in">
      <div>
        <h1 className="text-7xl font-bold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] bg-clip-text text-transparent">
          404
        </h1>
        <p className="text-xl mt-4 mb-2">Página no encontrada</p>
        <p className="text-[var(--color-text-muted)] mb-6">
          La página que buscas no existe o ha sido movida.
        </p>
        <Link to="/"><Button>Volver al inicio</Button></Link>
      </div>
    </div>
  )
}

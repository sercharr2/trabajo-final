import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowRight, Palette, Truck, ShieldCheck, Headphones,
  Keyboard, Sparkles,
} from 'lucide-react'
import { productsApi } from '../api/products'
import { categoriesApi } from '../api/categories'
import ProductCard from '../components/ProductCard'
import Button from '../components/ui/Button'
import Spinner from '../components/ui/Spinner'

export default function Home() {
  const { data: featured, isLoading } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: productsApi.featured,
  })
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.list,
  })

  return (
    <div className="animate-fade-in">
      {/* Hero con video de fondo */}
      <section className="relative isolate overflow-hidden min-h-[88vh] flex items-center justify-center">
        {/* Video */}
        <video
          autoPlay loop muted playsInline
          poster="/keytec-logo.svg"
          className="absolute inset-0 w-full h-full object-cover -z-10"
        >
          <source src="/hero-bg.webm" type="video/webm" />
          <source src="/hero-bg.mp4" type="video/mp4" />
        </video>

        {/* Overlay para legibilidad */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/70 via-black/55 to-black/85" />
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              'radial-gradient(60rem 40rem at 50% 50%, rgba(168, 85, 247, 0.18), transparent 70%)',
          }}
        />

        {/* Contenido centrado */}
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full
            bg-[var(--color-primary)]/15 border border-[var(--color-primary)]/40 backdrop-blur text-xs">
            <Sparkles size={12} className="text-[var(--color-primary)]" />
            <span className="text-[var(--color-primary)] font-medium">Personalizador 3D disponible</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05]">
            Tu teclado.
            <br />
            <span className="bg-gradient-to-r from-[var(--color-primary)] via-fuchsia-400 to-[var(--color-accent)] bg-clip-text text-transparent">
              Tu firma.
            </span>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
            Teclados mecánicos, switches premium y keycaps que diseñas tú mismo.
            Construye una pieza única que sientas en cada pulsación.
          </p>

          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link to="/productos">
              <Button size="lg">
                Explorar tienda <ArrowRight size={16} />
              </Button>
            </Link>
            <Link to="/personalizar">
              <Button size="lg" variant="outline" className="bg-black/30 backdrop-blur">
                <Palette size={16} /> Personalizar keycaps
              </Button>
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-white/70">
            <span className="flex items-center gap-1.5"><Truck size={14} className="text-[var(--color-primary)]" /> Envío gratis &gt; 80 €</span>
            <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-[var(--color-primary)]" /> Garantía 2 años</span>
            <span className="flex items-center gap-1.5"><Headphones size={14} className="text-[var(--color-primary)]" /> Soporte rápido</span>
          </div>
        </div>

        {/* Indicador scroll */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/50 text-xs animate-bounce">
          ↓ desplázate
        </div>
      </section>

      {/* Categorías */}
      <section className="py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold mb-6">Categorías</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(categories ?? []).filter(c => !c.parent_id).slice(0, 4).map((cat) => (
              <Link
                key={cat.id}
                to={`/productos?category=${cat.slug}`}
                className="group p-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl
                  hover:border-[var(--color-primary)]/60 hover:bg-[var(--color-surface-2)] transition-all"
              >
                <Keyboard className="text-[var(--color-primary)] mb-3" size={24} />
                <h3 className="font-medium group-hover:text-[var(--color-primary)] transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                  Ver productos →
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Destacados */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-2xl font-semibold">Destacados</h2>
              <p className="text-sm text-[var(--color-text-muted)] mt-1">
                Lo más popular esta temporada
              </p>
            </div>
            <Link
              to="/productos"
              className="text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] flex items-center gap-1"
            >
              Ver todos <ArrowRight size={14} />
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12"><Spinner size="lg" /></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {(featured ?? []).slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA personalizador */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-r from-[var(--color-primary)]/10 via-[var(--color-surface)] to-[var(--color-accent)]/10
            border border-[var(--color-border)] p-10 md:p-14 text-center">
            <Palette className="mx-auto text-[var(--color-primary)] mb-4" size={36} />
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              Diseña tu propio set de keycaps
            </h2>
            <p className="text-[var(--color-text-muted)] max-w-2xl mx-auto mb-6">
              Elige el layout, cambia colores tecla a tecla, añade letras y guarda
              tu diseño para que lo recibas listo para montar.
            </p>
            <Link to="/personalizar">
              <Button size="lg">
                Empezar a diseñar <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

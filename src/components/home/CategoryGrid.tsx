import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useState } from 'react'
import Skeleton from '../Skeleton'
import { getCategoryImage } from '../../utils/images'
import type { Category } from '../../types'

interface CategoryGridProps {
  categories: Category[]
  loading: boolean
}

function CategoryCard({ cat }: { cat: Category }) {
  const [stage, setStage] = useState(0)
  const localImg = getCategoryImage(cat.id)
  const candidates = [cat.imagen, localImg].filter(
    (src, index, all): src is string => Boolean(src) && all.indexOf(src) === index,
  )
  const imgSrc = candidates[stage] ?? null

  return (
    <Link to={`/catalogo?categoria=${cat.id}`} className="group rounded-2xl overflow-hidden bg-white border border-[var(--color-border)] hover:border-[var(--color-accent)] hover:shadow-md transition-all shadow-sm">
      <div className="h-[140px] bg-gray-100 flex items-center justify-center relative overflow-hidden rounded-t-2xl border-b border-[var(--color-border)]">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={cat.nombre}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setStage((value) => value + 1)}
          />
        ) : (
          <div className="text-[var(--color-metallic)] text-5xl font-bold opacity-20">{cat.nombre.charAt(0)}</div>
        )}
      </div>
      <div className="p-4">
        <div className="font-extrabold text-[14.5px] leading-tight text-[var(--color-navy)] group-hover:text-[var(--color-primary)] transition-colors line-clamp-1">{cat.nombre}</div>
        <div className="text-[12px] text-[var(--color-text-muted)] mt-1 line-clamp-2 leading-relaxed">{cat.descripcion}</div>
      </div>
    </Link>
  )
}

export default function CategoryGrid({ categories, loading }: CategoryGridProps) {
  return (
    <section className="py-10 bg-white border-y border-[var(--color-border)]">
      <div className="max-w-[1280px] mx-auto px-4">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-[11px] font-extrabold tracking-[0.18em] uppercase text-[var(--color-accent)] mb-1">Catalogo Mayorista</div>
            <h2 className="font-[var(--font-heading)] font-extrabold text-[28px] tracking-tight text-[var(--color-navy)]">Explora nuestras categorias</h2>
          </div>
          <Link to="/catalogo" className="hidden sm:inline-flex items-center gap-1.5 text-sm font-bold text-[var(--color-primary)] hover:text-[var(--color-accent)] transition-colors">
            Ver catalogo completo <ArrowRight className="w-4.5 h-4.5" />
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-5">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-[180px] rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-5">
            {categories.map(cat => <CategoryCard key={cat.id} cat={cat} />)}
          </div>
        )}
      </div>
    </section>
  )
}

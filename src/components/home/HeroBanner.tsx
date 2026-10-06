import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, ArrowRight, ShieldCheck } from 'lucide-react'
import { whatsappGeneral } from '../../utils/whatsapp'
import { getProducts, getCategories } from '../../services/productService'

const BANNER_SLIDES = [
  {
    id: 1,
    eyebrow: 'SalesIA Enterprise · Lima · Envíos a todo el Perú',
    titulo: 'Catálogo mayorista para tu negocio y hogar',
    subtitulo: 'Gran stock, precios al por mayor y atención inmediata por WhatsApp.',
    cta: 'Ver catálogo',
    link: '/catalogo',
    imagen: '/banners/banner-1.jpg',
  },
  {
    id: 2,
    eyebrow: 'Precios al por mayor',
    titulo: 'Abastece tu negocio al mejor precio',
    subtitulo: 'Marcas líderes, garantía y despacho rápido a nivel nacional.',
    cta: 'Cotizar ahora',
    link: '/contacto',
    imagen: '/banners/banner-2.jpg',
  },
  {
    id: 3,
    eyebrow: 'Campaña escolar & temporada',
    titulo: 'Todo para campaña en un solo lugar',
    subtitulo: 'Útiles, mochilas y artículos de temporada con stock garantizado.',
    cta: 'Explorar categorías',
    link: '/catalogo',
    imagen: '/banners/banner-3.jpg',
  },
]

interface HeroBannerProps {
  currentSlide: number
  onPrev: () => void
  onNext: () => void
  onDotClick: (index: number) => void
  onMouseEnter: () => void
  onMouseLeave: () => void
}

export default function HeroBanner({ currentSlide, onPrev, onNext, onDotClick, onMouseEnter, onMouseLeave }: HeroBannerProps) {
  const [stats, setStats] = useState<{ productos: string; categorias: string }>({ productos: '…', categorias: '…' })

  useEffect(() => {
    let alive = true
    Promise.all([getProducts(), getCategories()])
      .then(([products, categories]) => {
        if (alive) setStats({ productos: String(products.length), categorias: String(categories.length) })
      })
      .catch(() => {
        if (alive) setStats({ productos: '—', categorias: '—' })
      })
    return () => {
      alive = false
    }
  }, [])

  return (
    <section className="relative overflow-hidden border-b border-[var(--color-border)]" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      {BANNER_SLIDES.map((slide, i) => (
        <div key={slide.id} className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 ${i === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} style={{ backgroundImage: `url(${slide.imagen})` }} />
      ))}
      <div className="absolute inset-0 bg-[var(--color-secondary)]/70" />
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `repeating-linear-gradient(90deg, #94A3B8 0 1px, transparent 1px 40px), repeating-linear-gradient(0deg, #94A3B8 0 1px, transparent 1px 40px)` }} />
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-secondary)]/40 via-transparent to-[var(--color-secondary)]/60" />

      <div className="absolute inset-y-0 left-0 z-20 flex items-center pl-3">
        <button onClick={onPrev} aria-label="Anterior" className="w-10 h-10 rounded-full bg-black/20 border border-white/20 hover:bg-black/40 text-white flex items-center justify-center shadow-sm transition-all backdrop-blur-sm">
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>
      <div className="absolute inset-y-0 right-0 z-20 flex items-center pr-3">
        <button onClick={onNext} aria-label="Siguiente" className="w-10 h-10 rounded-full bg-black/20 border border-white/20 hover:bg-black/40 text-white flex items-center justify-center shadow-sm transition-all backdrop-blur-sm">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="relative max-w-[1280px] mx-auto px-4 py-10 lg:py-16">
        <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-8 items-center">
          <div className="relative min-h-[280px] lg:min-h-[340px] flex">
            {BANNER_SLIDES.map((slide, i) => (
              <div key={slide.id} className={`absolute inset-0 flex flex-col justify-center transition-all duration-700 ${i === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
                <div className="inline-flex items-center gap-2 text-[11px] font-extrabold tracking-[0.18em] uppercase text-[var(--color-accent)] mb-3">
                  <span className="w-6 h-px bg-[var(--color-accent)]" />
                  {slide.eyebrow}
                </div>
                <h1 className="font-[var(--font-heading)] font-extrabold leading-[1.05] text-white text-[32px] sm:text-[42px] lg:text-[48px] tracking-tight">
                  {slide.titulo}
                </h1>
                <p className="mt-4 text-white/80 text-[15px] lg:text-[17px] max-w-[560px] leading-relaxed">
                  {slide.subtitulo}
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link to={slide.link} className="inline-flex items-center justify-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white px-7 h-12 rounded-full font-bold text-sm shadow-[0_4px_16px_rgba(0,87,184,0.2)] hover:shadow-[0_6px_20px_rgba(0,87,184,0.3)] transition-all active:scale-[0.98]">
                    {slide.cta} <ArrowRight className="w-4.5 h-4.5" />
                  </Link>
                  <a href={whatsappGeneral()} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-[var(--color-navy)] border border-[var(--color-border-strong)] px-7 h-12 rounded-full font-bold text-sm shadow-sm transition-all active:scale-[0.98]">
                    Cotizar por WhatsApp
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden lg:block relative z-10">
            <div className="rounded-3xl bg-white/10 backdrop-blur-md border border-white/15 p-6 shadow-xl">
              <div className="text-[10px] font-extrabold tracking-[0.2em] uppercase text-white/60 mb-4">SalesIA Enterprise Tienda</div>
              <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                  { k: stats.productos, l: 'Productos' },
                  { k: stats.categorias, l: 'Categorías' },
                  { k: '24-72h', l: 'Despacho' },
                ].map(s => (
                  <div key={s.l} className="rounded-2xl bg-white/10 border border-white/10 p-3.5 text-center">
                    <div className="font-extrabold text-white leading-none text-[22px] mb-1.5">{s.k}</div>
                    <div className="text-[10px] font-bold tracking-[0.08em] uppercase text-white/70">{s.l}</div>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl bg-white/10 border border-white/10 shadow-sm p-4 flex items-center gap-4">
                <div className="w-11 h-11 rounded-full bg-[var(--color-primary)] flex items-center justify-center shrink-0 shadow-md shadow-[var(--color-primary)]/20">
                  <ShieldCheck className="w-5.5 h-5.5 text-white" />
                </div>
                <div className="leading-tight">
                  <div className="font-extrabold text-white text-[15px]">Garantía oficial + Boleta/Factura</div>
                  <div className="text-white/60 text-[13px] mt-0.5">Atención personalizada para mayoristas</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2">
          {BANNER_SLIDES.map((_, i) => (
            <button key={i} onClick={() => onDotClick(i)} aria-label={`Ir a slide ${i+1}`} className={`h-2 rounded-full transition-all ${i===currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'}`} />
          ))}
        </div>
      </div>
    </section>
  )
}

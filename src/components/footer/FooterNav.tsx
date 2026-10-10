import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useCart } from '../../context/CartContext'

const NAV_LINKS = [
  { to: '/', label: 'Inicio', arrow: true },
  { to: '/ofertas', label: 'Ofertas', arrow: true },
  { to: '/catalogo', label: 'Catálogo', arrow: true },
  { to: '/contacto', label: 'Contacto', arrow: true },
]

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

export default function FooterNav() {
  const { toggleCart, totalItems } = useCart()

  return (
    <div>
      <h3 className="font-bold text-xs tracking-[0.16em] uppercase text-white mb-4 flex items-center gap-2">
        <span className="w-5 h-px bg-[var(--color-accent)]" />
        Explorar
      </h3>
      <ul className="space-y-3 text-sm text-white/70">
        {NAV_LINKS.map(({ to, label, arrow }) => (
          <li key={to}>
            <Link to={to} onClick={scrollToTop} className="hover:text-white inline-flex items-center gap-1.5 transition-colors font-medium">
              {label}
              {arrow && <ArrowRight className="w-3 h-3 opacity-60" />}
            </Link>
          </li>
        ))}
        <li>
          <button
            onClick={toggleCart}
            className="hover:text-white inline-flex items-center gap-1.5 transition-colors font-medium text-left"
          >
            Carrito <ArrowRight className="w-3 h-3 opacity-60" /> {totalItems > 0 && <span className="ml-1 bg-[var(--color-accent)] text-white text-[10px] min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center font-bold">{totalItems}</span>}
          </button>
        </li>
      </ul>
    </div>
  )
}

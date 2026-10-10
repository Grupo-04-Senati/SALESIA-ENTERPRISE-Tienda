import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ShoppingCart, Menu, X, UserRound } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/auth'
import { getProducts } from '../services/productService'
import { whatsappGeneral } from '../utils/whatsapp'
import type { Product } from '../types'
import TopBar from './header/TopBar'
import SearchBar from './header/SearchBar'
import MobileMenu from './header/MobileMenu'

const NAV_LINKS = [
  { to: '/', label: 'Inicio' },
  { to: '/catalogo', label: 'Catálogo' },
  { to: '/contacto', label: 'Contacto' },
]

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [sugerencias, setSugerencias] = useState<Product[]>([])
  const [showSugerencias, setShowSugerencias] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const { totalItems, toggleCart } = useCart()
  const { customer } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (busqueda.trim().length < 2) {
      setSugerencias([])
      return
    }
    const timer = setTimeout(async () => {
      const all = await getProducts()
      const q = busqueda.toLowerCase()
      const matches = all.filter((p: Product) =>
        p.nombre.toLowerCase().includes(q) || p.marca.toLowerCase().includes(q)
      ).slice(0, 5)
      setSugerencias(matches)
    }, 200)
    return () => clearTimeout(timer)
  }, [busqueda])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSugerencias(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (busqueda.trim()) {
      navigate(`/catalogo?q=${encodeURIComponent(busqueda.trim())}`)
      setBusqueda('')
      setMenuOpen(false)
    }
  }

  const handleSelectProduct = (id: string) => {
    navigate(`/producto/${id}`)
    setBusqueda('')
    setShowSugerencias(false)
  }

  const isActive = (path: string) => location.pathname === path

  const handleNavClick = (to: string) => {
    if (to === location.pathname) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <header className="sticky top-0 z-50">
      <TopBar />

      <div className="bg-[var(--color-secondary)] border-b border-white/10 shadow-lg shadow-black/10">
        <div className="max-w-[1280px] mx-auto px-4">
          <div className="h-[2px] bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-accent)] to-[var(--color-metallic)] -mx-4" />
          <div className="flex items-center gap-3 lg:gap-6 py-2.5">
            <Link to="/" className="shrink-0 flex items-center" onClick={() => { window.location.href = '/' }}>
              <img
                src="/Logo/logo.jpg" 
                alt="SalesIA Enterprise Tienda"
                className="h-9 lg:h-10 w-auto rounded-lg object-contain"
                onError={(e) => {
                  const img = e.target as HTMLImageElement
                  img.style.display = 'none'
                  const fallback = document.getElementById('logo-fallback')
                  if (fallback) fallback.style.display = 'flex'
                }}
              />
              <span id="logo-fallback" className="hidden items-center gap-2">
                <span className="w-9 h-9 rounded-lg bg-[var(--color-primary)] flex items-center justify-center text-white font-black text-sm shadow-md">SE</span>
                <span className="leading-none">
                  <span className="block font-[var(--font-heading)] font-extrabold text-sm text-white tracking-tight">SALESIA ENTERPRISE</span>
                  <span className="block text-[10px] tracking-[0.18em] font-bold text-white/50">TIENDA</span>
                </span>
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1.5 ml-2" aria-label="Navegación principal">
              {NAV_LINKS.map(l => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => handleNavClick(l.to)}
                  className={`px-4 h-8 rounded-full inline-flex items-center text-[13px] font-semibold tracking-wide uppercase transition-all duration-200 ${
                    isActive(l.to)
                      ? 'bg-white text-[var(--color-navy)] shadow-sm'
                      : 'text-white hover:bg-white hover:text-[var(--color-navy)]'
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            <SearchBar
              busqueda={busqueda}
              setBusqueda={setBusqueda}
              sugerencias={sugerencias}
              showSugerencias={showSugerencias}
              setShowSugerencias={setShowSugerencias}
              searchRef={searchRef}
              onSearch={handleSearch}
              onSelectProduct={handleSelectProduct}
            />

            <div className="flex items-center gap-2 shrink-0">
              <Link
                to={customer ? '/cuenta' : '/ingresar'}
                className="relative w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white transition-colors"
                aria-label={customer ? `Mi cuenta de ${customer.name}` : 'Ingresar a mi cuenta'}
                title={customer ? customer.name : 'Ingresar'}
              >
                <UserRound className="w-4 h-4" />
                {customer && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[var(--color-accent)] border border-[var(--color-secondary)]" />
                )}
              </Link>
              <button
                onClick={toggleCart}
                className="relative w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white transition-colors"
                aria-label="Ver cotización"
              >
                <ShoppingCart className="w-4 h-4" />
                {totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[var(--color-accent)] text-white text-[10px] min-w-[20px] h-[20px] px-1 rounded-full flex items-center justify-center font-bold shadow-md shadow-[var(--color-accent)]/40 animate-pulse">
                    {totalItems}
                  </span>
                )}
              </button>
              <a
                href={whatsappGeneral()}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden lg:inline-flex items-center justify-center bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white h-9 px-5 rounded-full text-[13px] font-bold tracking-wide uppercase transition-colors shadow-md shadow-[var(--color-primary)]/20"
              >
                Cotizar
              </a>
              <button
                className="md:hidden w-9 h-9 rounded-full bg-white/10 border border-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Menú"
              >
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        <MobileMenu
          isOpen={menuOpen}
          onClose={() => setMenuOpen(false)}
          navLinks={NAV_LINKS}
          isActive={isActive}
        />
      </div>
    </header>
  )
}

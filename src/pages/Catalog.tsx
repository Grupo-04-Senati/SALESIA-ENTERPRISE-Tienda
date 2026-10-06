import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PackageSearch, AlertTriangle, RefreshCw } from 'lucide-react'
import { getProducts, getBrands, getCategories } from '../services/productService'
import type { ServiceError } from '../services/productService'
import { useDebounce } from '../hooks/useDebounce'
import ProductCard from '../components/ProductCard'
import SidebarFilters from '../components/SidebarFilters'
import { ProductCardSkeleton } from '../components/Skeleton'
import CatalogHeader from '../components/catalog/CatalogHeader'
import SearchBar from '../components/catalog/SearchBar'
import MobileFilterDrawer from '../components/catalog/MobileFilterDrawer'
import type { Product, Category, Filters, SortOption } from '../types'

const ITEMS_PER_PAGE = 12

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [productos, setProductos] = useState<Product[]>([])
  const [categorias, setCategorias] = useState<Category[]>([])
  const [marcas, setMarcas] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState(searchParams.get('q') || '')
  const [orden, setOrden] = useState<SortOption>((searchParams.get('orden') as SortOption) || 'destacados')
  const [pagina, setPagina] = useState(Number(searchParams.get('page')) || 1)
  const [filtros, setFiltros] = useState<Filters>({
    categorias: searchParams.get('categoria') ? [searchParams.get('categoria')!] : [],
    marcas: searchParams.get('marca') ? [searchParams.get('marca')!] : [],
    precioMin: 0,
    precioMax: 9999,
    disponible: false,
  })
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const busquedaDebounced = useDebounce(busqueda, 300)
  const precioMaxGlobal = useMemo(
    () => (productos.length > 0 ? Math.max(...productos.map(p => p.precio)) : 9999),
    [productos]
  )

  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true)
      setError(null)
      try {
        const [prods, marks, cats] = await Promise.all([getProducts(), getBrands(), getCategories()])
        setProductos(prods)
        setMarcas(marks)
        setCategorias(cats)
        setFiltros(prev => ({ ...prev, precioMax: Math.max(...prods.map(p => p.precio)) }))
      } catch (err) {
        setError((err as ServiceError).message || 'Ocurrió un error inesperado')
      } finally {
        setLoading(false)
      }
    }
    cargarDatos()
  }, [])

  useEffect(() => {
    const params = new URLSearchParams()
    if (busquedaDebounced) params.set('q', busquedaDebounced)
    if (orden !== 'destacados') params.set('orden', orden)
    if (pagina > 1) params.set('page', String(pagina))
    if (filtros.categorias.length === 1) params.set('categoria', filtros.categorias[0])
    if (filtros.marcas.length === 1) params.set('marca', filtros.marcas[0])
    setSearchParams(params, { replace: true })
  }, [busquedaDebounced, orden, pagina, filtros.categorias, filtros.marcas, setSearchParams])

  const productosFiltrados = useMemo(() => {
    let result = [...productos]
    if (busquedaDebounced) {
      const q = busquedaDebounced.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      result = result.filter(p =>
        p.nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.marca.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(q)
      )
    }
    if (filtros.categorias.length > 0) result = result.filter(p => filtros.categorias.includes(p.categoria))
    if (filtros.marcas.length > 0) result = result.filter(p => filtros.marcas.includes(p.marca))
    if (filtros.precioMin > 0) result = result.filter(p => p.precio >= filtros.precioMin)
    if (filtros.precioMax < 9999 && filtros.precioMax < precioMaxGlobal) result = result.filter(p => p.precio <= filtros.precioMax)
    if (filtros.disponible) result = result.filter(p => p.stock > 0)

    switch (orden) {
      case 'menor-precio': result.sort((a, b) => a.precio - b.precio); break
      case 'mayor-precio': result.sort((a, b) => b.precio - a.precio); break
      case 'az': result.sort((a, b) => a.nombre.localeCompare(b.nombre)); break
      case 'destacados': result.sort((a, b) => (b.destacado ? 1 : 0) - (a.destacado ? 1 : 0)); break
    }
    return result
  }, [productos, busquedaDebounced, filtros, orden, precioMaxGlobal])

  const totalPaginas = Math.ceil(productosFiltrados.length / ITEMS_PER_PAGE)
  const currentPage = Math.min(pagina, Math.max(1, totalPaginas))
  const productosPagina = productosFiltrados.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const handleBusquedaChange = (value: string) => { setBusqueda(value); setPagina(1) }
  const handleOrdenChange = (value: SortOption) => { setOrden(value); setPagina(1) }
  const handleFiltrosChange = (f: Filters) => { setFiltros(f); setPagina(1) }
  const limpiarFiltros = () => {
    setFiltros({ categorias: [], marcas: [], precioMin: 0, precioMax: precioMaxGlobal, disponible: false })
    setBusqueda('')
    setPagina(1)
  }

  return (
    <div className="bg-[var(--color-bg)] min-h-screen">
      <CatalogHeader />
      <div className="max-w-[1280px] mx-auto px-4 py-8 lg:py-10">
        <SearchBar
          busqueda={busqueda}
          orden={orden}
          onBusquedaChange={handleBusquedaChange}
          onOrdenChange={handleOrdenChange}
          onToggleFilters={() => setMobileFiltersOpen(!mobileFiltersOpen)}
        />
        <MobileFilterDrawer
          open={mobileFiltersOpen}
          onClose={() => setMobileFiltersOpen(false)}
          filters={filtros}
          categorias={categorias}
          marcas={marcas}
          precioMax={precioMaxGlobal}
          onChange={handleFiltrosChange}
          onClear={limpiarFiltros}
        />

        <div className="flex gap-8">
          <div className="hidden md:block w-72 shrink-0">
            <SidebarFilters filters={filtros} categorias={categorias} marcas={marcas} precioMax={precioMaxGlobal} onChange={handleFiltrosChange} onClear={limpiarFiltros} />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-medium text-[var(--color-text-secondary)] mb-5" aria-live="polite">
              {loading ? 'Cargando productos...' : (
                <>Mostrando <span className="font-bold text-[var(--color-navy)]">{productosFiltrados.length}</span> producto{productosFiltrados.length !== 1 ? 's' : ''}</>
              )}
            </p>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
                {Array.from({ length: 9 }).map((_, i) => <ProductCardSkeleton key={i} />)}
              </div>
            ) : error ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-[var(--color-border)] shadow-sm">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
                  <AlertTriangle className="w-10 h-10 text-red-500" />
                </div>
                <p className="text-[var(--color-navy)] font-extrabold text-xl mb-2">Error al cargar productos</p>
                <p className="text-[var(--color-text-secondary)] text-[15px] mb-8 max-w-[350px] mx-auto">{error}</p>
                <button onClick={() => window.location.reload()} className="bg-[var(--color-primary)] text-white px-8 py-3 rounded-full hover:bg-[var(--color-primary-dark)] font-bold shadow-md transition-all active:scale-[0.98] inline-flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" /> Reintentar
                </button>
              </div>
            ) : productosFiltrados.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-[var(--color-border)] shadow-sm">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-5">
                  <PackageSearch className="w-10 h-10 text-[var(--color-metallic)]" />
                </div>
                <p className="text-[var(--color-navy)] font-extrabold text-xl mb-2">No se encontraron productos</p>
                <p className="text-[var(--color-text-secondary)] text-[15px] mb-8 max-w-[300px] mx-auto">Prueba ajustando los filtros o buscando con otros términos.</p>
                <button onClick={limpiarFiltros} className="bg-[var(--color-primary)] text-white px-8 py-3 rounded-full hover:bg-[var(--color-primary-dark)] font-bold shadow-md transition-all active:scale-[0.98]">
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
                  {productosPagina.map(p => <ProductCard key={p.id} product={p} />)}
                </div>
                {totalPaginas > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-12 flex-wrap">
                    <button onClick={() => setPagina(p => Math.max(1, p - 1))} disabled={currentPage === 1} aria-label="Página anterior"
                      className="px-4 py-2.5 text-sm font-semibold rounded-xl border border-[var(--color-border)] text-[var(--color-text-secondary)] bg-white shadow-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 hover:text-[var(--color-navy)] transition-colors">
                      Anterior
                    </button>
                    {Array.from({ length: totalPaginas }, (_, i) => i + 1)
                      .filter(p => p === 1 || p === totalPaginas || Math.abs(p - currentPage) <= 2)
                      .map((p, idx, arr) => (
                        <span key={p} className="flex items-center gap-2">
                          {idx > 0 && arr[idx - 1] !== p - 1 && <span className="text-[var(--color-text-muted)] px-1">...</span>}
                          <button onClick={() => setPagina(p)} aria-label={`Página ${p}`} aria-current={p === currentPage ? 'page' : undefined}
                            className={`w-11 h-11 text-sm rounded-xl font-bold transition-all shadow-sm ${p === currentPage ? 'bg-[var(--color-primary)] text-white border-transparent' : 'bg-white border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-gray-50 hover:text-[var(--color-navy)]'}`}>
                            {p}
                          </button>
                        </span>
                      ))}
                    <button onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))} disabled={currentPage === totalPaginas} aria-label="Página siguiente"
                      className="px-4 py-2.5 text-sm font-semibold rounded-xl border border-[var(--color-border)] text-[var(--color-text-secondary)] bg-white shadow-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 hover:text-[var(--color-navy)] transition-colors">
                      Siguiente
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

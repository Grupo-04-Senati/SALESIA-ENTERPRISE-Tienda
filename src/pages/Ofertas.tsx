import { useCallback, useEffect, useState } from 'react'
import { Percent, Tag } from 'lucide-react'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import ProductCard from '../components/ProductCard'
import Skeleton from '../components/Skeleton'
import { getProducts } from '../services/productService'
import type { Product } from '../types'

export default function Ofertas() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const load = useCallback(() => {
    getProducts()
      .then((rows) => {
        setProducts(rows.filter((product) => product.promocion))
        setError(false)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  const reintentar = () => {
    setLoading(true)
    setError(false)
    load()
  }

  useEffect(() => {
    load()
  }, [load])

  return (
    <div className="bg-[var(--color-bg)]">
      <section className="bg-[var(--color-navy)]">
        <div className="max-w-[1280px] mx-auto px-4 py-10 lg:py-14">
          <span className="inline-flex items-center gap-1.5 bg-[var(--color-primary)] text-white text-[11px] font-extrabold uppercase tracking-[0.18em] px-3 py-1 rounded-full">
            <Percent className="w-3.5 h-3.5" />
            Ofertas
          </span>
          <h1 className="font-[var(--font-heading)] font-extrabold text-3xl lg:text-4xl tracking-tight text-white mt-3">
            Ofertas de la semana
          </h1>
          <p className="text-sm text-white/70 mt-2 max-w-xl">
            Productos con promoción activa del catálogo de SalesIA. El precio con descuento ya
            viene aplicado y se cobra así al confirmar tu pedido.
          </p>
        </div>
      </section>

      <section className="py-10 lg:py-14">
        <div className="max-w-[1280px] mx-auto px-4">
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-[300px] rounded-2xl" />
              ))}
            </div>
          ) : error ? (
            <ErrorState
              titulo="No se pudieron cargar las ofertas"
              descripcion="Ocurrió un problema al consultar el catálogo. Intenta de nuevo."
              onRetry={reintentar}
            />
          ) : products.length === 0 ? (
            <EmptyState
              titulo="No hay ofertas activas ahora mismo"
              descripcion="Pronto publicaremos nuevos descuentos. Mientras tanto, explora el catálogo completo."
              accion={{ texto: 'Ver catálogo', href: '/catalogo' }}
            />
          ) : (
            <>
              <div className="flex items-center gap-2 mb-6">
                <Tag className="w-4 h-4 text-[var(--color-primary)]" />
                <p className="text-sm font-bold text-[var(--color-text-secondary)]">
                  {products.length} {products.length === 1 ? 'producto en oferta' : 'productos en oferta'}
                </p>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  )
}

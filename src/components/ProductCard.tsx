import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { ShoppingCart, Tag } from 'lucide-react'
import { getProductImage, formatPrecio } from '../utils/images'
import { whatsappCotizarDesdeCard } from '../utils/whatsapp'
import type { Product } from '../types'

interface Props {
  product: Product
}

export default function ProductCard({ product }: Props) {
  const { addItem } = useCart()
  const navigate = useNavigate()

  const descuento = product.precioAnterior
    ? Math.round((1 - product.precio / product.precioAnterior) * 100)
    : null

  const handleCardClick = () => {
    navigate(`/producto/${product.id}`)
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (product.stock > 0) {
      addItem(product)
    }
  }

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (product.stock > 0) {
      window.open(whatsappCotizarDesdeCard(product.nombre, product.sku), '_blank')
    }
  }

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCardClick() } }}
      className="group bg-white rounded-2xl overflow-hidden border border-[var(--color-border)] hover:border-[var(--color-primary)]/40 hover:shadow-lg hover:shadow-[var(--color-primary)]/10 transition-all duration-300 hover:-translate-y-1 flex flex-col shadow-sm cursor-pointer"
    >
      <div className="relative h-[180px] bg-white overflow-hidden border-b border-[var(--color-border)]">
        <img
          src={getProductImage(product)}
          alt={product.nombre}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-300"
        />

        <div className="absolute top-2 left-2 bg-[var(--color-navy)]/80 text-white text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-md backdrop-blur-sm">
          {product.sku}
        </div>

        {descuento && (
          <span className="absolute top-2 right-2 bg-[var(--color-primary)] text-white text-[11px] font-extrabold tracking-wide px-2.5 py-1 rounded-full shadow">
            -{descuento}%
          </span>
        )}
        {product.etiquetas.includes('nuevo') && !descuento && (
          <span className="absolute top-2 right-2 bg-[var(--color-accent)] text-white text-[11px] font-extrabold tracking-wide px-2.5 py-1 rounded-full shadow">
            NUEVO
          </span>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
            <span className="bg-[var(--color-navy)] text-white text-xs font-bold px-4 py-2 rounded-full shadow">AGOTADO</span>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-[var(--color-text-muted)] mb-1">
          {product.sku} · {product.marca}
        </p>
        <h3 className="font-semibold text-[13.5px] leading-snug text-[var(--color-navy)] line-clamp-2 min-h-[38px] group-hover:text-[var(--color-primary)] transition-colors">
          {product.nombre}
        </h3>
        <div className="flex items-end gap-2 mt-2">
          <span className="text-[18px] font-extrabold tracking-tight text-[var(--color-primary)]">
            {formatPrecio(product.precio)}
          </span>
          {product.precioAnterior && (
            <span className="text-xs text-[var(--color-text-muted)] line-through mb-1">
              {formatPrecio(product.precioAnterior)}
            </span>
          )}
        </div>
        {product.promocion && (
          <span className="inline-flex w-fit items-center gap-1 mt-1.5 text-[10px] font-extrabold uppercase tracking-wide bg-[var(--color-accent)]/15 text-[var(--color-accent)] px-2 py-0.5 rounded-full">
            <Tag className="w-3 h-3" />
            {product.promocion.nombre}
          </span>
        )}
        {product.precioMayorista && (
          <p className="text-[11px] text-[var(--color-text-secondary)] mt-1">
            Mayorista <span className="font-bold text-[var(--color-accent)]">{formatPrecio(product.precioMayorista)}</span>
          </p>
        )}
        <div className="flex items-center justify-between mt-auto">
          <span className={`text-[11px] font-bold tracking-wide uppercase ${product.stock > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {product.stock > 0 ? `Stock ${product.stock}` : 'Sin stock'}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleAddToCart}
              className="w-9 h-9 rounded-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white flex items-center justify-center shadow transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={product.stock === 0}
              title="Añadir a cotización"
            >
              <ShoppingCart className="w-4 h-4" />
            </button>
            <button
              onClick={handleWhatsApp}
              className="w-9 h-9 rounded-full bg-[var(--color-whatsapp)] hover:opacity-90 text-white flex items-center justify-center shadow-md transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={product.stock === 0}
              title="Cotizar por WhatsApp"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

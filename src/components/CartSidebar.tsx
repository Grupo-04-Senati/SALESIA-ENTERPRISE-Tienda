import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, Minus, Plus, Send, ShieldCheck, ShoppingBag, Trash2, UserRound, X } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/auth'
import { getProductImage } from '../utils/images'
import { buildWhatsAppUrl } from '../utils/whatsapp'
import { sendStoreQuote } from '../services/storeApi'

interface Contacto {
  nombre: string
  telefono: string
  correo: string
}

const CONTACT_KEY = 'salesia_store_contact'

const loadContacto = (): Contacto => {
  try {
    const raw = localStorage.getItem(CONTACT_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Contacto>
      return {
        nombre: parsed.nombre ?? '',
        telefono: parsed.telefono ?? '',
        correo: parsed.correo ?? '',
      }
    }
  } catch {
    /* sin contacto guardado */
  }
  return { nombre: '', telefono: '', correo: '' }
}

export default function CartSidebar() {
  const { items, isOpen, removeItem, updateCantidad, clearCart, toggleCart, subtotal } = useCart()
  const { customer } = useAuth()
  const [contacto, setContacto] = useState<Contacto>(loadContacto)
  const [enviando, setEnviando] = useState(false)
  const [envio, setEnvio] = useState<{ firma: string; numero: string; venta: string | null } | null>(null)
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null)

  const nombreEfectivo = contacto.nombre.trim() || customer?.name || ''
  const telefonoEfectivo = contacto.telefono.trim() || customer?.phone || ''
  const correoEfectivo = contacto.correo.trim() || customer?.email || ''

  const firmaActual = items.map(item => `${item.product.id}x${item.cantidad}`).join('|')
  const numeroCotizacion = envio && envio.firma === firmaActual ? envio.numero : null
  const numeroVenta = envio && envio.firma === firmaActual ? envio.venta : null

  const setCampo = (campo: keyof Contacto) => (event: { target: { value: string } }) => {
    const bruto = event.target.value
    const valor = campo === 'telefono'
      ? bruto.replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '').slice(0, 16)
      : bruto
    const siguiente = { ...contacto, [campo]: valor }
    setContacto(siguiente)
    try {
      localStorage.setItem(CONTACT_KEY, JSON.stringify(siguiente))
    } catch {
      /* almacenamiento no disponible */
    }
  }

  const enviarACotizacion = async () => {
    setErrorEnvio(null)
    if (!customer) {
      setErrorEnvio('Inicia sesión para comprar en la tienda.')
      return
    }
    if (nombreEfectivo.trim().length < 3) {
      setErrorEnvio('Ingresa tu nombre completo (mínimo 3 caracteres).')
      return
    }
    const telefono = telefonoEfectivo.trim()
    const correo = correoEfectivo.trim()
    if (!telefono && !correo) {
      setErrorEnvio('Ingresa tu teléfono o tu correo para poder contactarte.')
      return
    }
    if (telefono && !/^\+?\d{7,15}$/.test(telefono)) {
      setErrorEnvio('El teléfono debe tener entre 7 y 15 dígitos (puede empezar con +).')
      return
    }
    if (correo && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo)) {
      setErrorEnvio('El correo no tiene un formato válido.')
      return
    }
    const ids = items.map(item => Number(item.product.id))
    if (ids.some(id => !Number.isInteger(id) || id < 1)) {
      setErrorEnvio('Hay productos sin sincronizar con SalesIA. Recarga la página e inténtalo de nuevo.')
      return
    }

    setEnviando(true)
    try {
      const result = await sendStoreQuote({
        customer: {
          name: nombreEfectivo.trim(),
          phone: telefono || null,
          email: correo || null,
        },
        items: items.map((item, index) => ({
          product_id: ids[index],
          quantity: item.cantidad,
        })),
        notes: 'Cotización enviada desde la tienda web SalesIA Enterprise Tienda.',
      })
      setEnvio({ firma: firmaActual, numero: result.quote_number, venta: result.sale_number ?? null })
    } catch (error) {
      setErrorEnvio(error instanceof Error ? error.message : 'No se pudo enviar la cotización.')
    } finally {
      setEnviando(false)
    }
  }

  const formatPrecio = (precio: number) =>
    new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(precio)

  const mensajeWhatsApp =
    'Hola SalesIA Enterprise Tienda, quiero cotizar:\n' +
    items.map(item => `• ${item.product.nombre} (x${item.cantidad}) — ${formatPrecio(item.product.precio * item.cantidad)}`).join('\n') +
    '\n\nSubtotal: ' + formatPrecio(subtotal) +
    (numeroCotizacion ? `\nCotización registrada en SalesIA: ${numeroCotizacion}` : '') +
    (numeroVenta ? `\nVenta registrada: ${numeroVenta} (stock descontado)` : '') +
    '\n¿Me confirman stock y precio mayorista?'

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"
        onClick={toggleCart}
        aria-hidden="true"
      />
      {/* Drawer */}
      <div
        className="relative h-full w-full max-w-md bg-white shadow-2xl flex flex-col border-l border-[var(--color-border)] animate-[slideIn_220ms_ease]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header oscuro marca */}
        <div className="flex items-center justify-between px-5 h-[56px] bg-[var(--color-secondary)] text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm leading-none">Cotización</h2>
              <p className="text-[11px] text-white/60">{items.length} producto{items.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <button onClick={toggleCart} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors" aria-label="Cerrar">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 bg-[var(--color-bg)]">
          {items.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-white border border-[var(--color-border)] flex items-center justify-center mx-auto mb-4 shadow-sm">
                <ShoppingBag className="w-7 h-7 text-[var(--color-metallic)]" />
              </div>
              <p className="font-bold text-[var(--color-navy)]">Tu cotización está vacía</p>
              <p className="text-sm text-[var(--color-text-muted)] mt-1">Agrega productos para cotizar al por mayor</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map(item => (
                <div key={item.product.id} className="flex gap-3 p-3 bg-white rounded-2xl border border-[var(--color-border)] shadow-sm">
                  <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center shrink-0 border border-[var(--color-border)] overflow-hidden">
                    <img
                      src={getProductImage(item.product)}
                      alt={item.product.nombre}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[13px] font-bold leading-snug text-[var(--color-navy)] line-clamp-2">
                      {item.product.nombre}
                    </h3>
                    <p className="text-[11px] font-bold tracking-wide uppercase text-[var(--color-metallic)]">{item.product.sku} · {item.product.marca}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => updateCantidad(item.product.id, item.cantidad - 1)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg border border-[var(--color-border)] bg-white hover:bg-gray-50 transition-colors text-[var(--color-text)]"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-bold w-6 text-center text-[var(--color-navy)]">{item.cantidad}</span>
                        <button
                          onClick={() => updateCantidad(item.product.id, item.cantidad + 1)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg border border-[var(--color-border)] bg-white hover:bg-gray-50 transition-colors text-[var(--color-text)]"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="text-sm font-extrabold text-[var(--color-primary)]">
                        {formatPrecio(item.product.precio * item.cantidad)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.product.id)}
                    className="w-8 h-8 rounded-lg hover:bg-red-50 text-[var(--color-metallic)] hover:text-red-500 transition-colors flex items-center justify-center self-start"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-[var(--color-border)] p-4 space-y-3 bg-white">
            <div className="rounded-xl bg-[var(--color-bg-alt)] border border-[var(--color-border)] p-3 flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
              <ShieldCheck className="w-4 h-4 text-[var(--color-primary)] shrink-0" />
              Precios mayoristas sujetos a stock y validación por asesor.
            </div>

            {/* Datos de contacto para la cotización */}
            {!customer ? (
              <div className="space-y-3">
                <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 text-xs text-blue-800">
                  <p className="font-bold mb-1">Solo clientes con sesión pueden comprar</p>
                  <p>Ingresa a tu cuenta o créala para enviar tu pedido a SalesIA.</p>
                </div>
                <Link
                  to="/ingresar"
                  onClick={toggleCart}
                  className="flex items-center justify-center gap-2 w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white text-center h-12 rounded-xl font-bold transition-all active:scale-[0.98] shadow-md"
                >
                  <UserRound className="w-4 h-4" />
                  Inicia sesión para comprar
                </Link>
                <p className="text-center text-xs text-[var(--color-text-secondary)]">
                  ¿No tienes cuenta?{' '}
                  <Link
                    to="/registro"
                    onClick={toggleCart}
                    className="font-bold text-[var(--color-primary)] hover:underline"
                  >
                    Créala gratis
                  </Link>
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--color-metallic)]">
                  Tus datos para la cotización
                </p>
                <div className="rounded-xl bg-[var(--color-bg-alt)] border border-[var(--color-border)] p-2.5 flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
                  <UserRound className="w-3.5 h-3.5 text-[var(--color-primary)] shrink-0" />
                  <span>
                    Comprando como <b className="text-[var(--color-navy)]">{customer.name}</b>
                  </span>
                </div>
                <input
                  value={nombreEfectivo}
                  onChange={setCampo('nombre')}
                  placeholder="Nombre y apellido *"
                  maxLength={150}
                  autoComplete="name"
                  className="w-full h-10 px-3 text-sm bg-gray-50 text-[var(--color-text)] border border-[var(--color-border)] rounded-xl placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20 transition-all"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    value={telefonoEfectivo}
                    onChange={setCampo('telefono')}
                    placeholder="Teléfono"
                    inputMode="tel"
                    maxLength={16}
                    autoComplete="tel"
                    className="w-full h-10 px-3 text-sm bg-gray-50 text-[var(--color-text)] border border-[var(--color-border)] rounded-xl placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20 transition-all"
                  />
                  <input
                    value={correoEfectivo}
                    onChange={setCampo('correo')}
                    placeholder="Correo"
                    type="email"
                    maxLength={160}
                    autoComplete="email"
                    className="w-full h-10 px-3 text-sm bg-gray-50 text-[var(--color-text)] border border-[var(--color-border)] rounded-xl placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20 transition-all"
                  />
                </div>
              </div>
            )}

            {numeroCotizacion && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 flex items-start gap-2 text-xs text-emerald-800">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Cotización <b>{numeroCotizacion}</b>
                  {numeroVenta ? (
                    <> → venta <b>{numeroVenta}</b> registrada en SalesIA: el stock se descontó automáticamente.</>
                  ) : (
                    <> registrada en SalesIA. Un asesor te contactará.</>
                  )}
                </span>
              </div>
            )}
            {errorEnvio && (
              <div role="alert" className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs font-medium text-red-700">
                {errorEnvio}
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--color-text-secondary)] font-medium">Subtotal estimado</span>
              <span className="text-xl font-extrabold text-[var(--color-primary)]">{formatPrecio(subtotal)}</span>
            </div>

            {customer && (
              <button
                type="button"
                onClick={enviarACotizacion}
                disabled={enviando}
                className="flex items-center justify-center gap-2 w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] disabled:opacity-60 text-white text-center h-12 rounded-xl font-bold transition-all active:scale-[0.98] shadow-md"
              >
                <Send className="w-4 h-4" />
                {enviando
                  ? 'Enviando a SalesIA…'
                  : numeroCotizacion
                    ? 'Cotización enviada ✓'
                    : 'Generar cotización en SalesIA'}
              </button>
            )}

            <a
              href={buildWhatsAppUrl(mensajeWhatsApp)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-[var(--color-whatsapp)] hover:opacity-90 text-white text-center h-12 rounded-xl font-bold transition-all active:scale-[0.98] shadow-md"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Cotizar por WhatsApp
            </a>
            <button
              onClick={clearCart}
              className="w-full text-center text-xs font-bold tracking-wide uppercase text-[var(--color-metallic)] hover:text-red-500 transition-colors py-1"
            >
              Vaciar cotización
            </button>
          </div>
        )}
      </div>
      <style>{`@keyframes slideIn{from{transform:translateX(100%)}to{transform:translateX(0)}}`}</style>
    </div>
  )
}

import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  CheckCircle2,
  Clock3,
  LogOut,
  PackageCheck,
  PackageOpen,
  RefreshCw,
  ShoppingBag,
  UserRound,
} from 'lucide-react'
import { useAuth } from '../context/auth'
import { fetchStoreOrders, type StoreOrder } from '../services/storeApi'

const STATUS_STYLE: Record<StoreOrder['status'], { label: string; className: string }> = {
  pending: { label: 'Pendiente', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  partial: { label: 'Parcial', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  paid: { label: 'Pagado', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  cancelled: { label: 'Cancelado', className: 'bg-red-50 text-red-700 border-red-200' },
}

const formatFecha = (iso: string) => {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

const formatPrecio = (precio: number) =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(precio)

export default function Cuenta() {
  const { customer, ready, logout } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState<StoreOrder[]>([])
  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState<string | null>(null)

  const cargarPedidos = useCallback(async () => {
    try {
      const rows = await fetchStoreOrders()
      setOrders(rows)
      setErrorCarga(null)
    } catch (error) {
      setErrorCarga(error instanceof Error ? error.message : 'No se pudieron cargar tus pedidos.')
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    if (ready && !customer) navigate('/ingresar', { replace: true })
  }, [ready, customer, navigate])

  useEffect(() => {
    if (!ready || !customer) return
    let cancelled = false
    fetchStoreOrders()
      .then((rows) => {
        if (cancelled) return
        setOrders(rows)
        setErrorCarga(null)
      })
      .catch((error: unknown) => {
        if (cancelled) return
        setErrorCarga(
          error instanceof Error ? error.message : 'No se pudieron cargar tus pedidos.',
        )
      })
      .finally(() => {
        if (!cancelled) setCargando(false)
      })
    return () => {
      cancelled = true
    }
  }, [ready, customer])

  const handleLogout = () => {
    logout()
    navigate('/', { replace: true })
  }

  if (!ready || !customer) {
    return (
      <div className="bg-[var(--color-bg)] min-h-screen flex items-center justify-center">
        <RefreshCw className="w-7 h-7 animate-spin text-[var(--color-primary)]" aria-label="Cargando" />
      </div>
    )
  }

  return (
    <div className="bg-[var(--color-bg)] min-h-screen">
      <div className="bg-white border-b border-[var(--color-border)]">
        <div className="max-w-[1280px] mx-auto px-4 py-8 lg:py-10">
          <div className="text-[11px] font-extrabold tracking-[0.18em] uppercase text-[var(--color-accent)] mb-2 flex items-center gap-2">
            <span className="w-6 h-px bg-[var(--color-accent)]" />
            Mi cuenta
          </div>
          <h1 className="font-extrabold text-3xl lg:text-4xl tracking-tight text-[var(--color-navy)]">
            Hola, {customer.name.split(' ')[0]}
          </h1>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 py-10 lg:py-12 grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8">
        <aside className="space-y-4">
          <div className="bg-white rounded-2xl border border-[var(--color-border)] shadow-sm p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center">
                <UserRound className="w-5 h-5 text-[var(--color-primary)]" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-[var(--color-navy)] truncate">{customer.name}</p>
                <p className="text-xs text-[var(--color-text-muted)] truncate">
                  {customer.email ?? '—'}
                </p>
              </div>
            </div>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-[var(--color-text-muted)]">Teléfono</dt>
                <dd className="font-semibold text-[var(--color-text)]">{customer.phone ?? '—'}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[var(--color-text-muted)]">Segmento</dt>
                <dd className="font-semibold text-[var(--color-text)]">{customer.segment}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[var(--color-text-muted)]">Cliente desde</dt>
                <dd className="font-semibold text-[var(--color-text)]">
                  {formatFecha(customer.created_at)}
                </dd>
              </div>
            </dl>
            <button
              onClick={handleLogout}
              className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[var(--color-border)] text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Cerrar sesión
            </button>
          </div>

          <div className="rounded-xl bg-[var(--color-bg-alt)] border border-[var(--color-border)] p-3 flex items-start gap-2 text-xs text-[var(--color-text-secondary)]">
            <PackageCheck className="w-4 h-4 text-[var(--color-primary)] shrink-0 mt-0.5" />
            <span>
              Cuando el equipo confirme la entrega de un pedido verás la marca
              <b> Recibido</b> junto al estado del pedido.
            </span>
          </div>

          <Link
            to="/catalogo"
            className="block text-center py-2.5 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white text-sm font-bold transition-colors shadow-md"
          >
            Seguir comprando
          </Link>
        </aside>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-extrabold text-[var(--color-navy)] flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[var(--color-accent)]" />
              Mis pedidos
            </h2>
            <button
              onClick={() => {
                setCargando(true)
                void cargarPedidos()
              }}
              disabled={cargando}
              className="w-9 h-9 rounded-full border border-[var(--color-border)] bg-white hover:bg-gray-50 flex items-center justify-center text-[var(--color-text-secondary)] transition-colors disabled:opacity-50"
              aria-label="Actualizar pedidos"
            >
              <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {cargando && orders.length === 0 ? (
            <div className="space-y-3">
              {[0, 1].map((i) => (
                <div
                  key={i}
                  className="h-32 rounded-2xl bg-white border border-[var(--color-border)] animate-pulse"
                />
              ))}
            </div>
          ) : errorCarga ? (
            <div role="alert" className="rounded-2xl bg-red-50 border border-red-200 p-5 text-sm font-medium text-red-700">
              {errorCarga}
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[var(--color-border)] shadow-sm p-10 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[var(--color-bg-alt)] flex items-center justify-center mx-auto mb-4">
                <PackageOpen className="w-7 h-7 text-[var(--color-metallic)]" />
              </div>
              <p className="font-bold text-[var(--color-navy)]">Aún no tienes pedidos</p>
              <p className="text-sm text-[var(--color-text-muted)] mt-1">
                Genera una cotización desde el catálogo y aparecerá aquí.
              </p>
              <Link
                to="/catalogo"
                className="inline-block mt-5 px-6 py-2.5 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white text-sm font-bold transition-colors shadow-md"
              >
                Ver catálogo
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const status = STATUS_STYLE[order.status] ?? STATUS_STYLE.pending
                return (
                  <article
                    key={order.id}
                    className="bg-white rounded-2xl border border-[var(--color-border)] shadow-sm overflow-hidden"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 bg-[var(--color-bg-alt)] border-b border-[var(--color-border)]">
                      <div>
                        <p className="font-extrabold text-[var(--color-navy)]">{order.sale_number}</p>
                        <p className="text-xs text-[var(--color-text-muted)] flex items-center gap-1 mt-0.5">
                          <Clock3 className="w-3.5 h-3.5" />
                          {formatFecha(order.issued_at)}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[11px] font-bold uppercase tracking-wide ${status.className}`}
                        >
                          {status.label}
                        </span>
                        {order.received_at ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-emerald-300 bg-emerald-100 text-emerald-800 text-[11px] font-bold uppercase tracking-wide">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Recibido · {formatFecha(order.received_at)}
                          </span>
                        ) : order.status !== 'cancelled' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-gray-200 bg-white text-gray-500 text-[11px] font-bold uppercase tracking-wide">
                            <PackageOpen className="w-3.5 h-3.5" />
                            En entrega
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <ul className="divide-y divide-[var(--color-border)]">
                      {order.items.map((item) => (
                        <li
                          key={item.product_id}
                          className="flex items-center justify-between gap-3 px-5 py-3 text-sm"
                        >
                          <span className="min-w-0">
                            <span className="font-semibold text-[var(--color-text)]">{item.name}</span>
                            <span className="block text-xs text-[var(--color-text-muted)]">
                              {item.sku} · x{item.quantity} · {formatPrecio(item.unit_price)}
                            </span>
                          </span>
                          <span className="font-bold text-[var(--color-navy)] shrink-0">
                            {formatPrecio(item.subtotal)}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-t border-[var(--color-border)]">
                      <span className="text-xs text-[var(--color-text-muted)]">
                        Pagado {formatPrecio(order.paid)} · Saldo {formatPrecio(order.balance)}
                      </span>
                      <span className="text-lg font-extrabold text-[var(--color-primary)]">
                        {formatPrecio(order.total)}
                      </span>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

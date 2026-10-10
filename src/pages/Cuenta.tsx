import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  LogOut,
  MessageSquare,
  PackageCheck,
  PackageOpen,
  RefreshCw,
  ShoppingBag,
  UserRound,
} from 'lucide-react'
import { useAuth } from '../context/auth'
import {
  fetchStoreOrders,
  sendOrderClaim,
  type StoreClaim,
  type StoreOrder,
} from '../services/storeApi'

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
  const [reclamandoId, setReclamandoId] = useState<number | null>(null)
  const [textoReclamo, setTextoReclamo] = useState('')
  const [enviandoReclamo, setEnviandoReclamo] = useState(false)
  const [errorAccion, setErrorAccion] = useState<{ id: number; message: string } | null>(null)

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

  const abrirReclamo = (orderId: number) => {
    setReclamandoId((actual) => (actual === orderId ? null : orderId))
    setTextoReclamo('')
    setErrorAccion(null)
  }

  const handleEnviarReclamo = async (orderId: number) => {
    if (enviandoReclamo) return
    const texto = textoReclamo.trim()
    if (texto.length < 10) {
      setErrorAccion({ id: orderId, message: 'El reclamo debe tener al menos 10 caracteres.' })
      return
    }
    setEnviandoReclamo(true)
    setErrorAccion(null)
    try {
      const claim = await sendOrderClaim(orderId, texto)
      setOrders((prev) =>
        prev.map((row) =>
          row.id === orderId ? { ...row, claims: [...(row.claims ?? []), claim] } : row,
        ),
      )
      setReclamandoId(null)
      setTextoReclamo('')
    } catch (error) {
      setErrorAccion({
        id: orderId,
        message: error instanceof Error ? error.message : 'No se pudo enviar el reclamo.',
      })
    } finally {
      setEnviandoReclamo(false)
    }
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
              SalesIA confirma la llegada de tus pedidos: verás la marca{' '}
              <b>«Recibido»</b> cuando el equipo la registre. Si tu pedido no llegó,
              envía una <b>reclamación</b> y el equipo te responderá por el sistema.
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

                    {((order.status !== 'cancelled' && !order.received_at) ||
                      (order.claims?.length ?? 0) > 0 ||
                      (reclamandoId === order.id && order.status !== 'cancelled')) && (
                      <div className="px-5 py-4 border-t border-[var(--color-border)] space-y-3">
                        {order.status !== 'cancelled' && !order.received_at && (
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--color-metallic)]">
                              Entrega en curso · confirmada por el sistema
                            </p>
                            <button
                              onClick={() => abrirReclamo(order.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-300 bg-amber-50 text-amber-700 text-xs font-bold hover:bg-amber-100 transition-colors"
                            >
                              <AlertTriangle className="w-3.5 h-3.5" />
                              {reclamandoId === order.id ? 'Cerrar reclamo' : 'No llegó'}
                            </button>
                          </div>
                        )}

                        {reclamandoId === order.id && order.status !== 'cancelled' && (
                          <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3 space-y-2">
                            <label
                              htmlFor={`reclamo-${order.id}`}
                              className="block text-xs font-bold text-amber-800"
                            >
                              Cuéntanos qué pasó (mínimo 10 caracteres)
                            </label>
                            <textarea
                              id={`reclamo-${order.id}`}
                              value={textoReclamo}
                              onChange={(event) => setTextoReclamo(event.target.value)}
                              rows={3}
                              maxLength={1000}
                              placeholder="Ej.: El pedido no llegó a la dirección indicada…"
                              className="w-full text-sm bg-white border border-[var(--color-border)] rounded-xl p-3 text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20"
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => {
                                  setReclamandoId(null)
                                  setTextoReclamo('')
                                }}
                                className="px-3 py-1.5 rounded-xl border border-[var(--color-border)] bg-white text-xs font-bold text-[var(--color-text-secondary)] hover:bg-gray-50 transition-colors"
                              >
                                Cancelar
                              </button>
                              <button
                                onClick={() => void handleEnviarReclamo(order.id)}
                                disabled={enviandoReclamo || textoReclamo.trim().length < 10}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white text-xs font-bold transition-colors disabled:opacity-50"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                {enviandoReclamo ? 'Enviando…' : 'Enviar reclamación'}
                              </button>
                            </div>
                          </div>
                        )}

                        {errorAccion?.id === order.id && (
                          <p role="alert" className="text-xs font-medium text-red-600">
                            {errorAccion.message}
                          </p>
                        )}

                        {(order.claims?.length ?? 0) > 0 && (
                          <ul className="space-y-2">
                            {order.claims?.map((claim: StoreClaim) => (
                              <li
                                key={claim.id}
                                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-alt)] p-3 text-xs"
                              >
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <span
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border font-bold uppercase tracking-wide ${
                                      claim.status === 'pendiente'
                                        ? 'border-amber-300 bg-amber-100 text-amber-800'
                                        : 'border-emerald-300 bg-emerald-100 text-emerald-800'
                                    }`}
                                  >
                                    <MessageSquare className="w-3 h-3" />
                                    {claim.status === 'pendiente'
                                      ? 'Reclamo enviado'
                                      : 'Reclamo atendido'}
                                  </span>
                                  <span className="text-[var(--color-text-muted)]">
                                    {formatFecha(claim.created_at)}
                                  </span>
                                </div>
                                <p className="mt-2 text-[var(--color-text)]">{claim.description}</p>
                                {claim.resolved_at && (
                                  <p className="mt-1 font-semibold text-emerald-700">
                                    Atendido el {formatFecha(claim.resolved_at)}
                                  </p>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
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

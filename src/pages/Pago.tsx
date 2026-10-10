import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  CreditCard,
  Loader2,
  Lock,
  PackageOpen,
  QrCode,
  Smartphone,
} from 'lucide-react'
import { useAuth } from '../context/auth'
import { fetchStoreOrders, payOrder, type StoreOrder } from '../services/storeApi'

type Metodo = 'card' | 'yape' | 'plin'

const formatPrecio = (precio: number) =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(precio)

const METODOS: { id: Metodo; label: string }[] = [
  { id: 'card', label: 'Tarjeta' },
  { id: 'yape', label: 'Yape' },
  { id: 'plin', label: 'Plin' },
]

const nuevaOperacion = () =>
  `SIM-${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 90 + 10)}`

export default function Pago() {
  const { saleId } = useParams()
  const { ready, customer } = useAuth()
  const navigate = useNavigate()
  const id = Number(saleId)

  const [order, setOrder] = useState<StoreOrder | null>(null)
  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState<string | null>(null)
  const [metodo, setMetodo] = useState<Metodo>('card')
  const [numero, setNumero] = useState('')
  const [titular, setTitular] = useState('')
  const [vence, setVence] = useState('')
  const [cvv, setCvv] = useState('')
  const [telefono, setTelefono] = useState('')
  const [procesando, setProcesando] = useState(false)
  const [errorPago, setErrorPago] = useState<string | null>(null)
  const [aprobado, setAprobado] = useState<{ operacion: string } | null>(null)

  useEffect(() => {
    if (ready && !customer) navigate('/ingresar', { replace: true })
  }, [ready, customer, navigate])

  const idValido = Number.isInteger(id) && id >= 1

  useEffect(() => {
    if (!ready || !customer || !Number.isInteger(id) || id < 1) return
    let cancelled = false
    fetchStoreOrders()
      .then((rows) => {
        if (cancelled) return
        const found = rows.find((row) => row.id === id)
        if (!found) setErrorCarga('Pedido no encontrado.')
        else setOrder(found)
      })
      .catch((error: unknown) => {
        if (cancelled) return
        setErrorCarga(error instanceof Error ? error.message : 'No se pudo cargar el pedido.')
      })
      .finally(() => {
        if (!cancelled) setCargando(false)
      })
    return () => {
      cancelled = true
    }
  }, [ready, customer, id])

  const qrCells = useMemo(() => {
    const semilla = (order?.sale_number ?? 'salesia')
      .split('')
      .reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
    return Array.from({ length: 441 }, (_, i) => (i * 7 + semilla + (i % 21) * 13) % 3 === 0)
  }, [order?.sale_number])

  const digitos = numero.replace(/\D/g, '')

  const onNumero = (value: string) => {
    const limpio = value.replace(/\D/g, '').slice(0, 16)
    setNumero(limpio.replace(/(.{4})/g, '$1 ').trim())
  }

  const onVence = (value: string) => {
    const limpio = value.replace(/\D/g, '').slice(0, 4)
    setVence(limpio.length > 2 ? `${limpio.slice(0, 2)}/${limpio.slice(2)}` : limpio)
  }

  const pagar = async () => {
    if (!order || procesando) return
    setErrorPago(null)
    if (metodo === 'card') {
      if (digitos.length < 16) {
        setErrorPago('La tarjeta debe tener 16 dígitos.')
        return
      }
      if (titular.trim().length < 3) {
        setErrorPago('Ingresa el nombre del titular.')
        return
      }
      if (!/^\d{2}\/\d{2}$/.test(vence)) {
        setErrorPago('El vencimiento debe tener formato MM/AA.')
        return
      }
      if (!/^\d{3,4}$/.test(cvv)) {
        setErrorPago('El CVV tiene 3 o 4 dígitos.')
        return
      }
      if (digitos.endsWith('0000')) {
        setProcesando(true)
        await new Promise((resolve) => setTimeout(resolve, 2200))
        setProcesando(false)
        setErrorPago('Pago rechazado (código 05 · fondos insuficientes). Demo: una tarjeta terminada en 0000 siempre se rechaza.')
        return
      }
    }
    if (metodo === 'plin' && !/^\d{7,15}$/.test(telefono)) {
      setErrorPago('El teléfono debe tener entre 7 y 15 dígitos.')
      return
    }
    const operacion = nuevaOperacion()
    setProcesando(true)
    await new Promise((resolve) => setTimeout(resolve, 2400))
    try {
      const pagado = await payOrder(order.id, { method: metodo, reference: operacion })
      setOrder(pagado)
      setAprobado({ operacion })
    } catch (error) {
      setErrorPago(error instanceof Error ? error.message : 'No se pudo procesar el pago.')
    } finally {
      setProcesando(false)
    }
  }

  if (!ready || !customer) {
    return (
      <div className="bg-[var(--color-bg)] min-h-screen flex items-center justify-center">
        <Loader2 className="w-7 h-7 animate-spin text-[var(--color-primary)]" aria-label="Cargando" />
      </div>
    )
  }

  const pagadoYa = order !== null && order.balance <= 0 && order.status !== 'cancelled'
  const anulado = order !== null && order.status === 'cancelled'

  if (aprobado || pagadoYa) {
    return (
      <div className="bg-[var(--color-bg)] min-h-screen">
        <div className="max-w-[560px] mx-auto px-4 py-14 lg:py-20">
          <div className="bg-white rounded-2xl border border-[var(--color-border)] shadow-sm p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h1 className="font-extrabold text-2xl tracking-tight text-[var(--color-navy)]">
              Pago aprobado
            </h1>
            <p className="text-sm text-[var(--color-text-muted)]">
              Tu pedido <b className="text-[var(--color-navy)]">{order?.sale_number}</b> quedó
              pagado. La pasarela registró la operación{' '}
              <b className="text-[var(--color-navy)]">{aprobado?.operacion ?? '—'}</b>.
            </p>
            <div className="rounded-xl bg-[var(--color-bg-alt)] border border-[var(--color-border)] p-4 flex items-center justify-between text-sm">
              <span className="text-[var(--color-text-secondary)]">Total pagado</span>
              <span className="font-extrabold text-[var(--color-primary)]">
                {formatPrecio(order?.total ?? 0)}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                to="/cuenta"
                className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white text-sm font-bold transition-colors shadow-md"
              >
                Ver mis pedidos
              </Link>
              <Link
                to="/catalogo"
                className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[var(--color-border)] bg-white text-[var(--color-text)] text-sm font-bold hover:bg-gray-50 transition-colors"
              >
                Seguir comprando
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[var(--color-bg)] min-h-screen">
      <div className="bg-white border-b border-[var(--color-border)]">
        <div className="max-w-[1280px] mx-auto px-4 py-6 lg:py-8">
          <Link
            to="/cuenta"
            className="inline-flex items-center gap-1 text-xs font-bold text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Mis pedidos
          </Link>
          <h1 className="font-extrabold text-3xl lg:text-4xl tracking-tight text-[var(--color-navy)] mt-2">
            Pago seguro
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Pasarela de demostración de SalesIA · no ingreses tarjetas reales.
          </p>
        </div>
      </div>

      <div className="max-w-[880px] mx-auto px-4 py-10 lg:py-12 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <section className="bg-white rounded-2xl border border-[var(--color-border)] shadow-sm p-5 space-y-5 relative">
          {!idValido ? (
            <div role="alert" className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm font-medium text-red-700">
              Pedido no encontrado.
            </div>
          ) : cargando ? (
            <div className="space-y-3 py-6">
              <div className="h-8 w-2/5 rounded-lg bg-[var(--color-bg-alt)] animate-pulse" />
              <div className="h-32 rounded-xl bg-[var(--color-bg-alt)] animate-pulse" />
            </div>
          ) : errorCarga ? (
            <div role="alert" className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm font-medium text-red-700">
              {errorCarga}
            </div>
          ) : order && anulado ? (
            <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm font-medium text-red-700 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              Este pedido fue anulado por SalesIA y no admite pagos.
            </div>
          ) : order ? (
            <>
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--color-metallic)]">
                  Elige cómo pagar
                </p>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-amber-300 bg-amber-50 text-amber-700 text-[11px] font-bold uppercase tracking-wide">
                  <Lock className="w-3 h-3" />
                  Demo
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {METODOS.map((opcion) => (
                  <button
                    key={opcion.id}
                    type="button"
                    onClick={() => {
                      setMetodo(opcion.id)
                      setErrorPago(null)
                    }}
                    disabled={procesando}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-bold transition-colors disabled:opacity-50 ${
                      metodo === opcion.id
                        ? 'border-[var(--color-accent)] bg-[var(--color-primary)]/10 text-[var(--color-navy)]'
                        : 'border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] hover:bg-gray-50'
                    }`}
                  >
                    {opcion.id === 'card' && <CreditCard className="w-4 h-4" />}
                    {opcion.id === 'yape' && <QrCode className="w-4 h-4" />}
                    {opcion.id === 'plin' && <Smartphone className="w-4 h-4" />}
                    {opcion.label}
                  </button>
                ))}
              </div>

              {metodo === 'card' && (
                <div className="space-y-3">
                  <label className="block space-y-1.5">
                    <span className="text-xs font-bold text-[var(--color-text-secondary)]">Número de tarjeta</span>
                    <input
                      value={numero}
                      onChange={(event) => onNumero(event.target.value)}
                      placeholder="4111 1111 1111 1111"
                      inputMode="numeric"
                      autoComplete="cc-number"
                      disabled={procesando}
                      className="w-full h-11 px-3 text-sm tracking-widest bg-gray-50 text-[var(--color-text)] border border-[var(--color-border)] rounded-xl placeholder:text-[var(--color-text-muted)] placeholder:tracking-normal focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20"
                    />
                  </label>
                  <label className="block space-y-1.5">
                    <span className="text-xs font-bold text-[var(--color-text-secondary)]">Titular</span>
                    <input
                      value={titular}
                      onChange={(event) => setTitular(event.target.value.toUpperCase())}
                      placeholder="COMPRADOR DEMO"
                      maxLength={60}
                      autoComplete="cc-name"
                      disabled={procesando}
                      className="w-full h-11 px-3 text-sm bg-gray-50 text-[var(--color-text)] border border-[var(--color-border)] rounded-xl placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20"
                    />
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block space-y-1.5">
                      <span className="text-xs font-bold text-[var(--color-text-secondary)]">Vence</span>
                      <input
                        value={vence}
                        onChange={(event) => onVence(event.target.value)}
                        placeholder="MM/AA"
                        inputMode="numeric"
                        autoComplete="cc-exp"
                        disabled={procesando}
                        className="w-full h-11 px-3 text-sm bg-gray-50 text-[var(--color-text)] border border-[var(--color-border)] rounded-xl placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20"
                      />
                    </label>
                    <label className="block space-y-1.5">
                      <span className="text-xs font-bold text-[var(--color-text-secondary)]">CVV</span>
                      <input
                        value={cvv}
                        onChange={(event) => setCvv(event.target.value.replace(/\D/g, '').slice(0, 4))}
                        placeholder="123"
                        inputMode="numeric"
                        type="password"
                        autoComplete="cc-csc"
                        disabled={procesando}
                        className="w-full h-11 px-3 text-sm bg-gray-50 text-[var(--color-text)] border border-[var(--color-border)] rounded-xl placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20"
                      />
                    </label>
                  </div>
                </div>
              )}

              {metodo === 'yape' && (
                <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-alt)] p-5 space-y-3 text-center">
                  <div className="w-40 h-40 mx-auto bg-white border-2 border-[var(--color-navy)] rounded-xl p-2.5">
                    <div className="grid w-full h-full" style={{ gridTemplateColumns: 'repeat(21, minmax(0, 1fr))' }}>
                      {qrCells.map((on, i) => (
                        <span key={i} className={on ? 'bg-[var(--color-navy)]' : 'bg-white'} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm font-bold text-[var(--color-navy)]">Escanea con tu app Yape</p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    QR simulado por SalesIA · al confirmar registramos el pago de{' '}
                    <b>{formatPrecio(order.balance)}</b>.
                  </p>
                </div>
              )}

              {metodo === 'plin' && (
                <div className="space-y-3">
                  <label className="block space-y-1.5">
                    <span className="text-xs font-bold text-[var(--color-text-secondary)]">Teléfono con Plin</span>
                    <input
                      value={telefono}
                      onChange={(event) => setTelefono(event.target.value.replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '').slice(0, 16))}
                      placeholder="999 888 777"
                      inputMode="tel"
                      autoComplete="tel"
                      disabled={procesando}
                      className="w-full h-11 px-3 text-sm bg-gray-50 text-[var(--color-text)] border border-[var(--color-border)] rounded-xl placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20"
                    />
                  </label>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Te enviaremos la confirmación a tu teléfono (simulada) por el monto de{' '}
                    <b>{formatPrecio(order.balance)}</b>.
                  </p>
                </div>
              )}

              {errorPago && (
                <div role="alert" className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs font-medium text-red-700 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorPago}</span>
                </div>
              )}

              <button
                type="button"
                onClick={() => void pagar()}
                disabled={procesando}
                className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white text-sm font-bold transition-all active:scale-[0.98] shadow-md disabled:opacity-60"
              >
                {procesando ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Procesando con la pasarela…
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Pagar {formatPrecio(order.balance)}
                  </>
                )}
              </button>

              <div className="flex items-center justify-between gap-3 text-xs">
                <Link
                  to="/cuenta"
                  className="font-bold text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
                >
                  Pagar después
                </Link>
                <span className="text-[var(--color-text-muted)]">
                  Termina en <b>0000</b> para ver un rechazo.
                </span>
              </div>
            </>
          ) : null}
        </section>

        <aside className="bg-white rounded-2xl border border-[var(--color-border)] shadow-sm p-5 h-fit space-y-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--color-metallic)]">
            Resumen del pedido
          </p>
          {order ? (
            <>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-[var(--color-text-muted)]">Pedido</span>
                  <span className="font-bold text-[var(--color-navy)]">{order.sale_number}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-[var(--color-text-muted)]">Productos</span>
                  <span className="font-bold text-[var(--color-navy)]">{order.items.length}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-[var(--color-text-muted)]">Total</span>
                  <span className="font-bold text-[var(--color-navy)]">{formatPrecio(order.total)}</span>
                </div>
                <div className="flex justify-between gap-3 border-t border-[var(--color-border)] pt-2">
                  <span className="text-[var(--color-text-secondary)] font-semibold">Saldo a pagar</span>
                  <span className="font-extrabold text-[var(--color-primary)]">{formatPrecio(order.balance)}</span>
                </div>
              </div>
              <ul className="space-y-2 border-t border-[var(--color-border)] pt-3">
                {order.items.map((item) => (
                  <li key={item.product_id} className="flex items-start justify-between gap-2 text-xs">
                    <span className="min-w-0">
                      <span className="block font-semibold text-[var(--color-text)] truncate">{item.name}</span>
                      <span className="text-[var(--color-text-muted)]">
                        {item.sku} · x{item.quantity}
                      </span>
                    </span>
                    <span className="font-bold text-[var(--color-navy)] shrink-0">
                      {formatPrecio(item.subtotal)}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 py-6 text-[var(--color-text-muted)]">
              <PackageOpen className="w-7 h-7" />
              <p className="text-xs">
                {!idValido ? 'Pedido no encontrado.' : (errorCarga ?? 'Cargando pedido…')}
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}

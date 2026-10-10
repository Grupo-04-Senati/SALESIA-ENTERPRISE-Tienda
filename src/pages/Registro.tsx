import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, UserPlus, ShieldCheck } from 'lucide-react'
import { useAuth } from '../context/auth'
import { lookupDocument } from '../services/storeApi'

type TipoDoc = 'DNI' | 'RUC'

export default function Registro() {
  const { register, customer, ready } = useAuth()
  const navigate = useNavigate()
  const [tipoDoc, setTipoDoc] = useState<TipoDoc>('DNI')
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    documento: '',
    telefono: '',
    password: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [buscando, setBuscando] = useState(false)

  useEffect(() => {
    if (ready && customer) navigate('/cuenta', { replace: true })
  }, [ready, customer, navigate])

  const cambiarTipoDoc = (tipo: TipoDoc) => {
    if (tipo === tipoDoc) return
    setTipoDoc(tipo)
    setForm((prev) => ({ ...prev, documento: '' }))
    setErrors((prev) => ({ ...prev, documento: '' }))
  }

  const setCampo = (campo: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = campo === 'telefono'
      ? e.target.value.replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '').slice(0, 16)
      : campo === 'documento'
        ? e.target.value.replace(/\D/g, '').slice(0, tipoDoc === 'DNI' ? 8 : 11)
        : e.target.value
    setForm((prev) => ({ ...prev, [campo]: value }))
    if (errors[campo]) setErrors((prev) => ({ ...prev, [campo]: '' }))
  }

  const buscarDocumento = async () => {
    const esperado = tipoDoc === 'DNI' ? 8 : 11
    if (form.documento.length !== esperado) {
      setErrors((prev) => ({ ...prev, documento: `El ${tipoDoc} debe tener ${esperado} dígitos` }))
      return
    }
    setBuscando(true)
    setErrorEnvio(null)
    try {
      const result = await lookupDocument(form.documento)
      if (result.found && result.name) {
        setForm((prev) => ({ ...prev, nombre: result.name as string }))
        setErrors((prev) => ({ ...prev, nombre: '' }))
      } else {
        setErrorEnvio('Documento no encontrado. Completa tu nombre para continuar.')
      }
    } catch {
      setErrorEnvio('No se pudo buscar el documento. Escríbelo a mano si no lo encuentras.')
    } finally {
      setBuscando(false)
    }
  }

  const validar = (): boolean => {
    const newErrors: Record<string, string> = {}
    const docEsperado = tipoDoc === 'DNI' ? 8 : 11
    if (!form.nombre.trim()) {
      newErrors.nombre = tipoDoc === 'RUC' ? 'La razón social es obligatoria' : 'El nombre es obligatorio'
    } else if (form.nombre.trim().length < 3) newErrors.nombre = 'Mínimo 3 caracteres'
    if (!form.email.trim()) newErrors.email = 'El correo es obligatorio'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) newErrors.email = 'Correo electrónico no válido'
    if (!form.documento) newErrors.documento = `El ${tipoDoc} es obligatorio`
    else if (form.documento.length !== docEsperado) {
      newErrors.documento = `El ${tipoDoc} debe tener ${docEsperado} dígitos`
    }
    if (form.telefono && !/^\+?\d{7,15}$/.test(form.telefono)) {
      newErrors.telefono = 'El teléfono debe tener entre 7 y 15 dígitos (puede empezar con +).'
    }
    if (!form.password) newErrors.password = 'La contraseña es obligatoria'
    else if (form.password.length < 8) newErrors.password = 'Mínimo 8 caracteres'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (enviando || !validar()) return
    setEnviando(true)
    setErrorEnvio(null)
    try {
      await register({
        name: form.nombre.trim(),
        email: form.email.trim(),
        document_type: tipoDoc,
        document_number: form.documento,
        phone: form.telefono || null,
        password: form.password,
      })
      navigate('/cuenta', { replace: true })
    } catch (error) {
      setErrorEnvio(error instanceof Error ? error.message : 'No se pudo crear la cuenta.')
    } finally {
      setEnviando(false)
    }
  }

  const inputClass = (campo: string) =>
    `w-full px-4 py-3.5 rounded-xl border ${
      errors[campo] ? 'border-red-500 bg-red-50' : 'border-[var(--color-border)] bg-gray-50'
    } text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[var(--color-accent)]/10 transition-all`

  return (
    <div className="bg-[var(--color-bg)] min-h-screen">
      <div className="bg-white border-b border-[var(--color-border)]">
        <div className="max-w-[1280px] mx-auto px-4 py-8 lg:py-10">
          <div className="text-[11px] font-extrabold tracking-[0.18em] uppercase text-[var(--color-accent)] mb-2 flex items-center gap-2">
            <span className="w-6 h-px bg-[var(--color-accent)]" />
            Únete a la tienda
          </div>
          <h1 className="font-extrabold text-3xl lg:text-4xl tracking-tight text-[var(--color-navy)]">
            Crear cuenta
          </h1>
        </div>
      </div>

      <div className="max-w-[440px] mx-auto px-4 py-10 lg:py-12">
        <form
          onSubmit={handleSubmit}
          className="space-y-5 bg-white p-6 lg:p-8 rounded-2xl border border-[var(--color-border)] shadow-sm"
        >
          <div>
            <span className="block text-sm font-semibold text-[var(--color-navy)] mb-1.5">
              Tipo de cuenta
            </span>
            <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Tipo de cuenta">
              {(['DNI', 'RUC'] as TipoDoc[]).map((tipo) => (
                <button
                  key={tipo}
                  type="button"
                  role="radio"
                  aria-checked={tipoDoc === tipo}
                  onClick={() => cambiarTipoDoc(tipo)}
                  className={`py-3 rounded-xl border text-sm font-bold transition-all ${
                    tipoDoc === tipo
                      ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-md'
                      : 'bg-gray-50 text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-primary)]'
                  }`}
                >
                  {tipo === 'DNI' ? 'Persona (DNI)' : 'Empresa (RUC)'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="documento" className="block text-sm font-semibold text-[var(--color-navy)] mb-1.5">
              {tipoDoc === 'RUC' ? 'RUC' : 'DNI'}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                id="documento"
                inputMode="numeric"
                value={form.documento}
                onChange={setCampo('documento')}
                autoComplete="off"
                className={inputClass('documento')}
                placeholder={tipoDoc === 'DNI' ? '8 dígitos' : '11 dígitos'}
              />
              <button
                type="button"
                onClick={buscarDocumento}
                disabled={buscando}
                title="Buscar documento en la tienda"
                className="shrink-0 px-4 rounded-xl border border-[var(--color-border)] bg-gray-50 hover:border-[var(--color-primary)] text-[var(--color-primary)] font-bold text-sm flex items-center gap-1.5 disabled:opacity-60 transition-all"
              >
                <Search className="w-4 h-4" />
                {buscando ? '…' : 'Buscar'}
              </button>
            </div>
            {errors.documento && <p className="text-red-500 text-xs font-medium mt-1">{errors.documento}</p>}
          </div>

          <div>
            <label htmlFor="nombre" className="block text-sm font-semibold text-[var(--color-navy)] mb-1.5">
              {tipoDoc === 'RUC' ? 'Razón social' : 'Nombre y apellido'}
            </label>
            <input
              type="text"
              id="nombre"
              value={form.nombre}
              onChange={setCampo('nombre')}
              maxLength={150}
              autoComplete="name"
              className={inputClass('nombre')}
              placeholder={tipoDoc === 'RUC' ? 'Nombre de la empresa' : 'Tu nombre completo'}
            />
            {errors.nombre && <p className="text-red-500 text-xs font-medium mt-1">{errors.nombre}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-[var(--color-navy)] mb-1.5">
              Correo electrónico
            </label>
            <input
              type="email"
              id="email"
              value={form.email}
              onChange={setCampo('email')}
              maxLength={160}
              autoComplete="email"
              className={inputClass('email')}
              placeholder="tu@correo.com"
            />
            {errors.email && <p className="text-red-500 text-xs font-medium mt-1">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="telefono" className="block text-sm font-semibold text-[var(--color-navy)] mb-1.5">
              Teléfono <span className="font-normal text-[var(--color-text-muted)]">(opcional)</span>
            </label>
            <input
              type="tel"
              id="telefono"
              value={form.telefono}
              onChange={setCampo('telefono')}
              maxLength={16}
              autoComplete="tel"
              className={inputClass('telefono')}
              placeholder="987654321"
            />
            {errors.telefono && <p className="text-red-500 text-xs font-medium mt-1">{errors.telefono}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-[var(--color-navy)] mb-1.5">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              value={form.password}
              onChange={setCampo('password')}
              autoComplete="new-password"
              className={inputClass('password')}
              placeholder="Mínimo 8 caracteres"
            />
            {errors.password && <p className="text-red-500 text-xs font-medium mt-1">{errors.password}</p>}
          </div>

          {errorEnvio && (
            <div role="alert" className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs font-medium text-red-700">
              {errorEnvio}
            </div>
          )}

          <button
            type="submit"
            disabled={enviando}
            className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] disabled:opacity-60 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98]"
          >
            <UserPlus className="w-5 h-5" />
            {enviando ? 'Creando cuenta…' : 'Crear cuenta'}
          </button>

          <p className="text-center text-sm text-[var(--color-text-secondary)]">
            ¿Ya tienes cuenta?{' '}
            <Link to="/ingresar" className="font-bold text-[var(--color-primary)] hover:underline">
              Ingresar
            </Link>
          </p>
        </form>

        <div className="mt-6 rounded-xl bg-[var(--color-bg-alt)] border border-[var(--color-border)] p-3 flex items-start gap-2 text-xs text-[var(--color-text-secondary)]">
          <ShieldCheck className="w-4 h-4 text-[var(--color-primary)] shrink-0 mt-0.5" />
          <span>
            ¿Compraste antes sin cuenta? Al registrarte con el mismo correo o DNI/RUC, tus pedidos
            anteriores aparecerán en tu perfil.
          </span>
        </div>
      </div>
    </div>
  )
}

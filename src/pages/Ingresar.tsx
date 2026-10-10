import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogIn, ShieldCheck } from 'lucide-react'
import { useAuth } from '../context/auth'

export default function Ingresar() {
  const { login, customer, ready } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    if (ready && customer) navigate('/cuenta', { replace: true })
  }, [ready, customer, navigate])

  const validar = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!email.trim()) newErrors.email = 'El correo es obligatorio'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) newErrors.email = 'Correo electrónico no válido'
    if (!password) newErrors.password = 'La contraseña es obligatoria'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (enviando || !validar()) return
    setEnviando(true)
    setErrorEnvio(null)
    try {
      await login(email.trim(), password)
      navigate('/cuenta', { replace: true })
    } catch (error) {
      setErrorEnvio(error instanceof Error ? error.message : 'No se pudo iniciar sesión.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="bg-[var(--color-bg)] min-h-screen">
      <div className="bg-white border-b border-[var(--color-border)]">
        <div className="max-w-[1280px] mx-auto px-4 py-8 lg:py-10">
          <div className="text-[11px] font-extrabold tracking-[0.18em] uppercase text-[var(--color-accent)] mb-2 flex items-center gap-2">
            <span className="w-6 h-px bg-[var(--color-accent)]" />
            Tu cuenta en la tienda
          </div>
          <h1 className="font-extrabold text-3xl lg:text-4xl tracking-tight text-[var(--color-navy)]">
            Ingresar
          </h1>
        </div>
      </div>

      <div className="max-w-[440px] mx-auto px-4 py-10 lg:py-12">
        <form
          onSubmit={handleSubmit}
          className="space-y-5 bg-white p-6 lg:p-8 rounded-2xl border border-[var(--color-border)] shadow-sm"
        >
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-[var(--color-navy)] mb-1.5">
              Correo electrónico
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (errors.email) setErrors((prev) => ({ ...prev, email: '' }))
              }}
              maxLength={160}
              autoComplete="email"
              className={`w-full px-4 py-3.5 rounded-xl border ${
                errors.email ? 'border-red-500 bg-red-50' : 'border-[var(--color-border)] bg-gray-50'
              } text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[var(--color-accent)]/10 transition-all`}
              placeholder="tu@correo.com"
            />
            {errors.email && <p className="text-red-500 text-xs font-medium mt-1">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-[var(--color-navy)] mb-1.5">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (errors.password) setErrors((prev) => ({ ...prev, password: '' }))
              }}
              autoComplete="current-password"
              className={`w-full px-4 py-3.5 rounded-xl border ${
                errors.password ? 'border-red-500 bg-red-50' : 'border-[var(--color-border)] bg-gray-50'
              } text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[var(--color-accent)]/10 transition-all`}
              placeholder="Tu contraseña"
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
            <LogIn className="w-5 h-5" />
            {enviando ? 'Ingresando…' : 'Ingresar'}
          </button>

          <p className="text-center text-sm text-[var(--color-text-secondary)]">
            ¿Aún no tienes cuenta?{' '}
            <Link to="/registro" className="font-bold text-[var(--color-primary)] hover:underline">
              Regístrate
            </Link>
          </p>
        </form>

        <div className="mt-6 rounded-xl bg-[var(--color-bg-alt)] border border-[var(--color-border)] p-3 flex items-start gap-2 text-xs text-[var(--color-text-secondary)]">
          <ShieldCheck className="w-4 h-4 text-[var(--color-primary)] shrink-0 mt-0.5" />
          <span>
            Con tu cuenta puedes ver tus pedidos y cuándo el equipo confirmó la entrega de cada
            producto.
          </span>
        </div>
      </div>
    </div>
  )
}

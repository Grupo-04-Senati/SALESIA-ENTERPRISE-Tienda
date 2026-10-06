import { useState } from 'react'
import { Send, CheckCircle } from 'lucide-react'
import { sendContactMessage } from '../../services/storeApi'

export default function ContactForm() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    mensaje: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [enviado, setEnviado] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null)

  const validar = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio'
    } else if (formData.nombre.trim().length > 80) {
      newErrors.nombre = 'Máximo 80 caracteres'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El correo es obligatorio'
    } else if (formData.email.trim().length > 50) {
      newErrors.email = 'Máximo 50 caracteres'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Correo electrónico no válido'
    }

    const telLimpio = formData.telefono.replace(/\s/g, '')
    if (!telLimpio) {
      newErrors.telefono = 'El teléfono es obligatorio'
    } else if (!/^\d{9}$/.test(telLimpio)) {
      newErrors.telefono = 'Debe tener exactamente 9 dígitos'
    }

    if (!formData.mensaje.trim()) {
      newErrors.mensaje = 'El mensaje es obligatorio'
    } else if (formData.mensaje.trim().length < 10) {
      newErrors.mensaje = 'Mínimo 10 caracteres'
    } else if (formData.mensaje.trim().length > 2000) {
      newErrors.mensaje = 'Máximo 2000 caracteres'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validar()) return
    setEnviando(true)
    setErrorEnvio(null)
    try {
      await sendContactMessage({
        name: formData.nombre.trim(),
        email: formData.email.trim(),
        phone: formData.telefono,
        message: formData.mensaje.trim(),
      })
      setEnviado(true)
      setFormData({ nombre: '', email: '', telefono: '', mensaje: '' })
    } catch (error) {
      setErrorEnvio(error instanceof Error ? error.message : 'No se pudo enviar el mensaje.')
    } finally {
      setEnviando(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    if (name === 'telefono') {
      const digitsOnly = value.replace(/\D/g, '').slice(0, 9)
      setFormData(prev => ({ ...prev, telefono: digitsOnly }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  return (
    <div>
      <h2 className="text-[var(--text-xl)] font-[var(--font-heading)] font-semibold text-[var(--color-navy)] mb-6">
        Envíanos un mensaje
      </h2>

      {enviado ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center shadow-sm">
          <CheckCircle className="w-14 h-14 mx-auto text-green-500 mb-4" />
          <h3 className="text-xl font-semibold text-green-800 mb-2">¡Mensaje enviado!</h3>
          <p className="text-green-600">
            Gracias por contactarnos. Te responderemos en un máximo de 2 horas hábiles.
          </p>
          <button
            onClick={() => setEnviado(false)}
            className="mt-6 text-green-700 underline hover:no-underline font-medium"
          >
            Enviar otro mensaje
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5 bg-white p-6 lg:p-8 rounded-2xl border border-[var(--color-border)] shadow-sm">
          <div>
            <label htmlFor="nombre" className="block text-sm font-semibold text-[var(--color-navy)] mb-1.5">
              Nombre completo *
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              maxLength={80}
              className={`w-full px-4 py-3.5 rounded-xl border ${
                errors.nombre ? 'border-red-500 bg-red-50' : 'border-[var(--color-border)] bg-gray-50'
              } text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[var(--color-accent)]/10 transition-all`}
              placeholder="Tu nombre completo"
            />
            <div className="flex justify-between mt-1">
              {errors.nombre ? (
                <p className="text-red-500 text-xs font-medium">{errors.nombre}</p>
              ) : <span />}
              <span className="text-xs text-[var(--color-text-muted)]">{formData.nombre.length}/80</span>
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-[var(--color-navy)] mb-1.5">
              Correo electrónico *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              maxLength={50}
              className={`w-full px-4 py-3.5 rounded-xl border ${
                errors.email ? 'border-red-500 bg-red-50' : 'border-[var(--color-border)] bg-gray-50'
              } text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[var(--color-accent)]/10 transition-all`}
              placeholder="tu@correo.com"
            />
            <div className="flex justify-between mt-1">
              {errors.email ? (
                <p className="text-red-500 text-xs font-medium">{errors.email}</p>
              ) : <span />}
              <span className="text-xs text-[var(--color-text-muted)]">{formData.email.length}/50</span>
            </div>
          </div>

          <div>
            <label htmlFor="telefono" className="block text-sm font-semibold text-[var(--color-navy)] mb-1.5">
              Teléfono *
            </label>
            <div className="flex items-center">
              <span className="flex items-center justify-center px-4 py-3.5 rounded-l-xl border border-r-0 border-[var(--color-border)] bg-gray-100 text-sm font-bold text-[var(--color-navy)] select-none">
                +51
              </span>
              <input
                type="tel"
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                maxLength={9}
                className={`w-full px-4 py-3.5 rounded-r-xl border ${
                  errors.telefono ? 'border-red-500 bg-red-50' : 'border-[var(--color-border)] bg-gray-50'
                } text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[var(--color-accent)]/10 transition-all`}
                placeholder="944444444"
              />
            </div>
            <div className="flex justify-between mt-1">
              {errors.telefono ? (
                <p className="text-red-500 text-xs font-medium">{errors.telefono}</p>
              ) : <span />}
              <span className="text-xs text-[var(--color-text-muted)]">{formData.telefono.length}/9</span>
            </div>
          </div>

          <div>
            <label htmlFor="mensaje" className="block text-sm font-semibold text-[var(--color-navy)] mb-1.5">
              Mensaje *
            </label>
            <textarea
              id="mensaje"
              name="mensaje"
              value={formData.mensaje}
              onChange={handleChange}
              rows={5}
              maxLength={2000}
              className={`w-full px-4 py-3.5 rounded-xl border ${
                errors.mensaje ? 'border-red-500 bg-red-50' : 'border-[var(--color-border)] bg-gray-50'
              } text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[var(--color-accent)]/10 transition-all resize-none`}
              placeholder="Cuéntanos en qué podemos ayudarte..."
            />
            <div className="flex justify-between mt-1">
              {errors.mensaje ? (
                <p className="text-red-500 text-xs font-medium">{errors.mensaje}</p>
              ) : <span />}
              <span className="text-xs text-[var(--color-text-muted)]">{formData.mensaje.length}/2000</span>
            </div>
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
            <Send className="w-5 h-5" />
            {enviando ? 'Enviando a SalesIA…' : 'Enviar mensaje'}
          </button>
        </form>
      )}
    </div>
  )
}

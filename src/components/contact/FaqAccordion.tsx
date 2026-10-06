import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const FAQ_DATA = [
  {
    pregunta: '¿Cómo puedo cotizar un producto al por mayor?',
    respuesta: 'Cada producto incluye un botón "Cotizar por WhatsApp" que te redirige directamente a nuestro canal de atención, donde un asesor especializado te brindará atención personalizada para ayudarte a armar tu pedido al por mayor, confirmar stock disponible y coordinar las condiciones de pago y envío.',
  },
  {
    pregunta: '¿Puedo recoger mi pedido en tienda?',
    respuesta: 'Sí, puedes hacer tu pedido y recogerlo en nuestra tienda ubicada en Zapallal, Puente Piedra, Lima. Te notificaremos cuando esté listo para que pases por él.',
  },
  {
    pregunta: '¿Realizan envíos a todo el Perú?',
    respuesta: 'Sí, realizamos envíos a todos los departamentos del Perú. El costo y el tiempo de entrega varían según la distancia. Contáctanos para más detalles.',
  },
]

export default function FaqAccordion() {
  const [faqAbierto, setFaqAbierto] = useState<number | null>(null)

  return (
    <div>
      <h2 className="text-[var(--text-xl)] font-[var(--font-heading)] font-semibold text-[var(--color-navy)] mb-5">
        Preguntas frecuentes
      </h2>
      <div className="space-y-3">
        {FAQ_DATA.map((faq, index) => (
          <div
            key={index}
            className="bg-white rounded-xl border border-[var(--color-border)] overflow-hidden shadow-sm"
          >
            <button
              onClick={() => setFaqAbierto(faqAbierto === index ? null : index)}
              aria-expanded={faqAbierto === index}
              className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
            >
              <span className="font-semibold text-[var(--color-navy)] pr-4">{faq.pregunta}</span>
              <ChevronDown
                className={`w-5 h-5 text-[var(--color-accent)] shrink-0 transition-transform duration-300 ${
                  faqAbierto === index ? 'rotate-180' : ''
                }`}
              />
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ${
                faqAbierto === index ? 'max-h-40 opacity-100 border-t border-[var(--color-border)]' : 'max-h-0 opacity-0'
              }`}
            >
              <p className="p-5 text-[14.5px] text-[var(--color-text-secondary)] leading-relaxed bg-gray-50/50">
                {faq.respuesta}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

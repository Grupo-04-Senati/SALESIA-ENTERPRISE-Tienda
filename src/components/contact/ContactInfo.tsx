import { Phone, MapPin, Clock, Mail } from 'lucide-react'

const MAPS_EMBED = 'https://maps.google.com/maps?q=-11.846935%2C-77.100032&z=15&output=embed'
const MAPS_LINK = 'https://maps.app.goo.gl/iPfndhjAS55FZR2K7'

export default function ContactInfo() {
  return (
    <div className="bg-white rounded-2xl border border-[var(--color-border)] p-6 lg:p-8 mb-8 shadow-sm">
      <h2 className="text-[var(--text-xl)] font-[var(--font-heading)] font-semibold text-[var(--color-navy)] mb-6">
        Información de contacto
      </h2>
      <ul className="space-y-5">
        <li className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-[var(--color-bg-alt)] flex items-center justify-center shrink-0">
            <Phone className="w-5 h-5 text-[var(--color-primary)]" />
          </div>
          <div className="pt-0.5">
            <p className="font-bold text-[var(--color-navy)] text-[15px]">+51 966 666 666</p>
            <p className="font-bold text-[var(--color-navy)] text-[15px] mt-1">+51 944 444 444</p>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">Atención vía WhatsApp y llamadas</p>
          </div>
        </li>
        <li className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-[var(--color-bg-alt)] flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5 text-[var(--color-primary)]" />
          </div>
          <div className="pt-0.5">
            <p className="font-bold text-[var(--color-navy)] text-[15px]">Zapallal, Puente Piedra, Lima 15122</p>
            <p className="text-sm text-[var(--color-text-muted)] mt-0.5">Coordenadas: -11.846935, -77.100032</p>
          </div>
        </li>
        <li className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-[var(--color-bg-alt)] flex items-center justify-center shrink-0">
            <Mail className="w-5 h-5 text-[var(--color-primary)]" />
          </div>
          <div className="pt-0.5">
            <p className="font-bold text-[var(--color-navy)] text-[15px]">contacto@salesia.com</p>
            <p className="text-sm text-[var(--color-text-muted)] mt-0.5">Consultas y cotizaciones</p>
          </div>
        </li>
        <li className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-[var(--color-bg-alt)] flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-[var(--color-primary)]" />
          </div>
          <div className="pt-0.5">
            <p className="font-bold text-[var(--color-navy)] text-[15px]">Horario de atención</p>
            <p className="text-sm text-[var(--color-text-muted)] mt-0.5">Lunes a Sábado: 8:00 - 18:00</p>
          </div>
        </li>
      </ul>

      <div className="mt-8 rounded-xl overflow-hidden border border-[var(--color-border)] h-[280px] shadow-inner relative bg-gray-100">
        <iframe
          src={MAPS_EMBED}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen={false}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Ubicación Zapallal, Puente Piedra"
          className="absolute inset-0"
        />
      </div>
      <a
        href={MAPS_LINK}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white text-sm font-bold shadow-sm transition-all active:scale-[0.98]"
      >
        <MapPin className="w-4 h-4" /> Abrir en Google Maps
      </a>
    </div>
  )
}

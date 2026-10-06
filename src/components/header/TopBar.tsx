import { Phone, MapPin, Mail } from 'lucide-react'

export default function TopBar() {
  return (
    <div className="bg-[var(--color-dark)] border-b border-white/10">
      <div className="max-w-[1280px] mx-auto px-4 h-[34px] flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-4">
          <a href="tel:+51966666666" className="flex items-center gap-1.5 text-white hover:text-[var(--color-light-blue)] transition-colors">
            <Phone className="w-3 h-3 text-[var(--color-accent)]" />
            <span className="tracking-wide">+51 966 666 666</span>
          </a>
          <a href="tel:+51944444444" className="flex items-center gap-1.5 text-white hover:text-[var(--color-light-blue)] transition-colors">
            <span className="w-px h-3 bg-white/15" />
            <Phone className="w-3 h-3 text-[var(--color-accent)]" />
            <span className="tracking-wide">+51 944 444 444</span>
          </a>
          <span className="hidden md:flex items-center gap-1.5 text-white/60">
            <span className="w-px h-3 bg-white/15" />
            <MapPin className="w-3 h-3" />
            Zapallal, Puente Piedra, Lima 15122
          </span>
          <span className="hidden lg:flex items-center gap-1.5 text-white/60">
            <span className="w-px h-3 bg-white/15" />
            <Mail className="w-3 h-3" />
            contacto@salesia.com
          </span>
        </div>
      </div>
    </div>
  )
}

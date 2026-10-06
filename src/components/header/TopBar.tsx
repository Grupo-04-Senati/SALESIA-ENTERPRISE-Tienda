import { Phone, MapPin, Mail } from 'lucide-react'

function FacebookIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

function InstagramIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  )
}

function TikTokIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
      <path d="M16.708 0.027c1.745-0.027 3.48-0.011 5.213-0.027 0.105 2.041 0.839 4.12 2.333 5.563 1.491 1.479 3.6 2.156 5.652 2.385v5.369c-1.923-0.063-3.855-0.463-5.6-1.291-0.76-0.344-1.468-0.787-2.161-1.24-0.009 3.896 0.016 7.787-0.025 11.667-0.104 1.864-0.719 3.719-1.803 5.255-1.744 2.557-4.771 4.224-7.88 4.276-1.907 0.109-3.812-0.411-5.437-1.369-2.693-1.588-4.588-4.495-4.864-7.615-0.032-0.667-0.043-1.333-0.016-1.984 0.24-2.537 1.495-4.964 3.443-6.615 2.208-1.923 5.301-2.839 8.197-2.297 0.027 1.975-0.052 3.948-0.052 5.923-1.323-0.428-2.869-0.308-4.025 0.495-0.844 0.547-1.485 1.385-1.819 2.333-0.276 0.676-0.197 1.427-0.181 2.145 0.317 2.188 2.421 4.027 4.667 3.828 1.489-0.016 2.916-0.88 3.692-2.145 0.251-0.443 0.532-0.896 0.547-1.417 0.131-2.385 0.079-4.76 0.095-7.145 0.011-5.375-0.016-10.735 0.025-16.093z" />
    </svg>
  )
}

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
            salamalecucabomcabom@gmail.com
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-white/45 text-[10px] uppercase tracking-[0.14em]">Síguenos</span>
          <div className="flex items-center gap-2">
            <a href="#" className="text-white hover:text-[#1877F2] transition-colors" aria-label="Facebook">
              <FacebookIcon className="w-4 h-4" />
            </a>
            <a href="#" className="text-white hover:text-[#E1306C] transition-colors" aria-label="Instagram">
              <InstagramIcon className="w-4 h-4" />
            </a>
            <a href="#" className="text-white hover:text-white/80 transition-colors" aria-label="TikTok">
              <TikTokIcon className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

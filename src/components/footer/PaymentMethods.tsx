import { ShieldCheck } from 'lucide-react'

export default function PaymentMethods() {
  return (
    <div>
      <h3 className="font-bold text-xs tracking-[0.16em] uppercase text-white mb-4 flex items-center gap-2">
        <span className="w-5 h-px bg-[var(--color-accent)]" />
        Garantía
      </h3>
      <div className="rounded-xl bg-white/5 border border-white/10 p-4 flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-[var(--color-accent)] flex items-center justify-center shrink-0 shadow-md shadow-[var(--color-accent)]/30">
          <ShieldCheck className="w-5 h-5 text-white" />
        </div>
        <div className="text-xs leading-tight">
          <div className="font-bold text-white">Compra 100% segura</div>
          <div className="text-white/60 mt-0.5">Garantía oficial y boleta/factura</div>
        </div>
      </div>
    </div>
  )
}

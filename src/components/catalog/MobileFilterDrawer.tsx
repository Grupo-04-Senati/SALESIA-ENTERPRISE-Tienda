import { X } from 'lucide-react'
import SidebarFilters from '../SidebarFilters'
import type { Category, Filters } from '../../types'

interface MobileFilterDrawerProps {
  open: boolean
  onClose: () => void
  filters: Filters
  categorias: Pick<Category, 'id' | 'nombre'>[]
  marcas: string[]
  precioMax: number
  onChange: (f: Filters) => void
  onClear: () => void
}

export default function MobileFilterDrawer({
  open,
  onClose,
  filters,
  categorias,
  marcas,
  precioMax,
  onChange,
  onClear,
}: MobileFilterDrawerProps) {
  if (!open) return null

  return (
    <div className="md:hidden fixed inset-0 z-50 bg-[#0D0D0D]/60 backdrop-blur-sm" onClick={onClose}>
      <div className="absolute right-0 top-0 h-full w-80 max-w-full bg-white p-5 overflow-y-auto border-l border-[var(--color-border)] shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-extrabold text-[var(--color-navy)] text-lg">Filtros</h3>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-[var(--color-text-secondary)] hover:bg-gray-200 transition-colors" aria-label="Cerrar filtros">
            <X className="w-5 h-5" />
          </button>
        </div>
        <SidebarFilters
          filters={filters}
          categorias={categorias}
          marcas={marcas}
          precioMax={precioMax}
          onChange={onChange}
          onClear={onClear}
        />
        <button
          onClick={onClose}
          className="mt-6 w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white py-3.5 rounded-xl font-bold shadow-md transition-all active:scale-[0.98]"
        >
          Ver resultados
        </button>
      </div>
    </div>
  )
}

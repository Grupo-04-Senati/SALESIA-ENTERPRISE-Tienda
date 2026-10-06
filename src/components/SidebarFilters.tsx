import type { Category, Filters } from '../types'

interface Props {
  filters: Filters
  categorias: Pick<Category, 'id' | 'nombre'>[]
  marcas: string[]
  precioMax: number
  onChange: (filters: Filters) => void
  onClear: () => void
}

export default function SidebarFilters({ filters, categorias, marcas, precioMax, onChange, onClear }: Props) {
  const toggleCategoria = (catId: string) => {
    const updated = filters.categorias.includes(catId)
      ? filters.categorias.filter(c => c !== catId)
      : [...filters.categorias, catId]
    onChange({ ...filters, categorias: updated })
  }

  const toggleMarca = (marca: string) => {
    const updated = filters.marcas.includes(marca)
      ? filters.marcas.filter(m => m !== marca)
      : [...filters.marcas, marca]
    onChange({ ...filters, marcas: updated })
  }

  const handlePrecioMin = (value: string) => {
    onChange({ ...filters, precioMin: Number(value) || 0 })
  }

  const handlePrecioMax = (value: string) => {
    onChange({ ...filters, precioMax: Number(value) || precioMax })
  }

  const handleDisponibilidad = () => {
    onChange({ ...filters, disponible: !filters.disponible })
  }

  const hasActiveFilters =
    filters.categorias.length > 0 ||
    filters.marcas.length > 0 ||
    filters.precioMin > 0 ||
    filters.precioMax < precioMax ||
    filters.disponible

  return (
    <aside className="bg-white rounded-2xl border border-[var(--color-border)] p-5 space-y-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-[var(--color-navy)]">Filtros</h3>
        {hasActiveFilters && (
          <button
            onClick={onClear}
            className="text-xs text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] hover:underline transition-colors font-medium"
          >
            Limpiar todo
          </button>
        )}
      </div>

      {/* Categorías */}
      <div>
        <h4 className="text-sm font-bold text-[var(--color-navy)] mb-3 uppercase tracking-[0.12em] text-[11px]">Categoría</h4>
        <div className="space-y-2">
          {categorias.map(cat => (
            <label key={cat.id} className="flex items-center gap-2.5 text-sm text-[var(--color-text-secondary)] cursor-pointer hover:text-[var(--color-primary)] transition-colors group font-medium">
              <input
                type="checkbox"
                checked={filters.categorias.includes(cat.id)}
                onChange={() => toggleCategoria(cat.id)}
                className="w-4 h-4 rounded accent-[var(--color-accent)] bg-white border-[var(--color-border-strong)] cursor-pointer"
              />
              <span>{cat.nombre}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Marcas */}
      <div>
        <h4 className="text-sm font-bold text-[var(--color-navy)] mb-3 uppercase text-[11px] tracking-[0.12em]">Marca</h4>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
          {marcas.map(marca => (
            <label key={marca} className="flex items-center gap-2.5 text-sm text-[var(--color-text-secondary)] cursor-pointer hover:text-[var(--color-primary)] transition-colors group font-medium">
              <input
                type="checkbox"
                checked={filters.marcas.includes(marca)}
                onChange={() => toggleMarca(marca)}
                className="w-4 h-4 rounded accent-[var(--color-accent)] bg-white border-[var(--color-border-strong)] cursor-pointer"
              />
              <span>{marca}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Precio */}
      <div>
        <h4 className="text-sm font-bold text-[var(--color-navy)] mb-3 uppercase text-[11px] tracking-[0.12em]">Rango de precio</h4>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            value={filters.precioMin}
            onChange={(e) => handlePrecioMin(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-gray-50 text-[var(--color-text)] border border-[var(--color-border)] rounded-xl placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20 transition-all"
            placeholder="Min"
          />
          <span className="text-[var(--color-text-muted)]">-</span>
          <input
            type="number"
            min={0}
            value={filters.precioMax}
            onChange={(e) => handlePrecioMax(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-gray-50 text-[var(--color-text)] border border-[var(--color-border)] rounded-xl placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20 transition-all"
            placeholder="Max"
          />
        </div>
      </div>

      {/* Disponibilidad */}
      <div>
        <label className="flex items-center gap-2.5 text-sm text-[var(--color-text-secondary)] cursor-pointer hover:text-[var(--color-primary)] transition-colors group font-medium border-t border-[var(--color-border)] pt-5 mt-5">
          <input
            type="checkbox"
            checked={filters.disponible}
            onChange={handleDisponibilidad}
            className="w-4 h-4 rounded accent-[var(--color-accent)] bg-white border-[var(--color-border-strong)] cursor-pointer"
          />
          <span>Solo disponibles</span>
        </label>
      </div>
    </aside>
  )
}

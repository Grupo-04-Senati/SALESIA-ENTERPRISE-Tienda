import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import type { Product, CartItem } from '../types'

interface CartContextType {
  items: CartItem[]
  isOpen: boolean
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  updateCantidad: (productId: string, cantidad: number) => void
  clearCart: () => void
  toggleCart: () => void
  totalItems: number
  subtotal: number
}

const CartContext = createContext<CartContextType | null>(null)

/** Sanea el carrito persistido: descarta entradas incompletas y normaliza campos. */
function sanitizeItems(raw: unknown): CartItem[] {
  if (!Array.isArray(raw)) return []
  const items: CartItem[] = []
  for (const entry of raw) {
    if (!entry || typeof entry !== 'object') continue
    const { product, cantidad } = entry as { product?: Partial<Product>; cantidad?: unknown }
    if (!product || typeof product !== 'object') continue
    const id = product.id == null ? '' : String(product.id)
    const precio = Number(product.precio)
    const stock = Number(product.stock)
    const qty = Number(cantidad)
    if (!id || !Number.isFinite(precio) || precio < 0) continue
    if (!Number.isFinite(qty) || qty <= 0) continue
    items.push({
      product: {
        id,
        sku: typeof product.sku === 'string' ? product.sku : '',
        nombre: typeof product.nombre === 'string' && product.nombre ? product.nombre : id,
        descripcion: typeof product.descripcion === 'string' ? product.descripcion : '',
        categoria: typeof product.categoria === 'string' ? product.categoria : '',
        marca: typeof product.marca === 'string' ? product.marca : '',
        precio,
        precioMayorista: typeof product.precioMayorista === 'number' ? product.precioMayorista : null,
        precioAnterior: typeof product.precioAnterior === 'number' ? product.precioAnterior : null,
        stock: Number.isFinite(stock) && stock >= 0 ? stock : 0,
        imagenes: Array.isArray(product.imagenes)
          ? product.imagenes.filter((img): img is string => typeof img === 'string')
          : [],
        destacado: product.destacado === true,
        etiquetas: Array.isArray(product.etiquetas) ? product.etiquetas : [],
        especificaciones:
          product.especificaciones && typeof product.especificaciones === 'object'
            ? product.especificaciones
            : {},
      },
      cantidad: Math.max(1, Math.floor(qty)),
    })
  }
  return items
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('salesia_cart_items') ?? localStorage.getItem('chamo_cart_items')
      if (saved) {
        return sanitizeItems(JSON.parse(saved))
      }
    } catch (e) {
      console.error('Failed to parse cart items from local storage', e)
    }
    return []
  })
  
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem('salesia_cart_items', JSON.stringify(items))
    } catch (e) {
      console.error('Failed to save cart items to local storage', e)
    }
  }, [items])

  const addItem = useCallback((product: Product) => {
    if (product.stock <= 0) return
    setItems(prev => {
      const existing = prev.find(item => item.product.id === product.id)
      if (existing) {
        const newCantidad = existing.cantidad + 1
        if (newCantidad > product.stock) return prev
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, cantidad: newCantidad }
            : item
        )
      }
      return [...prev, { product, cantidad: 1 }]
    })
    setIsOpen(true)
  }, [])

  const removeItem = useCallback((productId: string) => {
    setItems(prev => prev.filter(item => item.product.id !== productId))
  }, [])

  const updateCantidad = useCallback((productId: string, cantidad: number) => {
    if (cantidad <= 0) {
      setItems(prev => prev.filter(item => item.product.id !== productId))
      return
    }
    setItems(prev =>
      prev.map(item =>
        item.product.id === productId
          ? { ...item, cantidad: Math.min(cantidad, item.product.stock) }
          : item
      )
    )
  }, [])

  const clearCart = useCallback(() => setItems([]), [])
  const toggleCart = useCallback(() => setIsOpen(prev => !prev), [])

  const totalItems = items.reduce((sum, item) => sum + item.cantidad, 0)
  const subtotal = items.reduce((sum, item) => sum + item.product.precio * item.cantidad, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        addItem,
        removeItem,
        updateCantidad,
        clearCart,
        toggleCart,
        totalItems,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

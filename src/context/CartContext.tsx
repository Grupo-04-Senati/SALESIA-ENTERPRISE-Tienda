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

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('salesia_cart_items') ?? localStorage.getItem('chamo_cart_items')
      if (saved) {
        return JSON.parse(saved)
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

import { createContext, useContext } from 'react'
import type { StoreCustomer, StoreRegisterPayload } from '../services/storeApi'

export interface AuthContextType {
  customer: StoreCustomer | null
  ready: boolean
  login: (email: string, password: string) => Promise<StoreCustomer>
  register: (payload: StoreRegisterPayload) => Promise<StoreCustomer>
  logout: () => void
}

export const AuthContext = createContext<AuthContextType | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

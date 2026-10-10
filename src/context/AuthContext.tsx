import { useState, useEffect, useCallback, type ReactNode } from 'react'
import type { StoreCustomer, StoreRegisterPayload } from '../services/storeApi'
import {
  fetchStoreMe,
  getStoreToken,
  loginStoreAccount,
  registerStoreAccount,
  setStoreToken,
} from '../services/storeApi'
import type { ServiceError } from '../services/productService'
import { AuthContext, type AuthContextType } from './auth'

const CUSTOMER_KEY = 'salesia_store_customer'

function loadCustomer(): StoreCustomer | null {
  try {
    const raw = localStorage.getItem(CUSTOMER_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<StoreCustomer>
    if (parsed && typeof parsed.id === 'number' && typeof parsed.name === 'string') {
      return parsed as StoreCustomer
    }
  } catch {
    /* sesión guardada inválida */
  }
  return null
}

function saveCustomer(customer: StoreCustomer | null) {
  try {
    if (customer) localStorage.setItem(CUSTOMER_KEY, JSON.stringify(customer))
    else localStorage.removeItem(CUSTOMER_KEY)
  } catch {
    /* almacenamiento no disponible */
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<StoreCustomer | null>(loadCustomer)
  const [ready, setReady] = useState(() => getStoreToken() === null)

  useEffect(() => {
    if (!getStoreToken()) return
    let cancelled = false
    fetchStoreMe()
      .then((me) => {
        if (cancelled) return
        setCustomer(me)
        saveCustomer(me)
      })
      .catch((error: unknown) => {
        if (cancelled) return
        if ((error as ServiceError).code === 'UNAUTHORIZED') {
          setStoreToken(null)
          setCustomer(null)
          saveCustomer(null)
        }
      })
      .finally(() => {
        if (!cancelled) setReady(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const result = await loginStoreAccount({ email, password })
    setCustomer(result.customer)
    saveCustomer(result.customer)
    return result.customer
  }, [])

  const register = useCallback(async (payload: StoreRegisterPayload) => {
    const result = await registerStoreAccount(payload)
    setCustomer(result.customer)
    saveCustomer(result.customer)
    return result.customer
  }, [])

  const logout = useCallback(() => {
    setStoreToken(null)
    setCustomer(null)
    saveCustomer(null)
  }, [])

  const value: AuthContextType = { customer, ready, login, register, logout }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

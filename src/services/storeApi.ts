import { createServiceError } from './productService'

/**
 * Cliente del storefront público de SalesIA (`/api/v1/store/*`).
 * Se usa para enviar el carrito como cotización real al sistema.
 */

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/+$/, '') ?? '';

const TOKEN_KEY = 'salesia_store_token';

export const getStoreToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setStoreToken = (token: string | null): void => {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* almacenamiento no disponible */
  }
};

function storeHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  const token = getStoreToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export interface StoreQuoteItem {
  product_id: number;
  quantity: number;
}

export interface StoreQuotePayload {
  customer: {
    name: string;
    phone?: string | null;
    email?: string | null;
  };
  items: StoreQuoteItem[];
  notes?: string;
}

export interface StoreQuoteResult {
  id: number;
  quote_number: string;
  customer_name: string;
  subtotal: number;
  tax: number;
  total: number;
  item_count: number;
  status?: string;
  sale_id?: number;
  sale_number?: string;
}

export const isStoreApiConfigured = (): boolean => API_BASE.length > 0;

/** Envía el carrito al API de SalesIA y devuelve la cotización creada. */
export async function sendStoreQuote(payload: StoreQuotePayload): Promise<StoreQuoteResult> {
  if (!API_BASE) {
    throw createServiceError('El sistema de SalesIA no está disponible ahora.', 'NO_API');
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE}/api/v1/store/quotes`, {
      method: 'POST',
      headers: storeHeaders(),
      body: JSON.stringify(payload),
    });
    if (response.status === 401 && getStoreToken()) {
      setStoreToken(null);
      response = await fetch(`${API_BASE}/api/v1/store/quotes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });
    }
  } catch {
    throw createServiceError('No se pudo conectar con SalesIA. Inténtalo de nuevo.', 'NETWORK_ERROR');
  }

  const body = (await response.json().catch(() => null)) as
    | {
        quote_number?: string;
        message?: string;
        detail?: { field?: string; issue?: string }[];
      }
    | null;

  if (!response.ok || !body?.quote_number) {
    throw createServiceError(
      describeApiError(body, 'No se pudo generar la cotización.'),
      body?.message ? 'API_ERROR' : 'VALIDATION_ERROR',
    );
  }
  return body as unknown as StoreQuoteResult;
}

const FIELD_LABELS: Record<string, string> = {
  'body.customer.name': 'Nombre',
  'body.customer.phone': 'Teléfono',
  'body.customer.email': 'Correo',
  'body.items': 'Productos',
  'body.name': 'Nombre',
  'body.email': 'Correo',
  'body.phone': 'Teléfono',
  'body.password': 'Contraseña',
  'body.message': 'Mensaje',
  body: 'Datos enviados',
};

const ISSUE_TRANSLATIONS: [RegExp, string][] = [
  [/at most (\d+) characters/i, 'máximo $1 caracteres'],
  [/at least (\d+) characters/i, 'mínimo $1 caracteres'],
  [/not a valid integer|greater than or equal to 1/i, 'no es válido'],
  [/not a valid email/i, 'no es un correo válido'],
  [/should match pattern.*\d\{7,15\}.*$/i, 'debe tener entre 7 y 15 dígitos (puede empezar con +)'],
];

/** Traduce el error 422 del API a un mensaje entendible para el cliente. */
function describeApiError(
  body: { message?: string; detail?: { field?: string; issue?: string }[] } | null,
  fallback = 'No se pudo completar la operación.',
): string {
  const first = body?.detail?.[0];
  if (!first?.issue) return body?.message ?? fallback;

  const label = Object.entries(FIELD_LABELS).find(([key]) => (first.field ?? '').endsWith(key))?.[1];
  let issue = first.issue;
  for (const [pattern, replacement] of ISSUE_TRANSLATIONS) {
    issue = issue.replace(pattern, replacement);
  }
  const detail = label ? `${label}: ${issue.charAt(0).toLowerCase()}${issue.slice(1)}` : issue;
  return body?.message ? `${body.message} ${detail}` : detail;
}

export interface StoreContactPayload {
  name: string;
  email: string;
  phone: string;
  message: string;
}

/** Envía el formulario de contacto de la tienda a SalesIA (POST /store/contact). */
export async function sendContactMessage(payload: StoreContactPayload): Promise<void> {
  if (!API_BASE) {
    throw createServiceError('El sistema de SalesIA no está disponible ahora.', 'NO_API');
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE}/api/v1/store/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    throw createServiceError('No se pudo conectar con SalesIA. Inténtalo de nuevo.', 'NETWORK_ERROR');
  }

  const body = (await response.json().catch(() => null)) as
    | { message?: string; detail?: { field?: string; issue?: string }[] }
    | null;
  if (!response.ok) {
    throw createServiceError(
      describeApiError(body, 'No se pudo enviar el mensaje.'),
      body?.message ? 'API_ERROR' : 'VALIDATION_ERROR',
    );
  }
}

export interface StoreCustomer {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  document_number: string;
  segment: string;
  created_at: string;
}

export interface StoreAuthResult {
  access_token: string;
  token_type: string;
  customer: StoreCustomer;
}

export interface StoreRegisterPayload {
  name: string;
  email: string;
  phone?: string | null;
  password: string;
}

export interface StoreOrderItem {
  product_id: number;
  sku: string;
  name: string;
  quantity: number;
  unit_price: number;
  discount: number;
  subtotal: number;
}

export interface StoreClaim {
  id: number;
  sale_id: number;
  description: string;
  status: 'pendiente' | 'atendida';
  created_at: string;
  resolved_at: string | null;
}

export interface StorePayment {
  id: number;
  method: string;
  amount: number;
  paid_at: string;
  reference: string | null;
}

export interface StoreOrder {
  id: number;
  sale_number: string;
  issued_at: string;
  status: 'pending' | 'partial' | 'paid' | 'cancelled';
  items: StoreOrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paid: number;
  balance: number;
  cancelled_at: string | null;
  cancel_reason: string | null;
  received_at: string | null;
  claims?: StoreClaim[];
  payments?: StorePayment[];
}

async function storeRequest<T>(
  path: string,
  options: { method?: string; payload?: unknown; fallback?: string } = {},
): Promise<T> {
  if (!API_BASE) {
    throw createServiceError('El sistema de SalesIA no está disponible ahora.', 'NO_API');
  }
  const headers = storeHeaders();
  if (options.payload === undefined) delete headers['Content-Type'];

  let response: Response;
  try {
    response = await fetch(`${API_BASE}/api/v1/store${path}`, {
      method: options.method ?? 'GET',
      headers,
      body: options.payload !== undefined ? JSON.stringify(options.payload) : undefined,
    });
  } catch {
    throw createServiceError('No se pudo conectar con SalesIA. Inténtalo de nuevo.', 'NETWORK_ERROR');
  }

  const body = (await response.json().catch(() => null)) as
    | { message?: string; detail?: { field?: string; issue?: string }[] }
    | null;
  if (!response.ok) {
    throw createServiceError(
      describeApiError(body, options.fallback),
      response.status === 401
        ? 'UNAUTHORIZED'
        : body?.message
          ? 'API_ERROR'
          : 'VALIDATION_ERROR',
    );
  }
  return body as T;
}

/** Crea la cuenta de cliente y guarda el token de sesión. */
export async function registerStoreAccount(payload: StoreRegisterPayload): Promise<StoreAuthResult> {
  const result = await storeRequest<StoreAuthResult>('/auth/register', {
    method: 'POST',
    payload,
    fallback: 'No se pudo crear la cuenta.',
  });
  setStoreToken(result.access_token);
  return result;
}

/** Inicia sesión con email y contraseña y guarda el token. */
export async function loginStoreAccount(payload: {
  email: string;
  password: string;
}): Promise<StoreAuthResult> {
  const result = await storeRequest<StoreAuthResult>('/auth/login', {
    method: 'POST',
    payload,
    fallback: 'No se pudo iniciar sesión.',
  });
  setStoreToken(result.access_token);
  return result;
}

/** Valida el token guardado y devuelve el cliente autenticado. */
export async function fetchStoreMe(): Promise<StoreCustomer> {
  return storeRequest<StoreCustomer>('/auth/me');
}

/** Pedidos del cliente autenticado (venta + líneas + estado). */
export async function fetchStoreOrders(): Promise<StoreOrder[]> {
  const page = await storeRequest<{ items?: StoreOrder[] }>('/orders', {
    fallback: 'No se pudieron cargar tus pedidos.',
  });
  return Array.isArray(page?.items) ? page.items : [];
}

/** Envía un reclamo sobre un pedido (no llegó o tuvo problemas). */
export async function sendOrderClaim(saleId: number, description: string): Promise<StoreClaim> {
  return storeRequest<StoreClaim>(`/orders/${saleId}/claims`, {
    method: 'POST',
    payload: { description },
    fallback: 'No se pudo enviar el reclamo.',
  });
}

export interface StorePaymentInput {
  method: 'card' | 'yape' | 'plin';
  reference?: string;
}

/** Registra el cobro de la pasarela simulada sobre el pedido (solo el dueño). */
export async function payOrder(saleId: number, input: StorePaymentInput): Promise<StoreOrder> {
  return storeRequest<StoreOrder>(`/orders/${saleId}/pay`, {
    method: 'POST',
    payload: input,
    fallback: 'No se pudo procesar el pago.',
  });
}

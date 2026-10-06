import { createServiceError } from './productService'

/**
 * Cliente del storefront público de SalesIA (`/api/v1/store/*`).
 * Se usa para enviar el carrito como cotización real al sistema.
 */

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/+$/, '') ?? '';

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
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    });
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
    throw createServiceError(describeApiError(body), body?.message ? 'API_ERROR' : 'VALIDATION_ERROR');
  }
  return body as unknown as StoreQuoteResult;
}

const FIELD_LABELS: Record<string, string> = {
  'body.customer.name': 'Nombre',
  'body.customer.phone': 'Teléfono',
  'body.customer.email': 'Correo',
  'body.items': 'Productos',
  body: 'Datos enviados',
};

const ISSUE_TRANSLATIONS: [RegExp, string][] = [
  [/at most (\d+) characters/i, 'máximo $1 caracteres'],
  [/at least (\d+) characters/i, 'mínimo $1 caracteres'],
  [/not a valid integer|greater than or equal to 1/i, 'no es válido'],
  [/not a valid email/i, 'no es un correo válido'],
];

/** Traduce el error 422 del API a un mensaje entendible para el cliente. */
function describeApiError(body: { message?: string; detail?: { field?: string; issue?: string }[] } | null): string {
  const first = body?.detail?.[0];
  if (!first?.issue) return body?.message ?? 'No se pudo generar la cotización.';

  const label = Object.entries(FIELD_LABELS).find(([key]) => (first.field ?? '').endsWith(key))?.[1];
  let issue = first.issue;
  for (const [pattern, replacement] of ISSUE_TRANSLATIONS) {
    issue = issue.replace(pattern, replacement);
  }
  const detail = label ? `${label}: ${issue.charAt(0).toLowerCase()}${issue.slice(1)}` : issue;
  return body?.message ? `${body.message} ${detail}` : detail;
}

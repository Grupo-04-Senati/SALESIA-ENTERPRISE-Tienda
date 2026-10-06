import type { Product, Category } from '../types';
import productsData from '../data/products.json';
import categoriesData from '../data/categories.json';
import { getCategoryImage } from '../utils/images';

/**
 * Catálogo de la tienda.
 *
 * Fuente principal: el API público de SalesIA (`/api/v1/store/*`) cuando
 * `VITE_API_URL` está definido. Si el API no responde o no está configurado,
 * se usa el JSON local como respaldo para que la tienda nunca se quede vacía.
 */

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/+$/, '') ?? '';
const STORE = API_BASE ? `${API_BASE}/api/v1/store` : '';

const MOCK_PRODUCTS: Product[] = productsData as unknown as Product[];
const MOCK_CATEGORIES: Category[] = categoriesData as Category[];

const CACHE_MS = 60_000;
let productsCache: { data: Product[]; at: number } | null = null;
let categoriesCache: { data: Category[]; at: number } | null = null;

const simulateDelay = (): Promise<void> => {
  const delay = Math.random() * 300 + 300;
  return new Promise(resolve => setTimeout(resolve, delay));
};

export function createServiceError(message: string, code: string = 'UNKNOWN'): Error & { code: string } {
  const err = new Error(message) as Error & { code: string };
  err.code = code;
  err.name = 'ServiceError';
  return err;
}

export type ServiceError = Error & { code: string };

interface StorePage<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapStoreProduct(item: any): Product {
  const salePrice = Number(item.sale_price ?? 0);
  return {
    id: String(item.id),
    sku: String(item.sku ?? ''),
    nombre: String(item.name ?? ''),
    descripcion: String(item.description ?? ''),
    categoria: String(item.category?.slug ?? 'sin-categoria'),
    marca: String(item.brand ?? ''),
    precio: salePrice,
    precioMayorista:
      item.wholesale_price === null || item.wholesale_price === undefined
        ? null
        : Number(item.wholesale_price),
    precioAnterior: null,
    stock: Number(item.current_stock ?? 0),
    imagenes: item.image_url ? [String(item.image_url)] : [],
    destacado: !!item.is_featured,
    etiquetas: [],
    especificaciones: {},
  };
}

function mapStoreCategory(item: any): Category {
  const slug = String(item.slug ?? item.id ?? '');
  return {
    id: slug,
    nombre: String(item.name ?? slug),
    imagen: item.image_url ? String(item.image_url) : getCategoryImage(slug),
    descripcion: String(item.description ?? ''),
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

async function storeGet<T>(path: string, params?: URLSearchParams): Promise<T | null> {
  if (!STORE) return null;
  const query = params && [...params.keys()].length > 0 ? `?${params}` : '';
  try {
    const response = await fetch(`${STORE}${path}${query}`, {
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

/** Todos los productos activos del API (paginado). `null` = API no disponible. */
async function fetchAllStoreProducts(): Promise<Product[] | null> {
  const all: Product[] = [];
  let page = 1;
  let pages = 1;
  do {
    const params = new URLSearchParams({ page: String(page), page_size: '100' });
    const body = await storeGet<StorePage<unknown>>('/products', params);
    if (!body) return null;
    all.push(...body.items.map(mapStoreProduct));
    pages = body.pages || 1;
    page += 1;
  } while (page <= pages && page <= 20);
  return all;
}

async function loadProducts(): Promise<Product[]> {
  if (productsCache && Date.now() - productsCache.at < CACHE_MS) return productsCache.data;
  const live = await fetchAllStoreProducts();
  const data = live ?? MOCK_PRODUCTS;
  productsCache = { data, at: Date.now() };
  if (live === null) await simulateDelay();
  return data;
}

async function loadCategories(): Promise<Category[]> {
  if (categoriesCache && Date.now() - categoriesCache.at < CACHE_MS) return categoriesCache.data;
  const body = await storeGet<StorePage<unknown>>('/categories');
  const data = body ? body.items.map(mapStoreCategory) : MOCK_CATEGORIES;
  categoriesCache = { data, at: Date.now() };
  if (!body) await simulateDelay();
  return data;
}

/** Fuerza una recarga en la siguiente llamada (tras enviar una cotización). */
export function invalidateCatalogCache(): void {
  productsCache = null;
  categoriesCache = null;
}

const normalize = (value: string) =>
  value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export const getProducts = async (): Promise<Product[]> => {
  try {
    const products = await loadProducts();
    if (!products || products.length === 0) {
      throw createServiceError('No se pudieron cargar los productos', 'EMPTY_DATA');
    }
    return products;
  } catch (error) {
    if ((error as ServiceError).code) throw error;
    throw createServiceError('Error al conectar con el servidor', 'NETWORK_ERROR');
  }
};

export const getProductById = async (id: string): Promise<Product | undefined> => {
  await simulateDelayIfMock();
  const products = await loadProducts();
  return products.find(p => p.id === id);
};

export const getProductsByCategory = async (categoryId: string): Promise<Product[]> => {
  await simulateDelayIfMock();
  const products = await loadProducts();
  return products.filter(p => p.categoria === categoryId);
};

export const searchProducts = async (query: string): Promise<Product[]> => {
  await simulateDelayIfMock();
  const products = await loadProducts();
  const normalizedQuery = normalize(query);
  return products.filter(
    p =>
      normalize(p.nombre).includes(normalizedQuery) ||
      p.sku.toLowerCase().includes(normalizedQuery) ||
      normalize(p.marca).includes(normalizedQuery)
  );
};

export const getCategories = async (): Promise<Category[]> => loadCategories();

export const getCategoryById = async (id: string): Promise<Category | undefined> => {
  const categories = await loadCategories();
  return categories.find(c => c.id === id);
};

export const getFeaturedProducts = async (): Promise<Product[]> => {
  const products = await loadProducts();
  return products.filter(p => p.destacado);
};

export const getBrands = async (): Promise<string[]> => {
  const products = await loadProducts();
  const brands = new Set(products.map(p => p.marca).filter(Boolean));
  return Array.from(brands).sort();
};

/** Retardo solo cuando se sirve el catálogo local (API no disponible). */
async function simulateDelayIfMock(): Promise<void> {
  if (!STORE || !productsCache) await simulateDelay();
}

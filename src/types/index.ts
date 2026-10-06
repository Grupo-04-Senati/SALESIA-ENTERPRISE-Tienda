export interface Product {
  id: string;
  sku: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  marca: string;
  precio: number;
  precioMayorista: number | null;
  precioAnterior: number | null;
  stock: number;
  imagenes: string[];
  destacado: boolean;
  etiquetas: string[];
  especificaciones: Record<string, string>;
}

export interface Category {
  id: string;
  nombre: string;
  imagen: string;
  descripcion: string;
}

export interface CartItem {
  product: Product;
  cantidad: number;
}

export type SortOption = 'menor-precio' | 'mayor-precio' | 'az' | 'destacados';

export interface Filters {
  categorias: string[];
  marcas: string[];
  precioMin: number;
  precioMax: number;
  disponible: boolean;
}

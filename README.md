# Catálogo Web Frontend - SalesIA Enterprise Tienda

Interfaz completa de un catálogo mayorista construida sobre datos simulados, respetando la identidad de marca existente.

## Descripción

Catálogo web mayorista de SalesIA Enterprise Tienda (empresa fundada en 2026). Toda la información proviene de archivos JSON locales que simulan la respuesta de una API, con un delay artificial de 500-800ms para replicar un entorno real.

## Funcionalidades Implementadas

| ID | Requisito | Estado |
|----|-----------|--------|
| RF-01 | Cabecera fija con logo, nav, buscador, carrito y WhatsApp | ✅ |
| RF-02 | Banner principal con carrusel, autoavance y controles | ✅ |
| RF-03 | Grilla de 6 categorías con navegación | ✅ |
| RF-04 | Franja de marcas con efecto grayscale | ✅ |
| RF-05 | Listado de productos responsive por iteración | ✅ |
| RF-06 | Búsqueda por nombre, SKU y marca con debounce 300ms | ✅ |
| RF-07 | Filtros por categoría, marca, precio y disponibilidad | ✅ |
| RF-08 | Ordenamiento: menor precio, mayor precio, A-Z, destacados | ✅ |
| RF-09 | Paginación numerada con 12 productos por página | ✅ |
| RF-10 | Ficha de producto con galería, specs, precios y WhatsApp | ✅ |
| RF-11 | 4 productos relacionados en la ficha | ✅ |
| RF-12 | Carrito de cotización lateral con cantidades y subtotal | ✅ |
| RF-13 | Preguntas frecuentes con acordeón animado | ✅ |
| RF-14 | Formulario de contacto con validación cliente | ✅ |
| RF-15 | Pie de página con logo, contacto, enlaces y pagos | ✅ |
| RF-16 | Botón flotante de WhatsApp visible en todas las vistas | ✅ |
| RF-17 | Skeleton de carga, estado vacío, error y página 404 | ✅ |

## Stack Tecnológico

| Capa | Tecnologías |
|------|-------------|
| **Base** | React 18, TypeScript, Vite, React Router |
| **Estilos** | Tailwind CSS v4, CSS Tokens |
| **Íconos** | Lucide React |
| **Estado** | Context API + useState |
| **Datos** | Mock data en JSON (40 productos, 6 categorías) |

## Instalación

```bash
# Clonar el repositorio
git clone https://github.com/usuario/catalogo-web-import.git

# Entrar al directorio
cd catalogo-web-import

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

## Comandos Disponibles

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build de producción
npm run preview  # Vista previa del build
npm run lint     # Linting con oxlint
```

## Estructura de Carpetas

```
src/
├── components/         # Componentes reutilizables
│   ├── CartSidebar.tsx       # Panel lateral del carrito
│   ├── EmptyState.tsx        # Estado vacío reutilizable
│   ├── ErrorState.tsx        # Estado de error reutilizable
│   ├── Footer.tsx            # Pie de página
│   ├── Header.tsx            # Cabecera fija
│   ├── ProductCard.tsx       # Tarjeta de producto
│   ├── SidebarFilters.tsx    # Barra lateral de filtros
│   ├── Skeleton.tsx          # Skeletons de carga
│   └── WhatsAppButton.tsx    # Botón flotante WhatsApp
├── context/            # Estado global
│   └── CartContext.tsx       # Contexto del carrito de cotización
├── data/               # Datos mock
│   ├── categories.json       # 6 categorías
│   └── products.json         # 40 productos
├── hooks/              # Custom hooks
│   └── useDebounce.ts        # Hook de debounce
├── pages/              # Páginas/rutas
│   ├── Catalog.tsx           # Página de catálogo
│   ├── Contact.tsx           # Contacto + FAQ
│   ├── Home.tsx              # Página principal
│   ├── NotFound.tsx          # Página 404
│   └── ProductDetail.tsx     # Ficha de producto
├── services/           # Capa de servicio aislada
│   └── productService.ts     # Funciones con delay simulado
├── styles/             # Tokens CSS
│   └── tokens.css            # Variables de diseño
├── types/              # Definiciones TypeScript
│   └── index.ts              # Interfaces y tipos
├── App.tsx             # Router principal
├── index.css           # Estilos globales
└── main.tsx            # Entry point
```

## Identidad Visual

### Paleta de Colores

| Token | Hex | Uso |
|-------|-----|-----|
| `--color-primary` | #D62828 | Botones principales, precios, badges |
| `--color-primary-dark` | #9E1B1B | Estados hover del primario |
| `--color-secondary` | #1D3557 | Cabecera, pie de página, títulos |
| `--color-accent` | #F4A300 | Etiquetas "Nuevo", iconos |
| `--color-whatsapp` | #25D366 | Botón flotante y CTA WhatsApp |

### Tipografía

- **Títulos:** Poppins (600/700)
- **Texto:** Inter (400/500)
- **Escala:** 12 / 14 / 16 / 20 / 24 / 32 / 40 px

### Espaciado

Múltiplos de 4px: 4, 8, 12, 16, 24, 32, 48, 64

## Decisiones de Diseño

1. **Tokens CSS:** Todos los colores se declaran una sola vez en `tokens.css`. No se usan hexadecimales sueltos en componentes.
2. **Capa de servicio aislada:** Los datos se leen a través de `productService.ts`. Conectar una API real solo requiere cambiar ese archivo.
3. **Skeletons:** Durante el delay de carga se muestran skeletons, no textos de "Cargando...".
4. **Responsive:** La interfaz es correcta en 360px, 768px, 1024px y 1440px sin desbordes horizontales.
5. **Componentización:** Ningún componente supera las 200 líneas. Componentes reutilizables agrupados por dominio.

## Dificultades Encontradas

- **Formateo de precios:** Se implementó `Intl.NumberFormat("es-PE")` para确保 el formato correcto de soles peruanos.
- **Búsqueda con tildes:** Se normalizan los strings con `normalize("NFD")` para búsqueda insensible a tildes.
- **Paginación con filtros:** Se resetea la página a 1 cuando cambian los filtros, búsqueda u ordenamiento.
- **Carrito persistente:** Se usó Context API para mantener el estado del carrito entre navegaciones.

## Datos Simulados

- **40 productos** distribuidos en 6 categorías
- **13 marcas** (Truper, Bahco, DeWalt, Makita, Stanley, Philips, Schneider, 3M, Condumex, Omnitech, Sika, Totto, Norma)
- **6 productos destacados**
- **Casos borde:** 2 sin stock, 1 nombre largo (98 chars), 1 sin imagen, 1 con precio de oferta

const WA_NUMBER = '51997126761'

export function buildWhatsAppUrl(text: string): string {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`
}

export function whatsappCotizarProducto(nombre: string, sku: string, tipoVenta: string, cantidad: number): string {
  return buildWhatsAppUrl(
    `Hola, me interesa cotizar el siguiente producto:\n\n` +
    `• *${nombre}*\n` +
    `SKU: ${sku}\n` +
    `Tipo de venta: ${tipoVenta}\n` +
    `Cantidad: ${cantidad}\n\n` +
    `¿Podrían confirmarme disponibilidad y precio? ¡Gracias!`
  )
}

export function whatsappCotizarDesdeCard(nombre: string, sku: string): string {
  return buildWhatsAppUrl(
    `Hola, me interesa cotizar el siguiente producto:\n\n` +
    `• *${nombre}*\n` +
    `SKU: ${sku}\n\n` +
    `¿Podrían confirmarme disponibilidad y precio? ¡Gracias!`
  )
}

export function whatsappGeneral(): string {
  return buildWhatsAppUrl(
    `Hola SalesIA Enterprise Tienda, me gustaría recibir información sobre sus productos y precios mayoristas. ¡Gracias!`
  )
}

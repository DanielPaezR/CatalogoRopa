export const ESTADOS_PEDIDO = ['PENDIENTE', 'CONFIRMADO', 'ENVIADO', 'ENTREGADO', 'CANCELADO'] as const
export type EstadoPedido = (typeof ESTADOS_PEDIDO)[number]

export const ESTADO_LABEL: Record<string, string> = {
  PENDIENTE: 'Pendiente',
  CONFIRMADO: 'Confirmado',
  ENVIADO: 'Enviado',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado',
}

export const ESTADO_COLOR: Record<string, string> = {
  PENDIENTE: 'bg-amber-100 text-amber-800',
  CONFIRMADO: 'bg-sky-100 text-sky-800',
  ENVIADO: 'bg-indigo-100 text-indigo-800',
  ENTREGADO: 'bg-emerald-100 text-emerald-800',
  CANCELADO: 'bg-stone-200 text-stone-600',
}

export const METODOS_PAGO = ['WHATSAPP', 'CONTRAENTREGA', 'TRANSFERENCIA', 'STRIPE'] as const
export type MetodoPago = (typeof METODOS_PAGO)[number]

export const METODO_LABEL: Record<string, string> = {
  WHATSAPP: 'Acordar por WhatsApp',
  CONTRAENTREGA: 'Pago contra entrega',
  TRANSFERENCIA: 'Transferencia bancaria / Nequi',
  STRIPE: 'Tarjeta (en línea)',
}

export const TALLAS_SUGERIDAS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Única', '6', '8', '10', '12', '28', '30', '32', '34', '36', '38']

export const STOCK_BAJO = 3

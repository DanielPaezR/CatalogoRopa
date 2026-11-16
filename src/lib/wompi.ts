import { createHash, timingSafeEqual } from 'crypto'
import { prisma } from './db'
import { cambiarEstadoPedido } from './pedidos'

/**
 * Integración con Wompi (Bancolombia) usando el Web Checkout por redirección.
 *
 * Variables de entorno:
 *  - WOMPI_PUBLIC_KEY        pub_test_… (pruebas) o pub_prod_… (producción)
 *  - WOMPI_INTEGRITY_SECRET  secreto de integridad (firma de cada pago)
 *  - WOMPI_EVENTS_SECRET     secreto de eventos (valida las notificaciones)
 */

const CHECKOUT_URL = 'https://checkout.wompi.co/p/'

export function wompiEnabled() {
  return Boolean(process.env.WOMPI_PUBLIC_KEY && process.env.WOMPI_INTEGRITY_SECRET)
}

export function wompiSandbox() {
  return (process.env.WOMPI_PUBLIC_KEY ?? '').startsWith('pub_test_')
}

function apiBase() {
  return wompiSandbox() ? 'https://sandbox.wompi.co/v1' : 'https://production.wompi.co/v1'
}

const sha256 = (text: string) => createHash('sha256').update(text).digest('hex')

/** Firma de integridad: SHA256(referencia + montoEnCentavos + moneda + secreto). */
export function firmaIntegridad(referencia: string, montoCentavos: number, moneda = 'COP') {
  return sha256(`${referencia}${montoCentavos}${moneda}${process.env.WOMPI_INTEGRITY_SECRET ?? ''}`)
}

type PedidoPago = {
  id: string
  numero: number
  total: number
  clienteNombre: string
  clienteEmail: string | null
  clienteTelefono: string
  direccion: string
  ciudad: string
}

/** Genera una referencia nueva para el pedido y devuelve la URL del checkout de Wompi. */
export async function crearEnlacePago(pedido: PedidoPago, baseUrl: string) {
  if (!wompiEnabled()) throw new Error('Wompi no está configurado')

  // Cada intento de pago usa una referencia única (Wompi no permite reutilizarlas).
  const referencia = `P${pedido.numero}-${Date.now().toString(36).toUpperCase()}`
  await prisma.pedido.update({
    where: { id: pedido.id },
    data: { pagoReferencia: referencia, pagoEstado: 'PENDING', pagoTransaccion: null },
  })

  const centavos = pedido.total * 100
  const telefono = pedido.clienteTelefono.replace(/\D/g, '').slice(-10)
  const params = new URLSearchParams({
    'public-key': process.env.WOMPI_PUBLIC_KEY!,
    currency: 'COP',
    'amount-in-cents': String(centavos),
    reference: referencia,
    'signature:integrity': firmaIntegridad(referencia, centavos),
    'redirect-url': `${baseUrl}/pedido/${pedido.id}`,
    'customer-data:full-name': pedido.clienteNombre,
    'customer-data:phone-number': telefono,
    'customer-data:phone-number-prefix': '+57',
    'shipping-address:address-line-1': pedido.direccion.slice(0, 120),
    'shipping-address:city': pedido.ciudad,
    'shipping-address:region': pedido.ciudad,
    'shipping-address:country': 'CO',
    'shipping-address:phone-number': telefono,
  })
  if (pedido.clienteEmail) params.set('customer-data:email', pedido.clienteEmail)

  return `${CHECKOUT_URL}?${params.toString()}`
}

export type TransaccionWompi = {
  id: string
  status: 'PENDING' | 'APPROVED' | 'DECLINED' | 'VOIDED' | 'ERROR'
  reference: string
  amount_in_cents: number
  currency: string
  payment_method_type?: string
}

/** Consulta una transacción en el API público de Wompi. */
export async function consultarTransaccion(id: string): Promise<TransaccionWompi | null> {
  if (!/^[\w-]+$/.test(id)) return null
  try {
    const res = await fetch(`${apiBase()}/transactions/${id}`, { cache: 'no-store' })
    if (!res.ok) return null
    const json = await res.json()
    return json?.data ?? null
  } catch (err) {
    console.error('Error consultando transacción Wompi:', err)
    return null
  }
}

/**
 * Aplica el resultado de una transacción al pedido que tenga esa referencia.
 * Verifica monto y moneda antes de marcar el pedido como pagado.
 */
export async function aplicarTransaccion(tx: TransaccionWompi) {
  const pedido = await prisma.pedido.findUnique({ where: { pagoReferencia: tx.reference } })
  if (!pedido) return null

  if (tx.currency !== 'COP' || tx.amount_in_cents !== pedido.total * 100) {
    console.error(`Wompi: monto no coincide para ${tx.reference} (${tx.amount_in_cents} vs ${pedido.total * 100})`)
    return pedido
  }

  await prisma.pedido.update({
    where: { id: pedido.id },
    data: { pagoTransaccion: tx.id, pagoEstado: tx.status },
  })

  if (tx.status === 'APPROVED' && !pedido.pagado) {
    const estado = pedido.estado === 'PENDIENTE' || pedido.estado === 'CANCELADO' ? 'CONFIRMADO' : pedido.estado
    try {
      await cambiarEstadoPedido(pedido.id, estado, { pagado: true })
    } catch (err) {
      // Si un pedido cancelado ya no tiene stock, se marca pagado igual para revisión manual.
      console.error('Wompi: no se pudo confirmar el pedido', err)
      await prisma.pedido.update({ where: { id: pedido.id }, data: { pagado: true } })
    }
  }
  return prisma.pedido.findUnique({ where: { id: pedido.id } })
}

type EventoWompi = {
  event?: string
  data?: Record<string, unknown>
  signature?: { properties?: string[]; checksum?: string }
  timestamp?: number | string
}

function valorEnRuta(obj: unknown, ruta: string): unknown {
  return ruta.split('.').reduce<unknown>((acc, k) => (acc && typeof acc === 'object' ? (acc as Record<string, unknown>)[k] : undefined), obj)
}

/**
 * Verifica la firma de un evento de Wompi:
 * SHA256(valores de signature.properties tomados de `data` + timestamp + secreto de eventos).
 */
export function verificarEvento(evento: EventoWompi, checksumHeader?: string | null) {
  const secreto = process.env.WOMPI_EVENTS_SECRET
  if (!secreto || !evento.signature?.properties || evento.timestamp === undefined) return false
  const concatenado =
    evento.signature.properties.map((p) => String(valorEnRuta(evento.data, p) ?? '')).join('') + String(evento.timestamp) + secreto
  const calculado = sha256(concatenado)
  const recibido = (checksumHeader || evento.signature.checksum || '').toLowerCase()
  if (recibido.length !== calculado.length) return false
  return timingSafeEqual(Buffer.from(calculado), Buffer.from(recibido))
}

const EXPIRACION_MS = 2 * 60 * 60 * 1000

/**
 * Cancela (y devuelve al inventario) los pedidos con pago en línea que nunca se pagaron
 * tras 2 horas. No toca los que tienen una transacción en proceso (p. ej. PSE pendiente).
 */
export async function expirarPagosVencidos() {
  try {
    const vencidos = await prisma.pedido.findMany({
      where: {
        metodoPago: 'WOMPI',
        pagado: false,
        estado: 'PENDIENTE',
        updatedAt: { lt: new Date(Date.now() - EXPIRACION_MS) },
        NOT: { pagoEstado: 'PENDING', pagoTransaccion: { not: null } },
      },
      select: { id: true },
      take: 50,
    })
    for (const p of vencidos) await cambiarEstadoPedido(p.id, 'CANCELADO')
  } catch (err) {
    console.error('Error expirando pagos vencidos:', err)
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { crearPedido, cambiarEstadoPedido, PedidoError } from '@/lib/pedidos'
import { getConfig } from '@/lib/config'
import { crearEnlacePago, expirarPagosVencidos, wompiEnabled } from '@/lib/wompi'
import { baseUrlFromHeaders } from '@/lib/utils'

export const dynamic = 'force-dynamic'

const schema = z.object({
  cliente: z.object({
    nombre: z.string().trim().min(3, 'Escribe tu nombre completo').max(120),
    email: z.string().trim().email('Correo inválido').max(160).optional().or(z.literal('')),
    telefono: z.string().trim().min(7, 'Teléfono inválido').max(30),
    direccion: z.string().trim().min(5, 'Escribe la dirección de entrega').max(300),
    ciudad: z.string().trim().min(2, 'Escribe la ciudad').max(100),
    notas: z.string().trim().max(500).optional(),
  }),
  metodoPago: z.enum(['WHATSAPP', 'CONTRAENTREGA', 'TRANSFERENCIA', 'WOMPI']),
  items: z
    .array(
      z.object({
        productoId: z.string().min(1),
        varianteId: z.string().nullish(),
        cantidad: z.number().int().min(1).max(50),
      })
    )
    .min(1, 'El carrito está vacío')
    .max(50),
})

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Solicitud inválida' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }, { status: 400 })
  }
  const data = parsed.data

  const config = await getConfig()
  const permitido =
    (data.metodoPago === 'WHATSAPP' && config.pagoWhatsapp) ||
    (data.metodoPago === 'CONTRAENTREGA' && config.pagoContraentrega) ||
    (data.metodoPago === 'TRANSFERENCIA' && config.pagoTransferencia) ||
    (data.metodoPago === 'WOMPI' && wompiEnabled())
  if (!permitido) {
    return NextResponse.json({ error: 'Método de pago no disponible' }, { status: 400 })
  }

  await expirarPagosVencidos()

  try {
    const pedido = await crearPedido(data)

    if (data.metodoPago === 'WOMPI') {
      try {
        const url = await crearEnlacePago(pedido, baseUrlFromHeaders(req.headers))
        return NextResponse.json({ id: pedido.id, numero: pedido.numero, url }, { status: 201 })
      } catch (err) {
        console.error('Error preparando el pago con Wompi:', err)
        await cambiarEstadoPedido(pedido.id, 'CANCELADO')
        return NextResponse.json({ error: 'No se pudo iniciar el pago en línea. Intenta con otro método.' }, { status: 502 })
      }
    }

    return NextResponse.json({ id: pedido.id, numero: pedido.numero }, { status: 201 })
  } catch (err) {
    if (err instanceof PedidoError) {
      return NextResponse.json({ error: err.message }, { status: 409 })
    }
    console.error('Error creando pedido:', err)
    return NextResponse.json({ error: 'No se pudo crear el pedido' }, { status: 500 })
  }
}

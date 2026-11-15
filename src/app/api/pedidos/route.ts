import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { crearPedido, cambiarEstadoPedido, PedidoError } from '@/lib/pedidos'
import { getConfig } from '@/lib/config'
import { getStripe } from '@/lib/stripe'
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
  metodoPago: z.enum(['WHATSAPP', 'CONTRAENTREGA', 'TRANSFERENCIA', 'STRIPE']),
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
  const stripe = getStripe()
  const permitido =
    (data.metodoPago === 'WHATSAPP' && config.pagoWhatsapp) ||
    (data.metodoPago === 'CONTRAENTREGA' && config.pagoContraentrega) ||
    (data.metodoPago === 'TRANSFERENCIA' && config.pagoTransferencia) ||
    (data.metodoPago === 'STRIPE' && !!stripe)
  if (!permitido) {
    return NextResponse.json({ error: 'Método de pago no disponible' }, { status: 400 })
  }

  try {
    const pedido = await crearPedido(data)

    if (data.metodoPago === 'STRIPE' && stripe) {
      const base = baseUrlFromHeaders(req.headers)
      try {
        const session = await stripe.checkout.sessions.create({
          mode: 'payment',
          customer_email: pedido.clienteEmail ?? undefined,
          client_reference_id: pedido.id,
          metadata: { pedidoId: pedido.id },
          line_items: [
            ...pedido.items.map((it) => ({
              quantity: it.cantidad,
              price_data: {
                currency: 'cop',
                unit_amount: it.precio * 100,
                product_data: {
                  name: [it.nombre, it.talla, it.color].filter(Boolean).join(' · '),
                },
              },
            })),
            ...(pedido.envio > 0
              ? [
                  {
                    quantity: 1,
                    price_data: {
                      currency: 'cop',
                      unit_amount: pedido.envio * 100,
                      product_data: { name: 'Envío' },
                    },
                  },
                ]
              : []),
          ],
          success_url: `${base}/pedido/${pedido.id}?pago=ok`,
          cancel_url: `${base}/pedido/${pedido.id}?pago=cancelado`,
          expires_at: Math.floor(Date.now() / 1000) + 60 * 60,
        })
        await prisma.pedido.update({ where: { id: pedido.id }, data: { stripeSessionId: session.id } })
        return NextResponse.json({ id: pedido.id, numero: pedido.numero, url: session.url }, { status: 201 })
      } catch (err) {
        console.error('Error creando sesión de Stripe:', err)
        await cambiarEstadoPedido(pedido.id, 'CANCELADO')
        return NextResponse.json({ error: 'No se pudo iniciar el pago con tarjeta. Intenta otro método.' }, { status: 502 })
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

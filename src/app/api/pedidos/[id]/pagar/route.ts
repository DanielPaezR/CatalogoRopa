import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { crearEnlacePago, wompiEnabled } from '@/lib/wompi'
import { baseUrlFromHeaders } from '@/lib/utils'

export const dynamic = 'force-dynamic'

/** Reintentar el pago en línea de un pedido pendiente: redirige al checkout de Wompi. */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const base = baseUrlFromHeaders(req.headers)
  const pedido = await prisma.pedido.findUnique({ where: { id: params.id } })
  if (!pedido) return NextResponse.redirect(`${base}/`)
  if (!wompiEnabled() || pedido.pagado || pedido.estado === 'CANCELADO' || pedido.metodoPago !== 'WOMPI') {
    return NextResponse.redirect(`${base}/pedido/${pedido.id}`)
  }
  const url = await crearEnlacePago(pedido, base)
  return NextResponse.redirect(url)
}

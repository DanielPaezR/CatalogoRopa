import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdminApi } from '@/lib/auth'
import { cambiarEstadoPedido, PedidoError } from '@/lib/pedidos'
import { ESTADOS_PEDIDO } from '@/lib/constants'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

const schema = z.object({
  estado: z.enum(ESTADOS_PEDIDO).optional(),
  pagado: z.boolean().optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireAdminApi()
  if (error) return error

  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })

  try {
    const actual = await prisma.pedido.findUnique({ where: { id: params.id }, select: { estado: true } })
    if (!actual) return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
    const pedido = await cambiarEstadoPedido(params.id, parsed.data.estado ?? actual.estado, {
      pagado: parsed.data.pagado,
    })
    return NextResponse.json(pedido)
  } catch (err) {
    if (err instanceof PedidoError) return NextResponse.json({ error: err.message }, { status: 409 })
    console.error('Error actualizando pedido:', err)
    return NextResponse.json({ error: 'No se pudo actualizar el pedido' }, { status: 500 })
  }
}

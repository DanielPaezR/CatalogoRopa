import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { requireAdminApi } from '@/lib/auth'
import { guardarProducto, productoSchema } from '@/lib/productos'

export const dynamic = 'force-dynamic'

type Ctx = { params: { id: string } }

export async function PUT(req: NextRequest, { params }: Ctx) {
  const { error } = await requireAdminApi()
  if (error) return error

  const existe = await prisma.producto.findUnique({ where: { id: params.id }, select: { id: true } })
  if (!existe) return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })

  const parsed = productoSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }, { status: 400 })
  }
  try {
    const producto = await guardarProducto(parsed.data, params.id)
    return NextResponse.json(producto)
  } catch (err) {
    console.error('Error actualizando producto:', err)
    return NextResponse.json({ error: 'No se pudo actualizar el producto' }, { status: 500 })
  }
}

const patchSchema = z.object({ activo: z.boolean().optional(), destacado: z.boolean().optional() })

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { error } = await requireAdminApi()
  if (error) return error

  const parsed = patchSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })

  try {
    const producto = await prisma.producto.update({ where: { id: params.id }, data: parsed.data })
    return NextResponse.json(producto)
  } catch {
    return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { error } = await requireAdminApi()
  if (error) return error

  try {
    await prisma.producto.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
  }
}

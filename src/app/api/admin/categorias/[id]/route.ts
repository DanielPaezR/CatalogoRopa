import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdminApi } from '@/lib/auth'
import { categoriaSchema, slugCategoria } from '@/lib/categorias'

export const dynamic = 'force-dynamic'

type Ctx = { params: { id: string } }

export async function PUT(req: NextRequest, { params }: Ctx) {
  const { error } = await requireAdminApi()
  if (error) return error

  const parsed = categoriaSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }, { status: 400 })
  }
  const { slug, ...rest } = parsed.data
  try {
    const categoria = await prisma.categoria.update({
      where: { id: params.id },
      data: { ...rest, slug: await slugCategoria(slug || rest.nombre, params.id) },
    })
    return NextResponse.json(categoria)
  } catch {
    return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 404 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { error } = await requireAdminApi()
  if (error) return error

  try {
    // Los productos de la categoría quedan "sin categoría" (onDelete: SetNull)
    await prisma.categoria.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 404 })
  }
}

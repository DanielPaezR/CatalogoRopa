import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdminApi } from '@/lib/auth'
import { categoriaSchema, slugCategoria } from '@/lib/categorias'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const { error } = await requireAdminApi()
  if (error) return error

  const parsed = categoriaSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }, { status: 400 })
  }
  const { slug, ...rest } = parsed.data
  const categoria = await prisma.categoria.create({
    data: { ...rest, slug: await slugCategoria(slug || rest.nombre) },
  })
  return NextResponse.json(categoria, { status: 201 })
}

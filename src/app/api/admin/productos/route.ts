import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/auth'
import { guardarProducto, productoSchema } from '@/lib/productos'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const { error } = await requireAdminApi()
  if (error) return error

  const parsed = productoSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }, { status: 400 })
  }
  try {
    const producto = await guardarProducto(parsed.data)
    return NextResponse.json(producto, { status: 201 })
  } catch (err) {
    console.error('Error creando producto:', err)
    return NextResponse.json({ error: 'No se pudo crear el producto' }, { status: 500 })
  }
}

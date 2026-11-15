import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

const schema = z.object({
  items: z.array(z.object({ productoId: z.string(), varianteId: z.string().nullish() })).max(100),
})

/** Devuelve precio y stock actuales de los ítems del carrito. */
export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })

  const ids = Array.from(new Set(parsed.data.items.map((i) => i.productoId)))
  const productos = await prisma.producto.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      activo: true,
      precio: true,
      stock: true,
      nombre: true,
      slug: true,
      imagenes: true,
      variantes: { select: { id: true, stock: true } },
    },
  })

  const items = parsed.data.items.map((i) => {
    const p = productos.find((x) => x.id === i.productoId)
    if (!p || !p.activo) return { productoId: i.productoId, varianteId: i.varianteId ?? null, disponible: false }
    let stock = p.stock
    if (p.variantes.length > 0) {
      const v = p.variantes.find((x) => x.id === i.varianteId)
      if (!v) return { productoId: i.productoId, varianteId: i.varianteId ?? null, disponible: false }
      stock = v.stock
    }
    return {
      productoId: p.id,
      varianteId: i.varianteId ?? null,
      disponible: stock > 0,
      precio: p.precio,
      stock,
      nombre: p.nombre,
      slug: p.slug,
      imagen: p.imagenes[0] ?? null,
    }
  })

  return NextResponse.json({ items })
}

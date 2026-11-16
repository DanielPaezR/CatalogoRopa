import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdminApi } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/** Elimina el catálogo de muestra (productos DEMO-… e imágenes /demo/ de portada). */
export async function DELETE() {
  const { error } = await requireAdminApi()
  if (error) return error

  const { count } = await prisma.producto.deleteMany({ where: { sku: { startsWith: 'DEMO-' } } })
  const config = await prisma.configuracion.findUnique({ where: { id: 1 } })
  if (config) {
    await prisma.configuracion.update({
      where: { id: 1 },
      data: {
        demoCargado: true,
        heroImagen: config.heroImagen?.startsWith('/demo/') ? null : config.heroImagen,
        editorialImagen: config.editorialImagen?.startsWith('/demo/') ? null : config.editorialImagen,
      },
    })
  }
  return NextResponse.json({ ok: true, eliminados: count })
}

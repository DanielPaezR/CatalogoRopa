import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() ?? ''
  if (q.length < 2) return NextResponse.json({ productos: [], total: 0 })
  const where = {
    activo: true,
    OR: [
      { nombre: { contains: q, mode: 'insensitive' as const } },
      { descripcion: { contains: q, mode: 'insensitive' as const } },
      { categoria: { nombre: { contains: q, mode: 'insensitive' as const } } },
      { colores: { has: q.charAt(0).toUpperCase() + q.slice(1).toLowerCase() } },
    ],
  }
  const [productos, total] = await Promise.all([
    prisma.producto.findMany({
      where,
      select: { id: true, slug: true, nombre: true, precio: true, precioAnterior: true, imagenes: true },
      orderBy: { createdAt: 'desc' },
      take: 8,
    }),
    prisma.producto.count({ where }),
  ])
  return NextResponse.json({ productos, total })
}

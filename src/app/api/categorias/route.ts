import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const categorias = await prisma.categoria.findMany({
      where: { activo: true },
      include: {
        _count: {
          select: { productos: true }
        }
      },
      orderBy: [
        { orden: 'asc' },
        { nombre: 'asc' },
      ],
    })

    return NextResponse.json(categorias)

  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Error al obtener categorías' },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

// Esquema de filtros
const filtersSchema = z.object({
  estado: z.enum(['PENDIENTE', 'PROCESANDO', 'ENVIADO', 'ENTREGADO', 'CANCELADO']).optional(),
  fechaInicio: z.string().optional(),
  fechaFin: z.string().optional(),
  search: z.string().optional(),
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('20'),
})

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const query = Object.fromEntries(searchParams.entries())
    
    const validatedQuery = filtersSchema.parse(query)
    
    const {
      estado,
      fechaInicio,
      fechaFin,
      search,
      page = '1',
      limit = '20',
    } = validatedQuery

    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const skip = (pageNum - 1) * limitNum

    // Construir filtros
    const where: any = {}

    if (estado) {
      where.estadoPedido = estado
    }

    if (fechaInicio || fechaFin) {
      where.createdAt = {}
      if (fechaInicio) {
        where.createdAt.gte = new Date(fechaInicio)
      }
      if (fechaFin) {
        where.createdAt.lte = new Date(fechaFin)
      }
    }

    if (search) {
      where.OR = [
        { numeroPedido: { contains: search, mode: 'insensitive' } },
        { clienteNombre: { contains: search, mode: 'insensitive' } },
        { clienteEmail: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Obtener pedidos
    const [pedidos, total] = await Promise.all([
      prisma.pedido.findMany({
        where,
        include: {
          items: {
            include: {
              producto: {
                select: {
                  nombre: true,
                  imagenes: true,
                }
              }
            }
          },
          usuario: {
            select: {
              nombre: true,
              email: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.pedido.count({ where })
    ])

    // Calcular estadísticas
    const stats = await prisma.pedido.aggregate({
      where,
      _sum: {
        total: true,
      },
      _avg: {
        total: true,
      },
      _count: true,
    })

    return NextResponse.json({
      pedidos,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
      stats: {
        totalVentas: stats._sum.total || 0,
        promedioPedido: stats._avg.total || 0,
        totalPedidos: stats._count,
      }
    })

  } catch (error) {
    console.error('Error fetching orders:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Filtros inválidos', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Error al obtener pedidos' },
      { status: 500 }
    )
  }
}
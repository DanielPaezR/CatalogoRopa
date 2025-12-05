import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'
import { prisma } from '../../../../lib/db'

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
    const periodo = searchParams.get('periodo') || 'mes' // 'dia', 'semana', 'mes', 'año'
    
    const fechaInicio = getStartDate(periodo)

    // Obtener todas las estadísticas en paralelo
    const [
      totalVentas,
      ventasMensuales,
      productosMasVendidos,
      totalPedidos,
      pedidosPendientes,
      totalProductos,
      productosBajoStock,
      categoriasMasVendidas,
      mejoresClientes,
    ] = await Promise.all([
      // 1. Ventas totales
      prisma.pedido.aggregate({
        where: {
          estado: 'ENTREGADO',
          createdAt: { gte: fechaInicio },
        },
        _sum: { total: true },
      }),

      // 2. Ventas mensuales (últimos 12 meses)
      getMonthlySales(),

      // 3. Productos más vendidos
      getTopProducts(),

      // 4. Total de pedidos
      prisma.pedido.count({
        where: { createdAt: { gte: fechaInicio } },
      }),

      // 5. Pedidos pendientes
      prisma.pedido.count({
        where: { estado: 'PENDIENTE' },
      }),

      // 6. Total de productos
      prisma.producto.count({
        where: { activo: true },
      }),

      // 7. Productos con stock bajo
      prisma.producto.count({
        where: {
          activo: true,
          stock: { lt: 10 },
        },
      }),

      // 8. Categorías más vendidas
      getTopCategories(),

      // 9. Mejores clientes
      getTopCustomers(),
    ])

    return NextResponse.json({
      totalVentas: totalVentas._sum.total || 0,
      ventasMensuales,
      productosMasVendidos,
      totalPedidos,
      pedidosPendientes,
      totalProductos,
      productosBajoStock,
      categoriasMasVendidas,
      mejoresClientes,
      periodo: {
        actual: periodo,
        fechaInicio: fechaInicio.toISOString(),
        fechaFin: new Date().toISOString(),
      }
    })

  } catch (error) {
    console.error('Error fetching statistics:', error)
    return NextResponse.json(
      { error: 'Error al obtener estadísticas' },
      { status: 500 }
    )
  }
}

// Helper: Obtener fecha de inicio según periodo
function getStartDate(periodo: string): Date {
  const now = new Date()
  
  switch (periodo) {
    case 'dia':
      return new Date(now.getFullYear(), now.getMonth(), now.getDate())
    case 'semana':
      return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)
    case 'mes':
      return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
    case 'año':
      return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
    default:
      return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
  }
}

// Helper: Obtener ventas mensuales
async function getMonthlySales() {
  const twelveMonthsAgo = new Date()
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)

  const ventas = await prisma.$queryRaw`
    SELECT 
      DATE_TRUNC('month', "createdAt") as mes,
      COUNT(*) as cantidad_pedidos,
      SUM(total) as total_ventas
    FROM pedidos
    WHERE "estadoPedido" = 'ENTREGADO'
      AND "estadoPago" = 'PAGADO'
      AND "createdAt" >= ${twelveMonthsAgo}
    GROUP BY DATE_TRUNC('month', "createdAt")
    ORDER BY mes DESC
    LIMIT 12
  `

  // Formatear resultados
  return (ventas as any[]).map(v => ({
    mes: v.mes.toISOString().slice(0, 7), // YYYY-MM
    cantidad: Number(v.cantidad_pedidos),
    total: Number(v.total_ventas),
  }))
}

// Helper: Obtener productos más vendidos
async function getTopProducts() {
  const productos = await prisma.$queryRaw`
    SELECT 
      p.id,
      p.nombre,
      p."categoriaId",
      COUNT(pi.id) as total_vendido,
      SUM(pi.cantidad) as unidades_vendidas,
      SUM(pi.subtotal) as ingresos
    FROM productos p
    LEFT JOIN pedido_items pi ON p.id = pi."productoId"
    LEFT JOIN pedidos ped ON pi."pedidoId" = ped.id
    WHERE ped."estadoPedido" = 'ENTREGADO'
      AND ped."estadoPago" = 'PAGADO'
    GROUP BY p.id, p.nombre, p."categoriaId"
    ORDER BY unidades_vendidas DESC
    LIMIT 10
  `

  return productos
}

// Helper: Obtener categorías más vendidas
async function getTopCategories() {
  const categorias = await prisma.$queryRaw`
    SELECT 
      c.id,
      c.nombre,
      COUNT(DISTINCT ped.id) as pedidos,
      SUM(pi.subtotal) as ingresos,
      SUM(pi.cantidad) as unidades
    FROM categorias c
    LEFT JOIN productos p ON c.id = p."categoriaId"
    LEFT JOIN pedido_items pi ON p.id = pi."productoId"
    LEFT JOIN pedidos ped ON pi."pedidoId" = ped.id
    WHERE ped."estadoPedido" = 'ENTREGADO'
      AND ped."estadoPago" = 'PAGADO'
    GROUP BY c.id, c.nombre
    ORDER BY ingresos DESC
    LIMIT 5
  `

  return categorias
}

// Helper: Obtener mejores clientes
async function getTopCustomers() {
  const clientes = await prisma.$queryRaw`
    SELECT 
      COALESCE(u.id, ped."clienteEmail") as id,
      COALESCE(u.nombre, ped."clienteNombre") as nombre,
      ped."clienteEmail" as email,
      COUNT(ped.id) as total_pedidos,
      SUM(ped.total) as total_gastado
    FROM pedidos ped
    LEFT JOIN usuarios u ON ped."usuarioId" = u.id
    WHERE ped."estadoPedido" = 'ENTREGADO'
      AND ped."estadoPago" = 'PAGADO'
    GROUP BY u.id, ped."clienteEmail", ped."clienteNombre"
    ORDER BY total_gastado DESC
    LIMIT 10
  `

  return clientes
}

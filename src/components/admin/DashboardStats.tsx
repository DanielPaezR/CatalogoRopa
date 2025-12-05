// src/components/admin/DashboardStats.tsx
import { formatPrice } from '@/lib/utils'

interface DashboardStatsProps {
  stats?: {
    totalVentas: number
    totalPedidos: number
    pedidosPendientes: number
    totalProductos: number
    productosBajoStock: number
  }
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
  // Datos por defecto si no se proporcionan
  const defaultStats = {
    totalVentas: 0,
    totalPedidos: 0,
    pedidosPendientes: 0,
    totalProductos: 0,
    productosBajoStock: 0,
  }

  const data = stats || defaultStats

  const statCards = [
    {
      title: 'Ventas Totales',
      value: formatPrice(data.totalVentas),
      change: '+12.5%',
      trend: 'up',
      icon: (
        <div className="w-8 h-8 text-green-500">💰</div>
      ),
      color: 'bg-green-50 border-green-200',
    },
    {
      title: 'Pedidos Totales',
      value: data.totalPedidos.toString(),
      change: '+8.2%',
      trend: 'up',
      icon: (
        <div className="w-8 h-8 text-blue-500">📦</div>
      ),
      color: 'bg-blue-50 border-blue-200',
    },
    {
      title: 'Pedidos Pendientes',
      value: data.pedidosPendientes.toString(),
      change: '-3.1%',
      trend: 'down',
      icon: (
        <div className="w-8 h-8 text-yellow-500">⏳</div>
      ),
      color: 'bg-yellow-50 border-yellow-200',
    },
    {
      title: 'Productos Bajo Stock',
      value: data.productosBajoStock.toString(),
      change: '+5.3%',
      trend: 'up',
      icon: (
        <div className="w-8 h-8 text-red-500">⚠️</div>
      ),
      color: 'bg-red-50 border-red-200',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat) => (
        <div
          key={stat.title}
          className={`${stat.color} border rounded-xl p-6 hover:shadow-md transition-shadow`}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
            </div>
            <div className="p-3 rounded-lg bg-white">
              {stat.icon}
            </div>
          </div>
          <div className="flex items-center text-sm">
            <span className={`flex items-center ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {stat.trend === 'up' ? '↗' : '↘'} {stat.change}
            </span>
            <span className="text-gray-500 ml-2">vs. mes anterior</span>
          </div>
        </div>
      ))}
    </div>
  )
}
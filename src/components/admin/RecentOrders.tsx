// src/components/admin/RecentOrders.tsx
import Link from 'next/link'
import { formatPrice, formatDate } from '../../lib/utils'

interface Order {
  id: string
  numeroPedido: string
  clienteNombre: string
  total: number
  estado: 'PENDIENTE' | 'PROCESANDO' | 'ENVIADO' | 'ENTREGADO' | 'CANCELADO'
  fecha: string
}

export default function RecentOrders() {
  const orders: Order[] = [
    {
      id: '1',
      numeroPedido: 'PED-2024-001',
      clienteNombre: 'Juan Pérez',
      total: 149990,
      estado: 'ENTREGADO',
      fecha: '2024-01-15',
    },
    {
      id: '2',
      numeroPedido: 'PED-2024-002',
      clienteNombre: 'María Gómez',
      total: 89990,
      estado: 'ENVIADO',
      fecha: '2024-01-14',
    },
    {
      id: '3',
      numeroPedido: 'PED-2024-003',
      clienteNombre: 'Carlos Rodríguez',
      total: 249990,
      estado: 'PROCESANDO',
      fecha: '2024-01-13',
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ENTREGADO':
        return 'bg-green-100 text-green-800'
      case 'ENVIADO':
        return 'bg-blue-100 text-blue-800'
      case 'PROCESANDO':
        return 'bg-yellow-100 text-yellow-800'
      case 'PENDIENTE':
        return 'bg-gray-100 text-gray-800'
      case 'CANCELADO':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Pedido
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Cliente
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {order.numeroPedido}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{order.clienteNombre}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {formatPrice(order.total)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.estado)}`}>
                  {order.estado}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <Link
                  href={`/admin/pedidos/${order.id}`}
                  className="text-blue-600 hover:text-blue-900"
                >
                  Ver
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 text-right">
        <Link
          href="/admin/pedidos"
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          Ver todos →
        </Link>
      </div>
    </div>
  )
}
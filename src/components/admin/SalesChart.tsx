// src/components/admin/SalesChart.tsx

interface SalesChartProps {
  data?: Array<{
    mes: string
    ventas: number
    pedidos: number
  }>
}

export default function SalesChart({ data }: SalesChartProps) {
  // Datos de ejemplo si no hay datos reales
  const chartData = data && data.length > 0 ? data : [
    { mes: 'Ene', ventas: 4000, pedidos: 24 },
    { mes: 'Feb', ventas: 3000, pedidos: 18 },
    { mes: 'Mar', ventas: 5000, pedidos: 30 },
    { mes: 'Abr', ventas: 2780, pedidos: 22 },
    { mes: 'May', ventas: 1890, pedidos: 15 },
    { mes: 'Jun', ventas: 2390, pedidos: 19 },
    { mes: 'Jul', ventas: 3490, pedidos: 25 },
    { mes: 'Ago', ventas: 4300, pedidos: 32 },
    { mes: 'Sep', ventas: 4100, pedidos: 29 },
    { mes: 'Oct', ventas: 5200, pedidos: 35 },
    { mes: 'Nov', ventas: 6100, pedidos: 42 },
    { mes: 'Dic', ventas: 5800, pedidos: 38 },
  ]

  return (
    <div className="w-full h-full p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Ventas Mensuales</h3>
        <select className="text-sm border rounded-md px-3 py-1">
          <option>Últimos 6 meses</option>
          <option>Último año</option>
          <option>Últimos 2 años</option>
        </select>
      </div>
      
      <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
        <div className="text-center">
          <div className="text-gray-400 mb-2">📊</div>
          <p className="text-gray-500">Gráfico de ventas</p>
          <p className="text-sm text-gray-400 mt-1">
            Instala recharts para ver gráficos interactivos
          </p>
        </div>
      </div>
      
      <div className="mt-4 grid grid-cols-4 gap-4 text-center">
        <div>
          <div className="font-bold text-gray-900">$120K</div>
          <div className="text-sm text-gray-500">Ene</div>
        </div>
        <div>
          <div className="font-bold text-gray-900">$98K</div>
          <div className="text-sm text-gray-500">Feb</div>
        </div>
        <div>
          <div className="font-bold text-gray-900">$145K</div>
          <div className="text-sm text-gray-500">Mar</div>
        </div>
        <div>
          <div className="font-bold text-gray-900">$210K</div>
          <div className="text-sm text-gray-500">Abr</div>
        </div>
      </div>
    </div>
  )
}
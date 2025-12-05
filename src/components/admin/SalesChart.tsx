// src/components/admin/SalesChart.tsx
export default function SalesChart() {
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
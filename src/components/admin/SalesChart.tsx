'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface SalesChartProps {
  data: Array<{
    mes: string
    ventas: number
    pedidos: number
  }>
}

export default function SalesChart({ data }: SalesChartProps) {
  // Datos de ejemplo si no hay datos reales
  const chartData = data.length > 0 ? data : [
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

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString()}`
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.name === 'ventas' ? formatCurrency(entry.value) : entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="mes" 
            stroke="#6b7280"
            fontSize={12}
          />
          <YAxis 
            stroke="#6b7280"
            fontSize={12}
            tickFormatter={(value) => value >= 1000 ? `${value/1000}k` : value}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="ventas"
            stroke="#0ea5e9"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            name="Ventas ($)"
          />
          <Line
            type="monotone"
            dataKey="pedidos"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            name="Pedidos (cant.)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
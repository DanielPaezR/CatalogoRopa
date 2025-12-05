// src/components/admin/LowStockProducts.tsx
import Link from 'next/link'
import { formatPrice } from '../../lib/utils'

interface Product {
  id: string
  nombre: string
  sku: string
  stock: number
  stockMinimo: number
  precio: number
}

export default function LowStockProducts() {
  const products: Product[] = [
    {
      id: '1',
      nombre: 'Camiseta Básica Negra - M',
      sku: 'CT-001-M',
      stock: 2,
      stockMinimo: 10,
      precio: 24990,
    },
    {
      id: '2',
      nombre: 'Jeans Slim Fit - 32',
      sku: 'JN-001-32',
      stock: 3,
      stockMinimo: 15,
      precio: 89990,
    },
    {
      id: '3',
      nombre: 'Zapatillas Deportivas - 42',
      sku: 'ZP-001-42',
      stock: 1,
      stockMinimo: 5,
      precio: 129990,
    },
  ]

  const getStockColor = (stock: number, stockMinimo: number) => {
    const percentage = (stock / stockMinimo) * 100
    if (percentage <= 20) return 'text-red-600'
    if (percentage <= 50) return 'text-yellow-600'
    return 'text-green-600'
  }

  return (
    <div className="space-y-3">
      {products.map((product) => (
        <div
          key={product.id}
          className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
        >
          <div className="flex-1">
            <h4 className="font-medium text-gray-900">{product.nombre}</h4>
            <div className="text-sm text-gray-500">SKU: {product.sku}</div>
          </div>
          
          <div className="text-right">
            <div className={`font-bold ${getStockColor(product.stock, product.stockMinimo)}`}>
              {product.stock} unidades
            </div>
            <div className="text-sm text-gray-500">
              Mín: {product.stockMinimo}
            </div>
          </div>
        </div>
      ))}

      <div className="pt-3 border-t">
        <Link
          href="/admin/productos"
          className="block text-center py-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          Ver todos →
        </Link>
      </div>
    </div>
  )
}
'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Product {
  id: string
  nombre: string
  sku: string
  stock: number
  stockMinimo: number
  precio: number
}

export default function LowStockProducts() {
  const [products] = useState<Product[]>([
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
    {
      id: '4',
      nombre: 'Vestido Floral - S',
      sku: 'VS-001-S',
      stock: 4,
      stockMinimo: 8,
      precio: 69990,
    },
  ])

  const getStockColor = (stock: number, stockMinimo: number) => {
    const percentage = (stock / stockMinimo) * 100
    if (percentage <= 20) return 'text-red-600'
    if (percentage <= 50) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getStockStatus = (stock: number, stockMinimo: number) => {
    if (stock === 0) return 'Agotado'
    if (stock < stockMinimo * 0.2) return 'Crítico'
    if (stock < stockMinimo * 0.5) return 'Bajo'
    return 'Aceptable'
  }

  return (
    <div className="space-y-4">
      {products.map((product) => (
        <div
          key={product.id}
          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${getStockColor(product.stock, product.stockMinimo)}`} />
              <div>
                <h4 className="font-medium text-gray-900">{product.nombre}</h4>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>SKU: {product.sku}</span>
                  <span>Stock mínimo: {product.stockMinimo}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className={`font-bold ${getStockColor(product.stock, product.stockMinimo)}`}>
              {product.stock} unidades
            </div>
            <div className="text-sm text-gray-500">
              {getStockStatus(product.stock, product.stockMinimo)}
            </div>
          </div>
        </div>
      ))}

      {products.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          No hay productos con stock bajo
        </div>
      ) : (
        <div className="pt-4 border-t">
          <Link
            href="/admin/productos?stock=bajo"
            className="block w-full text-center py-2 text-primary-600 hover:text-primary-800 text-sm font-medium"
          >
            Ver todos los productos con stock bajo →
          </Link>
        </div>
      )}
    </div>
  )
}
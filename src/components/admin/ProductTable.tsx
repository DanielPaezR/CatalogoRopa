'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatPrice } from '../../lib/utils'

interface ProductTableProps {
  products: Array<{
    id: string
    nombre: string
    sku: string
    precio: number
    stock: number
    activo: boolean
    categoria: {
      nombre: string
    }
  }>
  onDelete: (id: string) => Promise<void>
  onToggleStatus: (id: string, currentStatus: boolean) => Promise<void>
}

export default function ProductTable({
  products,
  onDelete,
  onToggleStatus,
}: ProductTableProps) {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedProducts(products.map(p => p.id))
    } else {
      setSelectedProducts([])
    }
  }

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete') => {
    if (selectedProducts.length === 0) return

    if (action === 'delete' && !confirm(`¿Estás seguro de eliminar ${selectedProducts.length} productos?`)) {
      return
    }

    try {
      // Aquí irían las llamadas a la API para acciones masivas
      for (const productId of selectedProducts) {
        if (action === 'delete') {
          await onDelete(productId)
        } else {
          // Para activar/desactivar necesitaríamos saber el estado actual
          // Esto es un ejemplo simplificado
        }
      }
      
      setSelectedProducts([])
    } catch (error) {
      console.error('Error en acción masiva:', error)
    }
  }

  return (
    <div className="overflow-x-auto">
      {/* Acciones masivas */}
      {selectedProducts.length > 0 && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="text-sm text-blue-700">
              {selectedProducts.length} productos seleccionados
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleBulkAction('activate')}
                className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
              >
                Activar
              </button>
              <button
                onClick={() => handleBulkAction('deactivate')}
                className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
              >
                Desactivar
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
              >
                Eliminar
              </button>
              <button
                onClick={() => setSelectedProducts([])}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <input
                type="checkbox"
                checked={selectedProducts.length === products.length && products.length > 0}
                onChange={handleSelectAll}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Producto
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Categoría
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Precio
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Stock
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
          {products.map((product) => (
            <tr key={product.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <input
                  type="checkbox"
                  checked={selectedProducts.includes(product.id)}
                  onChange={() => handleSelectProduct(product.id)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
              </td>
              <td className="px-6 py-4">
                <div>
                  <div className="font-medium text-gray-900">{product.nombre}</div>
                  <div className="text-sm text-gray-500">SKU: {product.sku}</div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                  {product.categoria.nombre}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {formatPrice(product.precio)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    product.stock === 0 ? 'bg-red-500' :
                    product.stock < 10 ? 'bg-yellow-500' : 'bg-green-500'
                  }`} />
                  <span className={`text-sm font-medium ${
                    product.stock === 0 ? 'text-red-600' :
                    product.stock < 10 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {product.stock} unidades
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <button
                  onClick={() => onToggleStatus(product.id, product.activo)}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    product.activo
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : 'bg-red-100 text-red-800 hover:bg-red-200'
                  }`}
                >
                  {product.activo ? 'Activo' : 'Inactivo'}
                </button>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-3">
                  <Link
                    href={`/admin/productos/${product.id}`}
                    className="text-primary-600 hover:text-primary-900"
                  >
                    Editar
                  </Link>
                  <button
                    onClick={() => onDelete(product.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Eliminar
                  </button>
                  <Link
                    href={`/productos/${product.id}`}
                    target="_blank"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Ver
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
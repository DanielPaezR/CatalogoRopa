'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatPrice } from '../../../lib/utils'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import { toast } from 'react-hot-toast'

interface Producto {
  id: string
  nombre: string
  sku: string
  precio: number
  stock: number
  activo: boolean
  categoria: {
    nombre: string
  }
  createdAt: string
}

export default function AdminProductosPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({
    categoria: '',
    stock: '',
    activo: '',
  })

  useEffect(() => {
    fetchProducts()
  }, [search, filters])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (filters.categoria) params.set('categoria', filters.categoria)
      if (filters.stock) params.set('stock', filters.stock)
      if (filters.activo) params.set('activo', filters.activo)

      const response = await fetch(`/api/admin/productos?${params.toString()}`)
      if (!response.ok) throw new Error('Error al cargar productos')
      
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      toast.error('Error al cargar productos')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return

    try {
      const response = await fetch(`/api/admin/productos/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Error al eliminar producto')

      toast.success('Producto eliminado')
      fetchProducts()
    } catch (error) {
      toast.error('Error al eliminar producto')
    }
  }

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/productos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activo: !currentStatus }),
      })

      if (!response.ok) throw new Error('Error al actualizar estado')

      toast.success(`Producto ${!currentStatus ? 'activado' : 'desactivado'}`)
      fetchProducts()
    } catch (error) {
      toast.error('Error al actualizar estado')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Productos</h1>
              <p className="text-gray-600">Administra el catálogo de productos</p>
            </div>
            <Link href="/admin/productos/nuevo">
              <Button>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nuevo Producto
              </Button>
            </Link>
          </div>

          {/* Filtros y búsqueda */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <Input
                  placeholder="Buscar por nombre, SKU..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  icon={
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  }
                />
              </div>
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={filters.categoria}
                onChange={(e) => setFilters({ ...filters, categoria: e.target.value })}
              >
                <option value="">Todas las categorías</option>
                <option value="hombre">Hombre</option>
                <option value="mujer">Mujer</option>
                <option value="niños">Niños</option>
                <option value="accesorios">Accesorios</option>
              </select>
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={filters.stock}
                onChange={(e) => setFilters({ ...filters, stock: e.target.value })}
              >
                <option value="">Todo el stock</option>
                <option value="bajo">Stock bajo</option>
                <option value="agotado">Agotado</option>
                <option value="disponible">Disponible</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabla de productos */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📦</div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                No se encontraron productos
              </h3>
              <p className="text-gray-500 mb-6">
                {search ? 'Intenta con otros términos de búsqueda' : 'Comienza agregando tu primer producto'}
              </p>
              <Link href="/admin/productos/nuevo">
                <Button>Agregar primer producto</Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
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
                          onClick={() => handleToggleStatus(product.id, product.activo)}
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
                            onClick={() => handleDelete(product.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Paginación */}
          {products.length > 0 && (
            <div className="border-t border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Mostrando <span className="font-medium">1</span> a{' '}
                  <span className="font-medium">{products.length}</span> de{' '}
                  <span className="font-medium">{products.length}</span> productos
                </div>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 border rounded text-sm text-gray-600 hover:bg-gray-50">
                    Anterior
                  </button>
                  <button className="px-3 py-1 border rounded text-sm text-gray-600 hover:bg-gray-50">
                    Siguiente
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Estadísticas rápidas */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Resumen de stock</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total productos</span>
                <span className="font-medium">{products.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Stock bajo</span>
                <span className="font-medium text-yellow-600">
                  {products.filter(p => p.stock > 0 && p.stock < 10).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Agotados</span>
                <span className="font-medium text-red-600">
                  {products.filter(p => p.stock === 0).length}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Valor de inventario</h3>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {formatPrice(
                products.reduce((sum, product) => sum + (product.precio * product.stock), 0)
              )}
            </div>
            <p className="text-sm text-gray-600">
              Valor total del inventario actual
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Acciones rápidas</h3>
            <div className="space-y-3">
              <Link
                href="/admin/productos/nuevo"
                className="block w-full text-center py-2 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors"
              >
                Agregar producto
              </Link>
              <button className="block w-full text-center py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                Exportar lista
              </button>
              <button className="block w-full text-center py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                Actualizar precios
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
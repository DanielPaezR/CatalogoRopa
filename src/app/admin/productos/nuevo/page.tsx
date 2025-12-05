'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

interface Categoria {
  id: string
  nombre: string
}

export default function NuevoProductoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [formData, setFormData] = useState({
    nombre: '',
    descripcionCorta: '',
    descripcionLarga: '',
    sku: '',
    precio: '',
    precioOriginal: '',
    categoriaId: '',
    stock: '',
    stockMinimo: '10',
    tallas: [] as string[],
    colores: [] as string[],
    tags: '',
    destacado: false,
    activo: true,
  })

  const [variantes, setVariantes] = useState<
    Array<{
      talla: string
      color: string
      stock: string
      precio: string
      sku: string
    }>
  >([])

  const tallasDisponibles = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
  const coloresDisponibles = ['Negro', 'Blanco', 'Rojo', 'Azul', 'Verde', 'Gris', 'Beige']

  useEffect(() => {
    fetchCategorias()
  }, [])

  const fetchCategorias = async () => {
    try {
      const response = await fetch('/api/categorias')
      if (!response.ok) throw new Error('Error al cargar categorías')
      const data = await response.json()
      setCategorias(data)
    } catch (error) {
      toast.error('Error al cargar categorías')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleTallaToggle = (talla: string) => {
    setFormData(prev => ({
      ...prev,
      tallas: prev.tallas.includes(talla)
        ? prev.tallas.filter(t => t !== talla)
        : [...prev.tallas, talla]
    }))
  }

  const handleColorToggle = (color: string) => {
    setFormData(prev => ({
      ...prev,
      colores: prev.colores.includes(color)
        ? prev.colores.filter(c => c !== color)
        : [...prev.colores, color]
    }))
  }

  const handleAddVariante = () => {
    setVariantes([...variantes, {
      talla: '',
      color: '',
      stock: '',
      precio: '',
      sku: '',
    }])
  }

  const handleVarianteChange = (index: number, field: string, value: string) => {
    const newVariantes = [...variantes]
    newVariantes[index] = { ...newVariantes[index], [field]: value }
    setVariantes(newVariantes)
  }

  const handleRemoveVariante = (index: number) => {
    setVariantes(variantes.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const productoData = {
        ...formData,
        precio: parseFloat(formData.precio),
        precioOriginal: formData.precioOriginal ? parseFloat(formData.precioOriginal) : null,
        stock: parseInt(formData.stock),
        stockMinimo: parseInt(formData.stockMinimo),
        tags: formData.tags.split(',').map(tag => tag.trim()),
        variantes: variantes.map(v => ({
          ...v,
          stock: parseInt(v.stock),
          precio: parseFloat(v.precio),
        })).filter(v => v.talla && v.color),
      }

      const response = await fetch('/api/admin/productos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productoData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al crear producto')
      }

      toast.success('Producto creado exitosamente')
      router.push('/admin/productos')
    } catch (error: any) {
      toast.error(error.message || 'Error al crear producto')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Nuevo Producto</h1>
              <p className="text-gray-600">Agrega un nuevo producto al catálogo</p>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push('/admin/productos')}
            >
              ← Volver
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Información básica */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-6">Información básica</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del producto *
                </label>
                <Input
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  required
                  placeholder="Ej: Camiseta Básica Negra"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SKU *
                </label>
                <Input
                  name="sku"
                  value={formData.sku}
                  onChange={handleInputChange}
                  required
                  placeholder="Ej: CT-001"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción corta *
                </label>
                <textarea
                  name="descripcionCorta"
                  value={formData.descripcionCorta}
                  onChange={handleInputChange}
                  required
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Descripción breve del producto"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción detallada
                </label>
                <textarea
                  name="descripcionLarga"
                  value={formData.descripcionLarga}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Descripción completa del producto"
                />
              </div>
            </div>
          </div>

          {/* Precios y stock */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-6">Precios y stock</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio de venta *
                </label>
                <Input
                  name="precio"
                  type="number"
                  value={formData.precio}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  icon={<span className="text-gray-500">$</span>}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio original (opcional)
                </label>
                <Input
                  name="precioOriginal"
                  type="number"
                  value={formData.precioOriginal}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  icon={<span className="text-gray-500">$</span>}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock inicial *
                </label>
                <Input
                  name="stock"
                  type="number"
                  value={formData.stock}
                  onChange={handleInputChange}
                  required
                  min="0"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock mínimo
                </label>
                <Input
                  name="stockMinimo"
                  type="number"
                  value={formData.stockMinimo}
                  onChange={handleInputChange}
                  min="1"
                  placeholder="10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría *
                </label>
                <select
                  name="categoriaId"
                  value={formData.categoriaId}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Seleccionar categoría</option>
                  {categorias.map((categoria) => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <Input
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="camiseta, básica, algodón"
                />
              </div>
            </div>
          </div>

          {/* Tallas y colores */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-6">Tallas y colores</h2>
            
            <div className="mb-8">
              <h3 className="font-medium mb-3">Tallas disponibles</h3>
              <div className="flex flex-wrap gap-2">
                {tallasDisponibles.map((talla) => (
                  <button
                    key={talla}
                    type="button"
                    onClick={() => handleTallaToggle(talla)}
                    className={`px-4 py-2 border rounded-lg font-medium ${
                      formData.tallas.includes(talla)
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'border-gray-300 hover:border-primary-500'
                    }`}
                  >
                    {talla}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-3">Colores disponibles</h3>
              <div className="flex flex-wrap gap-3">
                {coloresDisponibles.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handleColorToggle(color)}
                    className={`flex items-center space-x-2 px-4 py-2 border rounded-lg ${
                      formData.colores.includes(color)
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-300 hover:border-primary-500'
                    }`}
                  >
                    <span
                      className="w-6 h-6 rounded-full border"
                      style={{ backgroundColor: getColorHex(color) }}
                    />
                    <span>{color}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Variantes (tallas específicas con precios diferentes) */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Variantes específicas</h2>
              <Button
                type="button"
                variant="outline"
                onClick={handleAddVariante}
              >
                + Agregar variante
              </Button>
            </div>

            {variantes.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                No hay variantes agregadas. Agrega variantes si necesitas precios o stock diferentes por talla/color.
              </div>
            ) : (
              <div className="space-y-4">
                {variantes.map((variante, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-medium">Variante #{index + 1}</h3>
                      <button
                        type="button"
                        onClick={() => handleRemoveVariante(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Eliminar
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Talla
                        </label>
                        <select
                          value={variante.talla}
                          onChange={(e) => handleVarianteChange(index, 'talla', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="">Seleccionar talla</option>
                          {tallasDisponibles.map((talla) => (
                            <option key={talla} value={talla}>{talla}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Color
                        </label>
                        <select
                          value={variante.color}
                          onChange={(e) => handleVarianteChange(index, 'color', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="">Seleccionar color</option>
                          {coloresDisponibles.map((color) => (
                            <option key={color} value={color}>{color}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          SKU específico
                        </label>
                        <Input
                          value={variante.sku}
                          onChange={(e) => handleVarianteChange(index, 'sku', e.target.value)}
                          placeholder="Ej: CT-001-M-NEGRO"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Stock
                        </label>
                        <Input
                          type="number"
                          value={variante.stock}
                          onChange={(e) => handleVarianteChange(index, 'stock', e.target.value)}
                          min="0"
                          placeholder="0"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Precio específico (opcional)
                        </label>
                        <Input
                          type="number"
                          value={variante.precio}
                          onChange={(e) => handleVarianteChange(index, 'precio', e.target.value)}
                          min="0"
                          step="0.01"
                          placeholder="Dejar vacío para usar precio general"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Configuración adicional */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-6">Configuración adicional</h2>
            <div className="space-y-4">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="destacado"
                  checked={formData.destacado}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Producto destacado
                </span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="activo"
                  checked={formData.activo}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Producto activo (visible en la tienda)
                </span>
              </label>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/admin/productos')}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              isLoading={loading}
              disabled={loading}
            >
              {loading ? 'Creando producto...' : 'Crear producto'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function getColorHex(color: string): string {
  const colorMap: Record<string, string> = {
    Negro: '#000000',
    Blanco: '#FFFFFF',
    Rojo: '#DC2626',
    Azul: '#2563EB',
    Verde: '#16A34A',
    Gris: '#6B7280',
    Beige: '#D6D3D1',
  }
  return colorMap[color] || '#CCCCCC'
}
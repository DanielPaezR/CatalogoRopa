'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
interface Categoria {
  id: string
  nombre: string
  slug: string
  imagen?: string
  descripcion?: string
  orden: number
  activo: boolean
}

interface ProductFiltersProps {
  categorias: Categoria[]
  priceRange: {
    min: number
    max: number
  }
  currentFilters: Record<string, string>
}

export default function ProductFilters({
  categorias,
  priceRange,
  currentFilters,
}: ProductFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [priceRangeValue, setPriceRangeValue] = useState([
    currentFilters.minPrice ? parseInt(currentFilters.minPrice) : priceRange.min,
    currentFilters.maxPrice ? parseInt(currentFilters.maxPrice) : priceRange.max,
  ])
  
  const [selectedTallas, setSelectedTallas] = useState<string[]>(
    currentFilters.tallas ? currentFilters.tallas.split(',') : []
  )
  
  const [selectedColores, setSelectedColores] = useState<string[]>(
    currentFilters.colores ? currentFilters.colores.split(',') : []
  )

  const tallasDisponibles = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
  const coloresDisponibles = [
    'Negro', 'Blanco', 'Rojo', 'Azul', 'Verde', 'Gris', 
    'Beige', 'Rosa', 'Amarillo', 'Marrón'
  ]

  const updateFilters = (newFilters: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString())
    
    // Eliminar página actual cuando se cambian filtros
    params.delete('page')
    
    // Actualizar filtros
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })
    
    router.push(`/productos?${params.toString()}`)
  }

  const handleCategoriaChange = (categoriaSlug: string) => {
    updateFilters({ categoria: categoriaSlug })
  }

  const handlePriceChange = (min: number, max: number) => {
    updateFilters({
      minPrice: min.toString(),
      maxPrice: max.toString(),
    })
  }

  const handleTallaToggle = (talla: string) => {
    const newTallas = selectedTallas.includes(talla)
      ? selectedTallas.filter(t => t !== talla)
      : [...selectedTallas, talla]
    
    setSelectedTallas(newTallas)
    updateFilters({
      tallas: newTallas.length > 0 ? newTallas.join(',') : '',
    })
  }

  const handleColorToggle = (color: string) => {
    const newColores = selectedColores.includes(color)
      ? selectedColores.filter(c => c !== color)
      : [...selectedColores, color]
    
    setSelectedColores(newColores)
    updateFilters({
      colores: newColores.length > 0 ? newColores.join(',') : '',
    })
  }

  const handleOfertasToggle = () => {
    const ofertas = currentFilters.ofertas === 'true' ? '' : 'true'
    updateFilters({ ofertas })
  }

  const handleDestacadosToggle = () => {
    const destacados = currentFilters.destacados === 'true' ? '' : 'true'
    updateFilters({ destacados })
  }

  const clearFilters = () => {
    router.push('/productos')
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Filtros</h3>
        <button
          onClick={clearFilters}
          className="text-sm text-primary-600 hover:text-primary-800"
        >
          Limpiar todo
        </button>
      </div>

      {/* Categorías */}
      <div>
        <h4 className="font-medium mb-3">Categorías</h4>
        <div className="space-y-2">
          <button
            onClick={() => handleCategoriaChange('todas')}
            className={`block w-full text-left px-3 py-2 rounded text-sm ${
              (!currentFilters.categoria || currentFilters.categoria === 'todas')
                ? 'bg-primary-100 text-primary-700'
                : 'hover:bg-gray-100'
            }`}
          >
            Todas las categorías
          </button>
          {categorias.map((categoria) => (
            <button
              key={categoria.id}
              onClick={() => handleCategoriaChange(categoria.slug)}
              className={`block w-full text-left px-3 py-2 rounded text-sm ${
                currentFilters.categoria === categoria.slug
                  ? 'bg-primary-100 text-primary-700'
                  : 'hover:bg-gray-100'
              }`}
            >
              {categoria.nombre}
            </button>
          ))}
        </div>
      </div>

      {/* Rango de precio */}
      <div>
        <h4 className="font-medium mb-3">Rango de precio</h4>
        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-sm">${priceRangeValue[0].toLocaleString()}</span>
            <span className="text-sm">${priceRangeValue[1].toLocaleString()}</span>
          </div>
          <input
            type="range"
            min={priceRange.min}
            max={priceRange.max}
            step="1000"
            value={priceRangeValue[0]}
            onChange={(e) => {
              const newValue = [parseInt(e.target.value), priceRangeValue[1]]
              setPriceRangeValue(newValue)
              handlePriceChange(newValue[0], newValue[1])
            }}
            className="w-full"
          />
          <input
            type="range"
            min={priceRange.min}
            max={priceRange.max}
            step="1000"
            value={priceRangeValue[1]}
            onChange={(e) => {
              const newValue = [priceRangeValue[0], parseInt(e.target.value)]
              setPriceRangeValue(newValue)
              handlePriceChange(newValue[0], newValue[1])
            }}
            className="w-full"
          />
        </div>
      </div>

      {/* Tallas */}
      <div>
        <h4 className="font-medium mb-3">Tallas</h4>
        <div className="flex flex-wrap gap-2">
          {tallasDisponibles.map((talla) => (
            <button
              key={talla}
              onClick={() => handleTallaToggle(talla)}
              className={`px-3 py-1 text-sm border rounded ${
                selectedTallas.includes(talla)
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'border-gray-300 hover:border-primary-500'
              }`}
            >
              {talla}
            </button>
          ))}
        </div>
      </div>

      {/* Colores */}
      <div>
        <h4 className="font-medium mb-3">Colores</h4>
        <div className="flex flex-wrap gap-2">
          {coloresDisponibles.map((color) => (
            <button
              key={color}
              onClick={() => handleColorToggle(color)}
              className={`px-3 py-1 text-sm border rounded flex items-center gap-2 ${
                selectedColores.includes(color)
                  ? 'bg-primary-100 text-primary-700 border-primary-300'
                  : 'border-gray-300 hover:border-primary-500'
              }`}
            >
              <span
                className="w-4 h-4 rounded-full"
                style={{
                  backgroundColor: getColorValue(color),
                }}
              />
              {color}
            </button>
          ))}
        </div>
      </div>

      {/* Filtros especiales */}
      <div>
        <h4 className="font-medium mb-3">Especiales</h4>
        <div className="space-y-2">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={currentFilters.ofertas === 'true'}
              onChange={handleOfertasToggle}
              className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <span className="text-sm">Solo ofertas</span>
          </label>
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={currentFilters.destacados === 'true'}
              onChange={handleDestacadosToggle}
              className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <span className="text-sm">Solo destacados</span>
          </label>
        </div>
      </div>
    </div>
  )
}

function getColorValue(color: string): string {
  const colorMap: Record<string, string> = {
    Negro: '#000000',
    Blanco: '#ffffff',
    Rojo: '#dc2626',
    Azul: '#2563eb',
    Verde: '#16a34a',
    Gris: '#6b7280',
    Beige: '#d6d3d1',
    Rosa: '#ec4899',
    Amarillo: '#fbbf24',
    Marrón: '#92400e',
  }
  return colorMap[color] || '#cccccc'
}
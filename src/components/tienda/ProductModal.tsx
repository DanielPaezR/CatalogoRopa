'use client'

import { useState } from 'react'
import { useCart } from '@/context/CartContext'
import { ProductoWithRelations } from '@/types'
import { toast } from 'react-hot-toast'
import { formatPrice } from '@/lib/utils'

interface ProductModalProps {
  producto: ProductoWithRelations
}

export default function ProductModal({ producto }: ProductModalProps) {
  const [selectedTalla, setSelectedTalla] = useState<string>('')
  const [selectedColor, setSelectedColor] = useState<string>('')
  const [cantidad, setCantidad] = useState(1)
  const [loading, setLoading] = useState(false)
  
  const { addToCart } = useCart()

  const precio = parseFloat(producto.precio.toString())
  const tallasDisponibles = Array.from(new Set(producto.variantes
    .filter(v => v.stock > 0)
    .map(v => v.talla)
    .concat(producto.tallas)
  )).filter(Boolean)

  const coloresDisponibles = Array.from(new Set(producto.variantes
    .filter(v => v.stock > 0)
    .map(v => v.color)
    .concat(producto.colores)
  )).filter(Boolean)

  const varianteSeleccionada = producto.variantes.find(
    v => v.talla === selectedTalla && v.color === selectedColor
  )

  const stockDisponible = varianteSeleccionada?.stock || producto.stock
  const precioFinal = varianteSeleccionada?.precio 
    ? parseFloat(varianteSeleccionada.precio.toString())
    : precio

  const handleAddToCart = async () => {
    if (producto.stock <= 0) {
      toast.error('Producto agotado')
      return
    }

    // Validar selección si hay variantes
    if ((tallasDisponibles.length > 0 && !selectedTalla) || 
        (coloresDisponibles.length > 0 && !selectedColor)) {
      toast.error('Por favor selecciona todas las opciones requeridas')
      return
    }

    if (cantidad > stockDisponible) {
      toast.error(`Solo quedan ${stockDisponible} unidades disponibles`)
      return
    }

    setLoading(true)
    try {
      await addToCart({
        id: producto.id,
        nombre: producto.nombre,
        precio: precioFinal,
        imagen: producto.imagenes[0],
        cantidad,
        stock: stockDisponible,
        talla: selectedTalla || null,
        color: selectedColor || null,
        varianteId: varianteSeleccionada?.id
      })
      
      toast.success('Producto agregado al carrito')
      setCantidad(1) // Reset cantidad
    } catch (error: any) {
      toast.error(error.message || 'Error al agregar producto')
    } finally {
      setLoading(false)
    }
  }

  const handleBuyNow = () => {
    handleAddToCart().then(() => {
      // Aquí podríamos redirigir directamente al carrito
      // window.location.href = '/carrito'
    })
  }

  return (
    <div className="space-y-6">
      {/* Cantidad */}
      <div>
        <h4 className="font-medium mb-3">Cantidad</h4>
        <div className="flex items-center">
          <button
            onClick={() => setCantidad(prev => Math.max(1, prev - 1))}
            className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-l-lg hover:bg-gray-50"
            disabled={cantidad <= 1}
          >
            -
          </button>
          <input
            type="number"
            min="1"
            max={stockDisponible}
            value={cantidad}
            onChange={(e) => {
              const value = parseInt(e.target.value)
              if (!isNaN(value) && value >= 1 && value <= stockDisponible) {
                setCantidad(value)
              }
            }}
            className="w-16 h-10 text-center border-t border-b border-gray-300"
          />
          <button
            onClick={() => setCantidad(prev => Math.min(stockDisponible, prev + 1))}
            className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-r-lg hover:bg-gray-50"
            disabled={cantidad >= stockDisponible}
          >
            +
          </button>
          <span className="ml-3 text-gray-600">
            {stockDisponible} disponibles
          </span>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex space-x-4">
        <button
          onClick={handleAddToCart}
          disabled={loading || producto.stock <= 0}
          className="flex-1 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Agregando...
            </span>
          ) : (
            'Agregar al carrito'
          )}
        </button>
        
        <button
          onClick={handleBuyNow}
          disabled={loading || producto.stock <= 0}
          className="flex-1 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Comprar ahora
        </button>
      </div>

      {/* Información adicional */}
      <div className="border-t pt-6 space-y-3">
        <div className="flex items-center text-sm text-gray-600">
          <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Envío gratis en compras mayores a $50.000
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Devoluciones gratuitas en 30 días
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Pago seguro con Stripe
        </div>
      </div>
    </div>
  )
}
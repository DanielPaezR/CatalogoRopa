'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

export default function PagoExitosoPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { clearCart } = useCart()
  
  const [pedido, setPedido] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    const pedidoId = searchParams.get('pedido_id')

    if (!sessionId && !pedidoId) {
      setError('No se encontró información del pedido')
      setLoading(false)
      return
    }

    // Limpiar carrito
    clearCart()

    // Simular obtención de datos del pedido
    // En producción, aquí harías una llamada a la API
    setTimeout(() => {
      setPedido({
        id: pedidoId || 'PED-' + Date.now(),
        numeroPedido: pedidoId || 'PED-' + Date.now(),
        fecha: new Date().toISOString(),
        total: 149990,
        items: [
          { nombre: 'Camiseta Básica Negra', cantidad: 2, precio: 24990 },
          { nombre: 'Jeans Slim Fit', cantidad: 1, precio: 89990 },
        ],
        direccion: {
          nombre: 'Juan Pérez',
          direccion: 'Calle 123 # 45-67',
          ciudad: 'Bogotá',
          pais: 'Colombia',
          telefono: '+57 300 123 4567',
        },
      })
      setLoading(false)
    }, 2000)
  }, [searchParams, clearCart])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Confirmando tu pago...</p>
        </div>
      </div>
    )
  }

  if (error || !pedido) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">❌</div>
        <h1 className="text-3xl font-bold mb-4">Error en la confirmación</h1>
        <p className="text-gray-600 mb-8">
          {error || 'No se pudo confirmar tu pedido. Por favor contacta a soporte.'}
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Volver al inicio
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        {/* Mensaje de éxito */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            ¡Pago confirmado!
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            Tu pedido ha sido procesado exitosamente
          </p>
          <p className="text-gray-500">
            Número de pedido: <span className="font-bold">{pedido.numeroPedido}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Resumen del pedido */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold mb-6">Resumen del pedido</h2>
              
              <div className="space-y-4">
                {pedido.items.map((item: any, index: number) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gray-100 rounded"></div>
                      <div>
                        <h3 className="font-medium">{item.nombre}</h3>
                        <p className="text-sm text-gray-500">Cantidad: {item.cantidad}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">
                        ${(item.precio * item.cantidad).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        ${item.precio.toLocaleString()} c/u
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between mb-2">
                  <span>Subtotal</span>
                  <span>${pedido.items.reduce((sum: number, item: any) => sum + (item.precio * item.cantidad), 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Envío</span>
                  <span className="text-green-600">Gratis</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total</span>
                  <span>${pedido.total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Información de envío */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-6">Información de envío</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">Dirección de entrega</h3>
                  <p className="text-gray-600">
                    {pedido.direccion.nombre}<br />
                    {pedido.direccion.direccion}<br />
                    {pedido.direccion.ciudad}<br />
                    {pedido.direccion.pais}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Contacto</h3>
                  <p className="text-gray-600">
                    Teléfono: {pedido.direccion.telefono}<br />
                    Email: {pedido.direccion.email || 'No proporcionado'}
                  </p>
                </div>
              </div>
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-blue-700 text-sm">
                  <strong>📦 Estimado de entrega:</strong> 3-5 días hábiles<br />
                  <strong>📧 Confirmación:</strong> Hemos enviado un correo con los detalles de tu pedido
                </p>
              </div>
            </div>
          </div>

          {/* Información adicional */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6 mb-6 sticky top-24">
              <h2 className="text-xl font-bold mb-6">Siguientes pasos</h2>
              
              <div className="space-y-6">
                <div>
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-primary-600 font-bold">1</span>
                    </div>
                    <h3 className="font-medium">Confirmación por email</h3>
                  </div>
                  <p className="text-sm text-gray-600 ml-11">
                    Recibirás un email con todos los detalles de tu compra
                  </p>
                </div>

                <div>
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-primary-600 font-bold">2</span>
                    </div>
                    <h3 className="font-medium">Procesamiento</h3>
                  </div>
                  <p className="text-sm text-gray-600 ml-11">
                    Tu pedido será preparado en 24-48 horas
                  </p>
                </div>

                <div>
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-primary-600 font-bold">3</span>
                    </div>
                    <h3 className="font-medium">Envío</h3>
                  </div>
                  <p className="text-sm text-gray-600 ml-11">
                    Recibirás un email con el número de seguimiento
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t">
                <h3 className="font-bold mb-4">¿Necesitas ayuda?</h3>
                <div className="space-y-3">
                  <a
                    href="/contacto"
                    className="block w-full py-2 text-center border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Contactar soporte
                  </a>
                  <Link
                    href="/productos"
                    className="block w-full py-2 text-center bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    Seguir comprando
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
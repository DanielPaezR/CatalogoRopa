'use client';

import { useCart } from '../../../context/CartContext';
import Link from 'next/link';
import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from '../../../components/tienda/CheckoutForm';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CarritoPage() {
  const { items, removeFromCart, updateQuantity, getTotal, clearCart } = useCart();
  const [isCheckout, setIsCheckout] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      setIsCheckout(true);
    } catch (error) {
      console.error('Error al iniciar checkout:', error);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h1 className="text-3xl font-bold mb-4">Tu carrito está vacío</h1>
        <p className="text-gray-600 mb-8">
          Parece que aún no has agregado productos a tu carrito
        </p>
        <Link
          href="/productos"
          className="inline-block px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
        >
          Ver Productos
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Carrito de Compras</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {isCheckout ? (
            <Elements stripe={stripePromise}>
              <CheckoutForm
                items={items}
                total={getTotal()}
                onBack={() => setIsCheckout(false)}
                onSuccess={() => {
                  clearCart();
                  setIsCheckout(false);
                }}
              />
            </Elements>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="divide-y">
                {items.map((item) => (
                  <div
                    key={`${item.id}-${item.talla}-${item.color}`}
                    className="p-6 flex items-start space-x-4"
                  >
                    <img
                      src={item.imagen}
                      alt={item.nombre}
                      className="w-24 h-24 object-cover rounded"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="font-medium text-lg">{item.nombre}</h3>
                          {(item.talla || item.color) && (
                            <p className="text-gray-500 text-sm mt-1">
                              {item.talla && `Talla: ${item.talla}`}
                              {item.talla && item.color && ' • '}
                              {item.color && `Color: ${item.color}`}
                            </p>
                          )}
                          <p className="text-gray-500 text-sm">
                            Stock disponible: {item.stock}
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            removeFromCart(item.id, item.talla, item.color)
                          }
                          className="text-gray-400 hover:text-red-500"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                item.cantidad - 1,
                                item.talla,
                                item.color
                              )
                            }
                            className="w-10 h-10 flex items-center justify-center border rounded hover:bg-gray-50"
                          >
                            -
                          </button>
                          <span className="font-medium">{item.cantidad}</span>
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                item.cantidad + 1,
                                item.talla,
                                item.color
                              )
                            }
                            className="w-10 h-10 flex items-center justify-center border rounded hover:bg-gray-50"
                          >
                            +
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">
                            ${(item.precio * item.cantidad).toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-500">
                            ${item.precio.toLocaleString()} c/u
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {!isCheckout && (
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-6">Resumen del Pedido</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${getTotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Envío</span>
                  <span className="text-green-600">Gratis</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>${getTotal().toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium disabled:opacity-50"
              >
                {loading ? 'Procesando...' : 'Continuar al Pago'}
              </button>

              <button
                onClick={clearCart}
                className="w-full py-3 border border-gray-300 rounded-lg hover:bg-gray-50 mt-3"
              >
                Vaciar Carrito
              </button>

              <div className="mt-6 text-sm text-gray-500">
                <p className="flex items-center mb-2">
                  <span className="mr-2">✓</span>
                  Envío gratis en compras mayores a $50.000
                </p>
                <p className="flex items-center mb-2">
                  <span className="mr-2">✓</span>
                  Devoluciones gratuitas en 30 días
                </p>
                <p className="flex items-center">
                  <span className="mr-2">✓</span>
                  Pago 100% seguro con Stripe
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
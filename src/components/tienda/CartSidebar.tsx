'use client';

import { useCart } from '@/context/CartContext';
import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from './CheckoutForm';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { items, removeFromCart, updateQuantity, getTotal, clearCart } = useCart();
  const [isCheckout, setIsCheckout] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      // Aquí iría la lógica para iniciar el checkout
      setIsCheckout(true);
    } catch (error) {
      console.error('Error al iniciar checkout:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-full md:w-96 bg-white shadow-xl z-50 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-bold">Carrito de Compras</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              ✕
            </button>
          </div>

          {/* Contenido */}
          <div className="flex-1 overflow-y-auto p-4">
            {items.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🛒</div>
                <p className="text-gray-500">Tu carrito está vacío</p>
                <button
                  onClick={onClose}
                  className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Seguir Comprando
                </button>
              </div>
            ) : isCheckout ? (
              <Elements stripe={stripePromise}>
                <CheckoutForm
                  items={items}
                  total={getTotal()}
                  onBack={() => setIsCheckout(false)}
                  onSuccess={() => {
                    clearCart();
                    setIsCheckout(false);
                    onClose();
                  }}
                />
              </Elements>
            ) : (
              <>
                {items.map((item) => (
                  <div
                    key={`${item.id}-${item.talla}-${item.color}`}
                    className="flex items-start space-x-4 py-4 border-b"
                  >
                    <img
                      src={item.imagen}
                      alt={item.nombre}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium">{item.nombre}</h3>
                      {(item.talla || item.color) && (
                        <p className="text-sm text-gray-500">
                          {item.talla && `Talla: ${item.talla}`}
                          {item.talla && item.color && ' • '}
                          {item.color && `Color: ${item.color}`}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                item.cantidad - 1,
                                item.talla,
                                item.color
                              )
                            }
                            className="w-8 h-8 flex items-center justify-center border rounded"
                          >
                            -
                          </button>
                          <span>{item.cantidad}</span>
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                item.cantidad + 1,
                                item.talla,
                                item.color
                              )
                            }
                            className="w-8 h-8 flex items-center justify-center border rounded"
                          >
                            +
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">
                            ${(item.precio * item.cantidad).toLocaleString()}
                          </p>
                          <button
                            onClick={() =>
                              removeFromCart(item.id, item.talla, item.color)
                            }
                            className="text-sm text-red-500 hover:text-red-700"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && !isCheckout && (
            <div className="border-t p-4">
              <div className="flex justify-between items-center mb-4">
                <span className="font-bold">Total:</span>
                <span className="text-2xl font-bold">
                  ${getTotal().toLocaleString()}
                </span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={clearCart}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Vaciar Carrito
                </button>
                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {loading ? 'Procesando...' : 'Finalizar Compra'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
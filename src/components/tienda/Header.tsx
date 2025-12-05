'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useSession, signOut } from 'next-auth/react';
import CartSidebar from './CartSidebar';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { getItemCount } = useCart();
  const { data: session } = useSession();

  return (
    <>
      <header className="sticky top-0 z-50 bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="text-2xl font-bold text-primary-600">
              ModaStyle
            </Link>

            {/* Navegación Desktop */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-700 hover:text-primary-600 font-medium">
                Inicio
              </Link>
              <Link href="/productos" className="text-gray-700 hover:text-primary-600 font-medium">
                Productos
              </Link>
              <div className="relative group">
                <button className="text-gray-700 hover:text-primary-600 font-medium flex items-center">
                  Categorías
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute hidden group-hover:block bg-white shadow-lg rounded-lg mt-2 py-2 w-48">
                  <Link href="/categoria/hombre" className="block px-4 py-2 hover:bg-gray-100">
                    Hombre
                  </Link>
                  <Link href="/categoria/mujer" className="block px-4 py-2 hover:bg-gray-100">
                    Mujer
                  </Link>
                  <Link href="/categoria/niños" className="block px-4 py-2 hover:bg-gray-100">
                    Niños
                  </Link>
                  <Link href="/categoria/accesorios" className="block px-4 py-2 hover:bg-gray-100">
                    Accesorios
                  </Link>
                </div>
              </div>
              <Link href="/contacto" className="text-gray-700 hover:text-primary-600 font-medium">
                Contacto
              </Link>
            </nav>

            {/* Acciones */}
            <div className="flex items-center space-x-6">
              {/* Buscador */}
              <div className="hidden md:block relative">
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <button className="absolute right-3 top-2.5 text-gray-400">
                  🔍
                </button>
              </div>

              {/* Usuario */}
              {session ? (
                <div className="relative group">
                  <button className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 font-medium">
                        {session.user.nombre?.charAt(0)}
                      </span>
                    </div>
                  </button>
                  <div className="absolute right-0 hidden group-hover:block bg-white shadow-lg rounded-lg mt-2 py-2 w-48">
                    <div className="px-4 py-2 border-b">
                      <p className="font-medium">{session.user.nombre}</p>
                      <p className="text-sm text-gray-500">{session.user.email}</p>
                    </div>
                    {session.user.role === 'ADMIN' && (
                      <Link href="/admin" className="block px-4 py-2 hover:bg-gray-100">
                        Panel Admin
                      </Link>
                    )}
                    <button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              ) : (
                <Link href="/admin/login" className="text-gray-700 hover:text-primary-600">
                  Ingresar
                </Link>
              )}

              {/* Carrito */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 hover:bg-gray-100 rounded-lg"
              >
                <span className="text-2xl">🛒</span>
                {getItemCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {getItemCount()}
                  </span>
                )}
              </button>

              {/* Menú Móvil */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2"
              >
                <span className="text-2xl">☰</span>
              </button>
            </div>
          </div>

          {/* Menú Móvil */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t">
              <div className="flex flex-col space-y-3 mt-3">
                <Link href="/" className="text-gray-700 hover:text-primary-600">
                  Inicio
                </Link>
                <Link href="/productos" className="text-gray-700 hover:text-primary-600">
                  Productos
                </Link>
                <Link href="/categoria/hombre" className="text-gray-700 hover:text-primary-600">
                  Hombre
                </Link>
                <Link href="/categoria/mujer" className="text-gray-700 hover:text-primary-600">
                  Mujer
                </Link>
                <Link href="/contacto" className="text-gray-700 hover:text-primary-600">
                  Contacto
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Carrito Sidebar */}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Categoria } from '@prisma/client'

interface CategoriasNavProps {
  categorias: Categoria[]
}

export default function CategoriasNav({ categorias }: CategoriasNavProps) {
  const [activeCategory, setActiveCategory] = useState<string>('todas')

  return (
    <div className="space-y-8">
      {/* Navegación por categorías */}
      <div className="flex flex-wrap justify-center gap-2">
        <button
          onClick={() => setActiveCategory('todas')}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            activeCategory === 'todas'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Todas
        </button>
        
        {categorias.map((categoria) => (
          <button
            key={categoria.id}
            onClick={() => setActiveCategory(categoria.slug)}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeCategory === categoria.slug
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {categoria.nombre}
          </button>
        ))}
      </div>

      {/* Grid de categorías destacadas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {categorias.slice(0, 4).map((categoria) => (
          <Link
            key={categoria.id}
            href={`/categoria/${categoria.slug}`}
            className="group relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300"
          >
            <div className="aspect-video bg-gradient-to-r from-primary-500 to-secondary-500 group-hover:scale-105 transition-transform duration-300" />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white p-6">
                <h3 className="text-2xl font-bold mb-2">{categoria.nombre}</h3>
                <p className="text-white/80">Ver colección</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
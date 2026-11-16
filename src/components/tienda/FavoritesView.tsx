'use client'

import Link from 'next/link'
import { useFavorites } from '@/context/FavoritesContext'
import ProductCard from './ProductCard'

export default function FavoritesView() {
  const { items, ready } = useFavorites()

  return (
    <div className="wrap pb-10 pt-10 lg:pt-14">
      <header className="mb-12 text-center">
        <p className="eyebrow mb-4 text-stone-500">Tu selección</p>
        <h1 className="font-display text-5xl font-light sm:text-7xl">Favoritos</h1>
      </header>
      {!ready ? null : items.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <p className="max-w-sm text-[15px] text-stone-500">
            Guarda las prendas que te encantan tocando el corazón. Aparecerán aquí para que las encuentres fácil.
          </p>
          <Link href="/productos" className="cta mt-10">Descubrir la colección</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-2 gap-y-10 sm:gap-x-3 lg:grid-cols-4">
          {items.map((p) => (
            <ProductCard key={p.id} producto={{ ...p, stock: 1 }} />
          ))}
        </div>
      )}
    </div>
  )
}

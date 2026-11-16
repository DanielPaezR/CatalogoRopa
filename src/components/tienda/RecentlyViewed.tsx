'use client'

import { useEffect, useState } from 'react'
import ProductCarousel from './ProductCarousel'
import type { ProductCardData } from './ProductCard'

const KEY = 'catalogo-ropa:vistos'

/** Registra el producto actual y muestra los vistos antes. */
export default function RecentlyViewed({ actual }: { actual: ProductCardData }) {
  const [items, setItems] = useState<ProductCardData[]>([])

  useEffect(() => {
    try {
      const prev: ProductCardData[] = JSON.parse(localStorage.getItem(KEY) || '[]')
      const lista = Array.isArray(prev) ? prev.filter((p) => p && p.id !== actual.id) : []
      setItems(lista.slice(0, 10))
      const guardar = { ...actual, variantes: undefined }
      localStorage.setItem(KEY, JSON.stringify([guardar, ...lista].slice(0, 12)))
    } catch {
      /* ignorar */
    }
  }, [actual])

  if (items.length === 0) return null
  return <ProductCarousel eyebrow="Tu historial" title="Vistos recientemente" productos={items} />
}

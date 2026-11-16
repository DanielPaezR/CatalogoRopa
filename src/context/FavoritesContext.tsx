'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

export type FavItem = {
  id: string
  slug: string
  nombre: string
  precio: number
  precioAnterior: number | null
  imagenes: string[]
}

type Ctx = {
  items: FavItem[]
  ready: boolean
  has: (id: string) => boolean
  toggle: (item: FavItem) => boolean
}

const KEY = 'catalogo-ropa:favoritos'
const FavoritesContext = createContext<Ctx | null>(null)

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<FavItem[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) setItems(parsed.filter((i) => i && i.id))
      }
    } catch {
      /* sin almacenamiento */
    }
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    try {
      localStorage.setItem(KEY, JSON.stringify(items))
    } catch {
      /* ignorar */
    }
  }, [items, ready])

  const has = useCallback((id: string) => items.some((i) => i.id === id), [items])

  const toggle = useCallback(
    (item: FavItem) => {
      const exists = items.some((i) => i.id === item.id)
      setItems((prev) => (exists ? prev.filter((i) => i.id !== item.id) : [item, ...prev].slice(0, 100)))
      return !exists
    },
    [items]
  )

  const value = useMemo(() => ({ items, ready, has, toggle }), [items, ready, has, toggle])
  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext)
  if (!ctx) throw new Error('useFavorites debe usarse dentro de FavoritesProvider')
  return ctx
}

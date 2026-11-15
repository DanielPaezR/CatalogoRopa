'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

export type CartItem = {
  productoId: string
  varianteId: string | null
  slug: string
  nombre: string
  precio: number
  imagen: string | null
  talla: string | null
  color: string | null
  cantidad: number
  stock: number
}

type CartContextType = {
  items: CartItem[]
  ready: boolean
  count: number
  subtotal: number
  open: boolean
  setOpen: (open: boolean) => void
  add: (item: CartItem) => { ok: boolean; message?: string }
  update: (key: string, cantidad: number) => void
  remove: (key: string) => void
  clear: () => void
  sync: () => Promise<string[]>
}

const STORAGE_KEY = 'catalogo-ropa:carrito'

export const itemKey = (i: Pick<CartItem, 'productoId' | 'varianteId'>) => `${i.productoId}:${i.varianteId ?? ''}`

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [ready, setReady] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) setItems(parsed.filter((i) => i && i.productoId && i.cantidad > 0))
      }
    } catch {
      /* almacenamiento no disponible */
    }
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      /* ignorar */
    }
  }, [items, ready])

  const add = useCallback(
    (item: CartItem) => {
      const key = itemKey(item)
      const existing = items.find((i) => itemKey(i) === key)
      const total = (existing?.cantidad ?? 0) + item.cantidad
      if (total > item.stock) {
        return {
          ok: false,
          message: item.stock > 0 ? `Solo hay ${item.stock} unidades disponibles` : 'Producto agotado',
        }
      }
      setItems((prev) =>
        existing
          ? prev.map((i) => (itemKey(i) === key ? { ...i, ...item, cantidad: total } : i))
          : [...prev, item]
      )
      return { ok: true }
    },
    [items]
  )

  const update = useCallback((key: string, cantidad: number) => {
    setItems((prev) =>
      prev
        .map((i) => (itemKey(i) === key ? { ...i, cantidad: Math.max(0, Math.min(cantidad, i.stock)) } : i))
        .filter((i) => i.cantidad > 0)
    )
  }, [])

  const remove = useCallback((key: string) => {
    setItems((prev) => prev.filter((i) => itemKey(i) !== key))
  }, [])

  const clear = useCallback(() => setItems([]), [])

  /** Actualiza precios y stock con el servidor. Devuelve avisos de cambios. */
  const sync = useCallback(async () => {
    if (items.length === 0) return []
    try {
      const res = await fetch('/api/carrito', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: items.map((i) => ({ productoId: i.productoId, varianteId: i.varianteId })) }),
      })
      if (!res.ok) return []
      const data: {
        items: {
          productoId: string
          varianteId: string | null
          disponible: boolean
          precio?: number
          stock?: number
          nombre?: string
          slug?: string
          imagen?: string | null
        }[]
      } = await res.json()
      const avisos: string[] = []
      const next: CartItem[] = []
      for (const item of items) {
        const fresh = data.items.find((f) => f.productoId === item.productoId && (f.varianteId ?? null) === item.varianteId)
        if (!fresh || !fresh.disponible || !fresh.stock) {
          avisos.push(`"${item.nombre}" ya no está disponible y se quitó del carrito`)
          continue
        }
        const cantidad = Math.min(item.cantidad, fresh.stock)
        if (cantidad < item.cantidad) avisos.push(`Ajustamos la cantidad de "${item.nombre}" al stock disponible`)
        if (fresh.precio !== item.precio) avisos.push(`El precio de "${item.nombre}" se actualizó`)
        next.push({
          ...item,
          cantidad,
          stock: fresh.stock,
          precio: fresh.precio ?? item.precio,
          nombre: fresh.nombre ?? item.nombre,
          slug: fresh.slug ?? item.slug,
          imagen: fresh.imagen ?? item.imagen,
        })
      }
      setItems(next)
      return avisos
    } catch {
      return []
    }
  }, [items])

  const value = useMemo(
    () => ({
      items,
      ready,
      open,
      setOpen,
      add,
      update,
      remove,
      clear,
      sync,
      count: items.reduce((n, i) => n + i.cantidad, 0),
      subtotal: items.reduce((n, i) => n + i.precio * i.cantidad, 0),
    }),
    [items, ready, open, add, update, remove, clear, sync]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart debe usarse dentro de CartProvider')
  return ctx
}

'use client'

import { useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import { useCart } from '@/context/CartContext'

/** Sincroniza una vez el carrito con el servidor al montar la página. */
export function useCartSync() {
  const { ready, sync } = useCart()
  const done = useRef(false)
  useEffect(() => {
    if (!ready || done.current) return
    done.current = true
    sync().then((avisos) => avisos.forEach((a) => toast(a, { icon: 'ℹ️' })))
  }, [ready, sync])
}

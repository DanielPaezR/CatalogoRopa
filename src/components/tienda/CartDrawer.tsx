'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { itemKey, useCart } from '@/context/CartContext'
import { BagIcon, TrashIcon, XIcon } from '@/components/ui/Icons'
import { formatPrice } from '@/lib/utils'
import ProductImage from './ProductImage'
import QuantityInput from './QuantityInput'

export default function CartDrawer({ envioGratisDesde }: { envioGratisDesde: number | null }) {
  const { items, open, setOpen, update, remove, subtotal } = useCart()

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, setOpen])

  if (!open) return null

  const faltaParaGratis = envioGratisDesde ? Math.max(0, envioGratisDesde - subtotal) : 0

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Carrito">
      <div className="absolute inset-0 animate-fade-in bg-ink/40" onClick={() => setOpen(false)} />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-md animate-slide-in flex-col bg-sand-50 shadow-2xl">
        <div className="flex items-center justify-between border-b border-sand-200 px-6 py-4">
          <h2 className="text-xl">Tu carrito</h2>
          <button className="btn-ghost -mr-2 p-2" onClick={() => setOpen(false)} aria-label="Cerrar carrito">
            <XIcon />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
            <div className="rounded-full bg-sand-100 p-5 text-stone-400">
              <BagIcon width={32} height={32} />
            </div>
            <p className="text-stone-500">Tu carrito está vacío</p>
            <Link href="/productos" className="btn-primary" onClick={() => setOpen(false)}>
              Ver productos
            </Link>
          </div>
        ) : (
          <>
            {envioGratisDesde ? (
              <div className="border-b border-sand-200 px-6 py-3 text-xs text-ink-soft">
                {faltaParaGratis > 0 ? (
                  <>
                    Te faltan <strong>{formatPrice(faltaParaGratis)}</strong> para el envío gratis
                  </>
                ) : (
                  <strong className="text-emerald-700">¡Tienes envío gratis!</strong>
                )}
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-sand-200">
                  <div
                    className="h-full rounded-full bg-accent transition-all"
                    style={{ width: `${Math.min(100, (subtotal / envioGratisDesde) * 100)}%` }}
                  />
                </div>
              </div>
            ) : null}

            <ul className="flex-1 divide-y divide-sand-200 overflow-y-auto px-6">
              {items.map((item) => {
                const key = itemKey(item)
                return (
                  <li key={key} className="flex gap-4 py-4">
                    <Link
                      href={`/productos/${item.slug}`}
                      onClick={() => setOpen(false)}
                      className="h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-sand-100"
                    >
                      <ProductImage src={item.imagen} alt={item.nombre} />
                    </Link>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex justify-between gap-2">
                        <p className="truncate text-sm font-medium">{item.nombre}</p>
                        <button
                          className="text-stone-400 hover:text-red-600"
                          onClick={() => remove(key)}
                          aria-label={`Quitar ${item.nombre}`}
                        >
                          <TrashIcon width={16} height={16} />
                        </button>
                      </div>
                      <p className="text-xs text-stone-500">
                        {[item.talla && `Talla ${item.talla}`, item.color].filter(Boolean).join(' · ')}
                      </p>
                      <div className="mt-auto flex items-center justify-between pt-2">
                        <QuantityInput size="sm" value={item.cantidad} max={item.stock} onChange={(v) => update(key, v)} />
                        <span className="text-sm font-semibold">{formatPrice(item.precio * item.cantidad)}</span>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>

            <div className="space-y-3 border-t border-sand-200 px-6 py-5">
              <div className="flex justify-between text-base">
                <span>Subtotal</span>
                <span className="font-semibold">{formatPrice(subtotal)}</span>
              </div>
              <p className="text-xs text-stone-500">El envío se calcula al finalizar la compra.</p>
              <Link href="/checkout" className="btn-primary w-full py-3" onClick={() => setOpen(false)}>
                Finalizar compra
              </Link>
              <Link href="/carrito" className="btn-ghost w-full" onClick={() => setOpen(false)}>
                Ver carrito completo
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  )
}

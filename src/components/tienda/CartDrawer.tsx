'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { itemKey, useCart } from '@/context/CartContext'
import { XIcon } from '@/components/ui/Icons'
import { formatPrice } from '@/lib/utils'
import ProductImage from './ProductImage'
import QuantityInput from './QuantityInput'

export default function CartDrawer({ envioGratisDesde }: { envioGratisDesde: number | null }) {
  const { items, open, setOpen, update, remove, subtotal, count } = useCart()

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

  const falta = envioGratisDesde ? Math.max(0, envioGratisDesde - subtotal) : 0

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Bolsa de compras">
      <div className="absolute inset-0 animate-fade-in bg-black/40" onClick={() => setOpen(false)} />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-[440px] animate-slide-in flex-col bg-white">
        <div className="flex h-16 items-center justify-between border-b border-black/10 px-6">
          <p className="text-[12px] uppercase tracking-label">Bolsa {count > 0 && `(${count})`}</p>
          <button className="icon-btn -mr-2" onClick={() => setOpen(false)} aria-label="Cerrar bolsa">
            <XIcon width={20} height={20} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <p className="font-display text-4xl font-light">Tu bolsa está vacía</p>
            <p className="mt-3 text-[14px] text-stone-500">Descubre lo nuevo de la colección.</p>
            <Link href="/productos" className="cta mt-8" onClick={() => setOpen(false)}>
              Comprar novedades
            </Link>
          </div>
        ) : (
          <>
            {envioGratisDesde ? (
              <div className="border-b border-black/10 px-6 py-4">
                <p className="text-[12px]">
                  {falta > 0 ? (
                    <>Te faltan <strong className="font-medium">{formatPrice(falta)}</strong> para el envío gratis</>
                  ) : (
                    <>Tu pedido tiene <strong className="font-medium">envío gratis</strong></>
                  )}
                </p>
                <div className="mt-3 h-[2px] bg-black/10">
                  <div className="h-full bg-ink transition-all duration-500" style={{ width: `${Math.min(100, (subtotal / envioGratisDesde) * 100)}%` }} />
                </div>
              </div>
            ) : null}

            <ul className="flex-1 divide-y divide-black/10 overflow-y-auto px-6">
              {items.map((item) => {
                const key = itemKey(item)
                return (
                  <li key={key} className="flex gap-4 py-5">
                    <Link href={`/productos/${item.slug}`} onClick={() => setOpen(false)} className="aspect-[2/3] w-24 shrink-0 overflow-hidden bg-bone">
                      <ProductImage src={item.imagen} alt={item.nombre} />
                    </Link>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex justify-between gap-3">
                        <Link href={`/productos/${item.slug}`} onClick={() => setOpen(false)} className="text-[12px] uppercase tracking-wide hover:underline">
                          {item.nombre}
                        </Link>
                        <p className="shrink-0 text-[13px]">{formatPrice(item.precio * item.cantidad)}</p>
                      </div>
                      <p className="mt-1 text-[12px] text-stone-500">
                        {[item.color, item.talla && `Talla ${item.talla}`].filter(Boolean).join(' · ')}
                      </p>
                      <div className="mt-auto flex items-center justify-between pt-3">
                        <QuantityInput size="sm" value={item.cantidad} max={item.stock} onChange={(v) => update(key, v)} />
                        <button className="link-u-on text-[11px] uppercase tracking-label text-stone-500 hover:text-ink" onClick={() => remove(key)}>
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>

            <div className="border-t border-black/10 px-6 py-6">
              <div className="flex justify-between text-[13px] uppercase tracking-label">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <p className="mt-1 text-[12px] text-stone-500">Envío calculado al finalizar la compra.</p>
              <Link href="/checkout" className="cta mt-5 h-14 w-full" onClick={() => setOpen(false)}>
                Finalizar compra
              </Link>
              <Link href="/carrito" className="mt-3 block text-center text-[11px] uppercase tracking-label text-stone-500 hover:text-ink" onClick={() => setOpen(false)}>
                Ver bolsa completa
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  )
}

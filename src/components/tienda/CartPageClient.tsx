'use client'

import Link from 'next/link'
import { itemKey, useCart } from '@/context/CartContext'
import { calcularEnvio } from '@/lib/config-shared'
import { formatPrice } from '@/lib/utils'
import ProductImage from './ProductImage'
import QuantityInput from './QuantityInput'
import { useCartSync } from './useCartSync'

export default function CartPageClient({ costoEnvio, envioGratisDesde }: { costoEnvio: number; envioGratisDesde: number | null }) {
  const { items, ready, update, remove, subtotal, count } = useCart()
  useCartSync()

  if (!ready) return <div className="wrap py-32 text-center text-[12px] uppercase tracking-label text-stone-400">Cargando…</div>

  if (items.length === 0) {
    return (
      <div className="wrap flex flex-col items-center py-32 text-center">
        <p className="eyebrow mb-4 text-stone-500">Bolsa</p>
        <h1 className="font-display text-5xl font-light sm:text-6xl">Tu bolsa está vacía</h1>
        <p className="mt-4 text-stone-500">Las prendas que añadas aparecerán aquí.</p>
        <Link href="/productos" className="cta mt-10">Comprar novedades</Link>
      </div>
    )
  }

  const envio = calcularEnvio(subtotal, { costoEnvio, envioGratisDesde })

  return (
    <div className="wrap pb-10 pt-10 lg:pt-14">
      <h1 className="mb-10 font-display text-5xl font-light sm:text-6xl">
        Bolsa <span className="align-top text-2xl text-stone-400">({count})</span>
      </h1>
      <div className="grid gap-12 lg:grid-cols-[1fr_400px]">
        <ul className="divide-y divide-black/10 border-y border-black/10">
          {items.map((item) => {
            const key = itemKey(item)
            return (
              <li key={key} className="flex gap-5 py-6 sm:gap-8">
                <Link href={`/productos/${item.slug}`} className="aspect-[2/3] w-28 shrink-0 overflow-hidden bg-bone sm:w-40">
                  <ProductImage src={item.imagen} alt={item.nombre} />
                </Link>
                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between gap-4">
                    <div>
                      <Link href={`/productos/${item.slug}`} className="text-[13px] uppercase tracking-wide hover:underline">{item.nombre}</Link>
                      <p className="mt-2 text-[13px] text-stone-500">{[item.color, item.talla && `Talla ${item.talla}`].filter(Boolean).join(' · ')}</p>
                      <p className="mt-1 text-[13px] text-stone-500">{formatPrice(item.precio)}</p>
                    </div>
                    <p className="text-[14px]">{formatPrice(item.precio * item.cantidad)}</p>
                  </div>
                  <div className="mt-auto flex items-center gap-6 pt-4">
                    <QuantityInput value={item.cantidad} max={item.stock} onChange={(v) => update(key, v)} />
                    <button onClick={() => remove(key)} className="link-u-on text-[11px] uppercase tracking-label text-stone-500 hover:text-ink">
                      Eliminar
                    </button>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>

        <aside className="h-fit bg-bone p-8 lg:sticky lg:top-[140px]">
          <p className="mb-6 text-[12px] uppercase tracking-label">Resumen del pedido</p>
          <div className="space-y-3 text-[14px]">
            <div className="flex justify-between"><span className="text-stone-500">Subtotal</span><span>{formatPrice(subtotal)}</span></div>
            <div className="flex justify-between">
              <span className="text-stone-500">Envío</span>
              <span>{envio === 0 ? 'Gratis' : formatPrice(envio)}</span>
            </div>
          </div>
          {envioGratisDesde && subtotal < envioGratisDesde && (
            <p className="mt-4 text-[12px] text-stone-500">Añade {formatPrice(envioGratisDesde - subtotal)} más para envío gratis.</p>
          )}
          <div className="mt-6 flex justify-between border-t border-black/10 pt-6 text-[15px] font-medium">
            <span className="uppercase tracking-label">Total</span>
            <span>{formatPrice(subtotal + envio)}</span>
          </div>
          <Link href="/checkout" className="cta mt-8 h-14 w-full">Finalizar compra</Link>
          <Link href="/productos" className="mt-4 block text-center text-[11px] uppercase tracking-label text-stone-500 hover:text-ink">
            Seguir comprando
          </Link>
        </aside>
      </div>
    </div>
  )
}

'use client'

import Link from 'next/link'
import { itemKey, useCart } from '@/context/CartContext'
import { calcularEnvio } from '@/lib/config-shared'
import { formatPrice } from '@/lib/utils'
import { BagIcon, TrashIcon } from '@/components/ui/Icons'
import ProductImage from './ProductImage'
import QuantityInput from './QuantityInput'
import { useCartSync } from './useCartSync'

export default function CartPageClient({
  costoEnvio,
  envioGratisDesde,
}: {
  costoEnvio: number
  envioGratisDesde: number | null
}) {
  const { items, ready, update, remove, subtotal } = useCart()
  useCartSync()

  if (!ready) {
    return <div className="container-page py-24 text-center text-stone-400">Cargando carrito…</div>
  }

  if (items.length === 0) {
    return (
      <div className="container-page flex flex-col items-center gap-5 py-24 text-center">
        <div className="rounded-full bg-sand-100 p-6 text-stone-400">
          <BagIcon width={40} height={40} />
        </div>
        <h1 className="text-4xl">Tu carrito está vacío</h1>
        <p className="text-stone-500">Descubre nuestras prendas y encuentra tu próximo favorito.</p>
        <Link href="/productos" className="btn-primary px-8 py-3">
          Ir al catálogo
        </Link>
      </div>
    )
  }

  const envio = calcularEnvio(subtotal, { costoEnvio, envioGratisDesde })

  return (
    <div className="container-page pt-10">
      <h1 className="mb-8 text-4xl sm:text-5xl">Carrito</h1>
      <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
        <ul className="divide-y divide-sand-200 border-y border-sand-200">
          {items.map((item) => {
            const key = itemKey(item)
            return (
              <li key={key} className="flex gap-4 py-6 sm:gap-6">
                <Link href={`/productos/${item.slug}`} className="h-32 w-24 shrink-0 overflow-hidden rounded-2xl bg-sand-100 sm:h-40 sm:w-32">
                  <ProductImage src={item.imagen} alt={item.nombre} />
                </Link>
                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between gap-4">
                    <div>
                      <Link href={`/productos/${item.slug}`} className="font-medium hover:underline">
                        {item.nombre}
                      </Link>
                      <p className="mt-1 text-sm text-stone-500">
                        {[item.talla && `Talla ${item.talla}`, item.color].filter(Boolean).join(' · ')}
                      </p>
                      <p className="mt-1 text-sm text-stone-500">{formatPrice(item.precio)} c/u</p>
                    </div>
                    <p className="font-semibold">{formatPrice(item.precio * item.cantidad)}</p>
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-4">
                    <QuantityInput value={item.cantidad} max={item.stock} onChange={(v) => update(key, v)} />
                    <button onClick={() => remove(key)} className="flex items-center gap-1 text-sm text-stone-500 hover:text-red-600">
                      <TrashIcon width={16} height={16} /> Quitar
                    </button>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>

        <aside className="card h-fit space-y-4 p-6 lg:sticky lg:top-28">
          <h2 className="text-2xl">Resumen</h2>
          <div className="flex justify-between text-sm">
            <span className="text-stone-500">Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-stone-500">Envío</span>
            <span>{envio === 0 ? <span className="font-medium text-emerald-700">Gratis</span> : formatPrice(envio)}</span>
          </div>
          {envioGratisDesde && subtotal < envioGratisDesde && (
            <p className="rounded-xl bg-accent-light px-3 py-2 text-xs text-accent-dark">
              Agrega {formatPrice(envioGratisDesde - subtotal)} más y el envío es gratis.
            </p>
          )}
          <div className="flex justify-between border-t border-sand-200 pt-4 text-lg font-semibold">
            <span>Total</span>
            <span>{formatPrice(subtotal + envio)}</span>
          </div>
          <Link href="/checkout" className="btn-primary w-full py-3">
            Finalizar compra
          </Link>
          <Link href="/productos" className="btn-ghost w-full">
            Seguir comprando
          </Link>
        </aside>
      </div>
    </div>
  )
}

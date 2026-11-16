'use client'

import Link from 'next/link'
import toast from 'react-hot-toast'
import { useCart } from '@/context/CartContext'
import { colorHex } from '@/lib/colores'
import { cn, discountPercent, formatPrice } from '@/lib/utils'
import FavoriteButton from './FavoriteButton'
import ProductImage from './ProductImage'

export type ProductCardData = {
  id: string
  slug: string
  nombre: string
  precio: number
  precioAnterior: number | null
  imagenes: string[]
  stock: number
  colores?: string[]
  tallas?: string[]
  createdAt?: Date | string
  categoria?: { nombre: string } | null
  variantes?: { id: string; talla: string; color: string; stock: number }[]
}

const NUEVO_DIAS = 21

export default function ProductCard({
  producto: p,
  eager,
  sizes = 'normal',
}: {
  producto: ProductCardData
  eager?: boolean
  sizes?: 'normal' | 'large'
}) {
  const { add, setOpen } = useCart()
  const descuento = discountPercent(p.precio, p.precioAnterior)
  const agotado = p.stock <= 0
  const nuevo = p.createdAt ? Date.now() - new Date(p.createdAt).getTime() < NUEVO_DIAS * 864e5 : false
  const variantes = p.variantes ?? []
  const colores = p.colores ?? []
  const tallas = p.tallas ?? []

  // Añadir rápido: solo cuando la talla es la única elección (0 o 1 color)
  const conDatos = p.variantes !== undefined
  const quickSizes = conDatos && colores.length <= 1 && tallas.length > 0
  const quickSimple = conDatos && variantes.length === 0 && !agotado

  const quickAdd = (varianteId: string | null, talla: string | null, color: string | null, stock: number) => {
    const r = add({
      productoId: p.id,
      varianteId,
      slug: p.slug,
      nombre: p.nombre,
      precio: p.precio,
      imagen: p.imagenes[0] ?? null,
      talla,
      color,
      cantidad: 1,
      stock,
    })
    if (!r.ok) toast.error(r.message ?? 'No disponible')
    else setOpen(true)
  }

  return (
    <article className="group relative">
      <Link href={`/productos/${p.slug}`} className="block" aria-label={p.nombre}>
        <div className="relative aspect-[2/3] overflow-hidden bg-bone">
          <ProductImage
            src={p.imagenes[0]}
            alt={p.nombre}
            eager={eager}
            className={cn('transition duration-700 ease-out', p.imagenes[1] ? 'group-hover:opacity-0' : 'group-hover:scale-[1.03]')}
          />
          {p.imagenes[1] && (
            <img
              src={p.imagenes[1]}
              alt=""
              loading="lazy"
              className="absolute inset-0 h-full w-full scale-[1.02] object-cover opacity-0 transition duration-700 ease-out group-hover:scale-100 group-hover:opacity-100"
            />
          )}
          <div className="absolute left-0 top-0 flex flex-col items-start gap-1 p-3">
            {agotado ? (
              <span className="bg-white px-2 py-1 text-[10px] uppercase tracking-label text-stone-500">Agotado</span>
            ) : (
              <>
                {descuento > 0 && <span className="bg-sale px-2 py-1 text-[10px] uppercase tracking-label text-white">-{descuento}%</span>}
                {nuevo && <span className="bg-white px-2 py-1 text-[10px] uppercase tracking-label">Nuevo</span>}
              </>
            )}
          </div>
        </div>
      </Link>

      <FavoriteButton
        item={{ id: p.id, slug: p.slug, nombre: p.nombre, precio: p.precio, precioAnterior: p.precioAnterior, imagenes: p.imagenes }}
        className="absolute right-2 top-2 h-9 w-9 text-ink"
      />

      {/* Añadir rápido (escritorio): aparece sobre la foto al pasar el cursor */}
      <div className="relative">
        {!agotado && (quickSizes || quickSimple) && (
          <div className="absolute inset-x-0 -top-[52px] z-10 hidden translate-y-2 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 lg:block">
            <div className="mx-2 bg-white/95 px-3 py-2.5 backdrop-blur">
              {quickSizes ? (
                <div className="flex items-center gap-1">
                  <span className="mr-auto text-[10px] uppercase tracking-label text-stone-500">Añadir</span>
                  {tallas.map((t) => {
                    const v = variantes.find((x) => x.talla === t && (colores.length ? x.color === colores[0] : true))
                    const ok = !!v && v.stock > 0
                    return (
                      <button
                        key={t}
                        disabled={!ok}
                        onClick={() => v && quickAdd(v.id, v.talla || null, v.color || null, v.stock)}
                        className="min-w-[30px] px-1.5 py-0.5 text-[12px] hover:underline disabled:text-stone-300 disabled:line-through"
                      >
                        {t}
                      </button>
                    )
                  })}
                </div>
              ) : (
                <button onClick={() => quickAdd(null, null, null, p.stock)} className="w-full text-[11px] uppercase tracking-label hover:underline">
                  + Añadir a la bolsa
                </button>
              )}
            </div>
          </div>
        )}

        <Link href={`/productos/${p.slug}`} className="block pt-3">
          <h3 className={cn('font-sans uppercase tracking-[0.06em]', sizes === 'large' ? 'text-[14px]' : 'text-[12px] sm:text-[13px]')}>
            {p.nombre}
          </h3>
          <div className="mt-1 flex items-baseline gap-2 text-[12px] sm:text-[13px]">
            <span className={cn(descuento > 0 && 'text-sale')}>{formatPrice(p.precio)}</span>
            {descuento > 0 && <span className="text-stone-400 line-through">{formatPrice(p.precioAnterior!)}</span>}
          </div>
          {colores.length > 1 && (
            <div className="mt-2 flex items-center gap-1.5">
              {colores.slice(0, 5).map((c) => {
                const hex = colorHex(c)
                return hex ? (
                  <span key={c} title={c} className="h-2.5 w-2.5 rounded-full border border-black/15" style={{ background: hex }} />
                ) : null
              })}
              <span className="text-[11px] text-stone-500">{colores.length} colores</span>
            </div>
          )}
        </Link>
      </div>
    </article>
  )
}

import Link from 'next/link'
import ProductImage from './ProductImage'
import { discountPercent, formatPrice } from '@/lib/utils'

export type ProductCardData = {
  id: string
  slug: string
  nombre: string
  precio: number
  precioAnterior: number | null
  imagenes: string[]
  stock: number
  colores?: string[]
  categoria?: { nombre: string } | null
}

export default function ProductCard({ producto, eager }: { producto: ProductCardData; eager?: boolean }) {
  const descuento = discountPercent(producto.precio, producto.precioAnterior)
  const agotado = producto.stock <= 0

  return (
    <Link href={`/productos/${producto.slug}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-sand-100">
        <ProductImage
          src={producto.imagenes[0]}
          alt={producto.nombre}
          eager={eager}
          className="transition duration-500 group-hover:scale-[1.03]"
        />
        {producto.imagenes[1] && (
          <img
            src={producto.imagenes[1]}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition duration-500 group-hover:opacity-100"
          />
        )}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {descuento > 0 && !agotado && <span className="chip bg-accent text-white">-{descuento}%</span>}
          {agotado && <span className="chip bg-ink/80 text-white">Agotado</span>}
        </div>
      </div>
      <div className="mt-3 space-y-1 px-0.5">
        {producto.categoria && (
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-stone-500">{producto.categoria.nombre}</p>
        )}
        <h3 className="line-clamp-2 font-sans text-sm font-medium text-ink group-hover:underline group-hover:underline-offset-4">
          {producto.nombre}
        </h3>
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold">{formatPrice(producto.precio)}</span>
          {descuento > 0 && (
            <span className="text-xs text-stone-400 line-through">{formatPrice(producto.precioAnterior!)}</span>
          )}
        </div>
      </div>
    </Link>
  )
}

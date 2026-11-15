import type { Metadata } from 'next'
import Link from 'next/link'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import AddToCart from '@/components/tienda/AddToCart'
import ProductCard from '@/components/tienda/ProductCard'
import ProductGallery from '@/components/tienda/ProductGallery'
import { RefreshIcon, ShieldIcon, TruckIcon } from '@/components/ui/Icons'
import { prisma } from '@/lib/db'
import { getConfig } from '@/lib/config'
import { cardSelect } from '@/lib/catalogo'
import { baseUrlFromHeaders, discountPercent, formatPrice } from '@/lib/utils'

export const dynamic = 'force-dynamic'

type Props = { params: { slug: string } }

const getProducto = (slug: string) =>
  prisma.producto.findUnique({
    where: { slug },
    include: { categoria: true, variantes: { select: { id: true, talla: true, color: true, stock: true } } },
  })

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getProducto(params.slug)
  if (!p) return { title: 'Producto no encontrado' }
  return {
    title: p.nombre,
    description: p.descripcion.slice(0, 160) || `${p.nombre} - ${formatPrice(p.precio)}`,
    openGraph: { images: p.imagenes.slice(0, 1) },
  }
}

export default async function ProductoPage({ params }: Props) {
  const [producto, config] = await Promise.all([getProducto(params.slug), getConfig()])
  if (!producto || !producto.activo) notFound()

  const relacionados = await prisma.producto.findMany({
    where: {
      activo: true,
      id: { not: producto.id },
      ...(producto.categoriaId ? { categoriaId: producto.categoriaId } : {}),
    },
    select: cardSelect,
    orderBy: { createdAt: 'desc' },
    take: 4,
  })

  const descuento = discountPercent(producto.precio, producto.precioAnterior)
  const url = `${baseUrlFromHeaders(headers())}/productos/${producto.slug}`

  return (
    <div className="container-page pt-8">
      <nav className="mb-6 text-xs text-stone-500" aria-label="Ruta">
        <Link href="/" className="hover:text-ink">Inicio</Link>
        <span className="mx-1">/</span>
        {producto.categoria ? (
          <Link href={`/categoria/${producto.categoria.slug}`} className="hover:text-ink">
            {producto.categoria.nombre}
          </Link>
        ) : (
          <Link href="/productos" className="hover:text-ink">Catálogo</Link>
        )}
        <span className="mx-1">/</span>
        <span className="text-ink">{producto.nombre}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <ProductGallery imagenes={producto.imagenes} nombre={producto.nombre} />

        <div className="lg:sticky lg:top-28 lg:self-start">
          {producto.categoria && (
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">{producto.categoria.nombre}</p>
          )}
          <h1 className="mt-2 text-4xl leading-tight sm:text-5xl">{producto.nombre}</h1>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-2xl font-semibold">{formatPrice(producto.precio)}</span>
            {descuento > 0 && (
              <>
                <span className="text-lg text-stone-400 line-through">{formatPrice(producto.precioAnterior!)}</span>
                <span className="chip bg-accent text-white">-{descuento}%</span>
              </>
            )}
          </div>

          <div className="my-8 h-px bg-sand-200" />

          <AddToCart
            producto={{
              id: producto.id,
              slug: producto.slug,
              nombre: producto.nombre,
              precio: producto.precio,
              imagen: producto.imagenes[0] ?? null,
              stock: producto.stock,
              tallas: producto.tallas,
              colores: producto.colores,
              variantes: producto.variantes,
            }}
            whatsapp={config.whatsapp}
            url={url}
          />

          {producto.descripcion && (
            <div className="mt-10">
              <h2 className="mb-3 font-sans text-sm font-semibold uppercase tracking-widest">Descripción</h2>
              <div className="whitespace-pre-line text-sm leading-relaxed text-ink-soft">{producto.descripcion}</div>
            </div>
          )}

          <ul className="mt-10 space-y-3 rounded-2xl bg-sand-100 p-5 text-sm text-ink-soft">
            <li className="flex items-center gap-3">
              <TruckIcon className="shrink-0 text-accent" />
              {config.envioGratisDesde
                ? `Envío gratis en compras desde ${formatPrice(config.envioGratisDesde)}`
                : `Envío a toda Colombia por ${formatPrice(config.costoEnvio)}`}
            </li>
            {config.pagoContraentrega && (
              <li className="flex items-center gap-3">
                <ShieldIcon className="shrink-0 text-accent" /> Pago contra entrega disponible
              </li>
            )}
            <li className="flex items-center gap-3">
              <RefreshIcon className="shrink-0 text-accent" /> Cambios por talla sin complicaciones
            </li>
          </ul>
          {producto.sku && <p className="mt-4 text-xs text-stone-400">Ref. {producto.sku}</p>}
        </div>
      </div>

      {relacionados.length > 0 && (
        <section className="mt-24">
          <h2 className="mb-8 text-3xl">También te puede gustar</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
            {relacionados.map((p) => (
              <ProductCard key={p.id} producto={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

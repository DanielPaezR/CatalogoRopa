import type { Metadata } from 'next'
import Link from 'next/link'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import Accordion from '@/components/tienda/Accordion'
import AddToCart from '@/components/tienda/AddToCart'
import ProductCarousel from '@/components/tienda/ProductCarousel'
import ProductGallery from '@/components/tienda/ProductGallery'
import RecentlyViewed from '@/components/tienda/RecentlyViewed'
import { prisma } from '@/lib/db'
import { getConfig } from '@/lib/config'
import { cardSelect, ordenarTallas } from '@/lib/catalogo'
import { METODO_LABEL } from '@/lib/constants'
import { baseUrlFromHeaders, cn, discountPercent, formatPrice } from '@/lib/utils'

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
    description: p.descripcion.slice(0, 160) || `${p.nombre} — ${formatPrice(p.precio)}`,
    openGraph: { images: p.imagenes.slice(0, 1) },
  }
}

export default async function ProductoPage({ params }: Props) {
  const [producto, config] = await Promise.all([getProducto(params.slug), getConfig()])
  if (!producto || !producto.activo) notFound()

  const [mismaCategoria, otros] = await Promise.all([
    prisma.producto.findMany({
      where: { activo: true, id: { not: producto.id }, categoriaId: producto.categoriaId ?? undefined },
      select: cardSelect,
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    prisma.producto.findMany({
      where: { activo: true, id: { not: producto.id }, destacado: true },
      select: cardSelect,
      orderBy: { updatedAt: 'desc' },
      take: 10,
    }),
  ])
  const relacionados = [...mismaCategoria, ...otros.filter((o) => !mismaCategoria.some((m) => m.id === o.id))].slice(0, 10)

  const descuento = discountPercent(producto.precio, producto.precioAnterior)
  const url = `${baseUrlFromHeaders(headers())}/productos/${producto.slug}`
  const metodos = [
    config.pagoContraentrega && METODO_LABEL.CONTRAENTREGA,
    config.pagoTransferencia && METODO_LABEL.TRANSFERENCIA,
    config.pagoWhatsapp && METODO_LABEL.WHATSAPP,
  ].filter(Boolean)

  const card = {
    id: producto.id,
    slug: producto.slug,
    nombre: producto.nombre,
    precio: producto.precio,
    precioAnterior: producto.precioAnterior,
    imagenes: producto.imagenes,
    stock: producto.stock,
    colores: producto.colores,
    tallas: producto.tallas,
    createdAt: producto.createdAt,
  }

  return (
    <>
      <div className="wrap pt-0 lg:pt-6">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(360px,1fr)] lg:gap-14 xl:gap-20">
          <ProductGallery imagenes={producto.imagenes} nombre={producto.nombre} />

          <div className="lg:sticky lg:top-[140px] lg:self-start lg:pb-10">
            <nav className="mb-6 hidden text-[11px] uppercase tracking-label text-stone-500 lg:block" aria-label="Ruta">
              <Link href="/" className="hover:text-ink">Inicio</Link>
              <span className="mx-2">/</span>
              {producto.categoria ? (
                <Link href={`/categoria/${producto.categoria.slug}`} className="hover:text-ink">{producto.categoria.nombre}</Link>
              ) : (
                <Link href="/productos" className="hover:text-ink">Colección</Link>
              )}
            </nav>

            <h1 className="font-display text-4xl font-light leading-[1.05] sm:text-5xl">{producto.nombre}</h1>

            <div className="mt-4 flex items-baseline gap-3 text-[17px]">
              <span className={cn(descuento > 0 && 'text-sale')}>{formatPrice(producto.precio)}</span>
              {descuento > 0 && (
                <>
                  <span className="text-[15px] text-stone-400 line-through">{formatPrice(producto.precioAnterior!)}</span>
                  <span className="text-[12px] uppercase tracking-label text-sale">-{descuento}%</span>
                </>
              )}
            </div>
            {producto.sku && <p className="mt-2 text-[12px] text-stone-400">Ref. {producto.sku}</p>}

            <div className="my-8 h-px bg-black/10" />

            <AddToCart
              producto={{
                id: producto.id,
                slug: producto.slug,
                nombre: producto.nombre,
                precio: producto.precio,
                precioAnterior: producto.precioAnterior,
                imagenes: producto.imagenes,
                stock: producto.stock,
                tallas: ordenarTallas(producto.tallas),
                colores: producto.colores,
                variantes: producto.variantes,
              }}
              whatsapp={config.whatsapp}
              url={url}
            />

            <div className="mt-10">
              <Accordion
                items={[
                  ...(producto.descripcion
                    ? [{ title: 'Descripción', open: true, content: <div className="whitespace-pre-line">{producto.descripcion}</div> }]
                    : []),
                  {
                    title: 'Envíos',
                    content: (
                      <>
                        <p>
                          Enviamos a toda Colombia por {formatPrice(config.costoEnvio)}
                          {config.envioGratisDesde ? `, y gratis en compras desde ${formatPrice(config.envioGratisDesde)}` : ''}.
                        </p>
                        <p className="mt-2">Entrega estimada de 2 a 5 días hábiles según tu ciudad.</p>
                      </>
                    ),
                  },
                  {
                    title: 'Cambios',
                    content: <p>Tienes 15 días desde la entrega para solicitar un cambio de talla. La prenda debe estar sin uso y con sus etiquetas.</p>,
                  },
                  ...(metodos.length
                    ? [{ title: 'Formas de pago', content: <ul className="list-inside list-disc space-y-1">{metodos.map((m) => <li key={m as string}>{m}</li>)}</ul> }]
                    : []),
                ]}
              />
            </div>
          </div>
        </div>
      </div>

      <ProductCarousel
        eyebrow="Completa el look"
        title="También te puede gustar"
        href={producto.categoria ? `/categoria/${producto.categoria.slug}` : '/productos'}
        cta="Ver más"
        productos={relacionados}
      />
      <RecentlyViewed actual={card} />
    </>
  )
}

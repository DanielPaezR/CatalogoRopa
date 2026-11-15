import Link from 'next/link'
import ProductCard from '@/components/tienda/ProductCard'
import ProductImage from '@/components/tienda/ProductImage'
import { ChevronRightIcon, RefreshIcon, ShieldIcon, TruckIcon } from '@/components/ui/Icons'
import { prisma } from '@/lib/db'
import { getConfig } from '@/lib/config'
import { cardSelect, getCategoriasMenu } from '@/lib/catalogo'
import { formatPrice } from '@/lib/utils'

export const dynamic = 'force-dynamic'

function SectionHeader({ title, href, cta }: { title: string; href?: string; cta?: string }) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4">
      <h2 className="text-3xl sm:text-4xl">{title}</h2>
      {href && (
        <Link href={href} className="flex shrink-0 items-center gap-1 text-sm font-medium text-ink-soft hover:text-ink">
          {cta ?? 'Ver todo'} <ChevronRightIcon width={16} height={16} />
        </Link>
      )}
    </div>
  )
}

export default async function HomePage() {
  const [config, categorias, destacados, nuevos, ofertas, totalProductos] = await Promise.all([
    getConfig(),
    getCategoriasMenu(),
    prisma.producto.findMany({
      where: { activo: true, destacado: true },
      select: cardSelect,
      orderBy: { updatedAt: 'desc' },
      take: 8,
    }),
    prisma.producto.findMany({ where: { activo: true }, select: cardSelect, orderBy: { createdAt: 'desc' }, take: 8 }),
    prisma.producto.findMany({
      where: { activo: true, precioAnterior: { not: null }, stock: { gt: 0 } },
      select: cardSelect,
      orderBy: { updatedAt: 'desc' },
      take: 4,
    }),
    prisma.producto.count({ where: { activo: true } }),
  ])

  // Imagen de portada para cada categoría: la propia o la del producto más reciente
  const portadas = await Promise.all(
    categorias.map(async (c) => {
      if (c.imagen) return c.imagen
      const p = await prisma.producto.findFirst({
        where: { activo: true, categoriaId: c.id, imagenes: { isEmpty: false } },
        orderBy: { createdAt: 'desc' },
        select: { imagenes: true },
      })
      return p?.imagenes[0] ?? null
    })
  )

  const heroImg = config.heroImagen || destacados.find((p) => p.imagenes[0])?.imagenes[0] || nuevos.find((p) => p.imagenes[0])?.imagenes[0]

  return (
    <>
      {/* Hero */}
      <section className="container-page pt-6 sm:pt-10">
        <div className="relative grid overflow-hidden rounded-3xl bg-sand-100 lg:grid-cols-2">
          <div className="relative z-10 flex flex-col justify-center gap-6 px-6 py-14 sm:px-12 lg:py-24">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">{config.nombreTienda}</p>
            <h1 className="text-5xl leading-[1.05] sm:text-6xl lg:text-7xl">{config.heroTitulo}</h1>
            <p className="max-w-md text-base text-ink-soft sm:text-lg">{config.heroSubtitulo}</p>
            <div className="flex flex-wrap gap-3">
              <Link href="/productos" className="btn-primary px-7 py-3">
                Comprar ahora
              </Link>
              {ofertas.length > 0 && (
                <Link href="/productos?ofertas=1" className="btn-outline px-7 py-3">
                  Ver ofertas
                </Link>
              )}
            </div>
          </div>
          <div className="relative min-h-[320px] lg:min-h-[520px]">
            {heroImg ? (
              <img src={heroImg} alt="" className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,#e8c9b5,transparent_55%),radial-gradient(circle_at_70%_70%,#d6cbbb,transparent_50%)]">
                <div className="flex h-full items-center justify-center">
                  <span className="font-display text-[9rem] leading-none text-white/70 sm:text-[12rem]">
                    {config.nombreTienda.charAt(0)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Beneficios */}
      <section className="container-page mt-10">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: TruckIcon,
              title: config.envioGratisDesde ? `Envío gratis desde ${formatPrice(config.envioGratisDesde)}` : 'Envíos a toda Colombia',
              text: 'Despachamos a todo el país.',
            },
            {
              icon: ShieldIcon,
              title: config.pagoContraentrega ? 'Paga al recibir' : 'Compra segura',
              text: config.pagoContraentrega ? 'Pago contra entrega disponible.' : 'Tus datos están protegidos.',
            },
            { icon: RefreshIcon, title: 'Cambios fáciles', text: 'Si no te queda, te ayudamos con el cambio.' },
          ].map((b) => (
            <div key={b.title} className="flex items-center gap-4 rounded-2xl border border-sand-200 bg-white px-5 py-4">
              <div className="rounded-full bg-accent-light p-2.5 text-accent">
                <b.icon />
              </div>
              <div>
                <p className="text-sm font-semibold">{b.title}</p>
                <p className="text-xs text-stone-500">{b.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categorías */}
      {categorias.length > 0 && (
        <section className="container-page mt-20">
          <SectionHeader title="Compra por categoría" />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {categorias.map((c, i) => (
              <Link
                key={c.id}
                href={`/categoria/${c.slug}`}
                className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-sand-200"
              >
                <ProductImage src={portadas[i]} alt={c.nombre} className="transition duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <p className="font-display text-2xl">{c.nombre}</p>
                  {c.descripcion && <p className="mt-1 line-clamp-1 text-xs text-white/80">{c.descripcion}</p>}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Destacados */}
      {destacados.length > 0 && (
        <section className="container-page mt-20">
          <SectionHeader title="Favoritos de la casa" href="/productos" />
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
            {destacados.map((p, i) => (
              <ProductCard key={p.id} producto={p} eager={i < 4} />
            ))}
          </div>
        </section>
      )}

      {/* Ofertas */}
      {ofertas.length > 0 && (
        <section className="mt-20 bg-accent-light py-16">
          <div className="container-page">
            <SectionHeader title="En oferta" href="/productos?ofertas=1" cta="Todas las ofertas" />
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
              {ofertas.map((p) => (
                <ProductCard key={p.id} producto={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Novedades */}
      <section className="container-page mt-20">
        {nuevos.length > 0 ? (
          <>
            <SectionHeader title="Recién llegados" href="/productos" cta={`Ver los ${totalProductos} productos`} />
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
              {nuevos.map((p) => (
                <ProductCard key={p.id} producto={p} />
              ))}
            </div>
          </>
        ) : (
          <div className="card px-6 py-16 text-center">
            <h2 className="text-3xl">Muy pronto, nueva colección</h2>
            <p className="mx-auto mt-3 max-w-md text-stone-500">
              Estamos preparando las prendas. Vuelve pronto o escríbenos para conocer las novedades.
            </p>
            <Link href="/contacto" className="btn-primary mt-6">
              Contáctanos
            </Link>
          </div>
        )}
      </section>
    </>
  )
}

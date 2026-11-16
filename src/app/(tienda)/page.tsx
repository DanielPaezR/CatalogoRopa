import Link from 'next/link'
import Marquee from '@/components/tienda/Marquee'
import ProductCard from '@/components/tienda/ProductCard'
import ProductCarousel from '@/components/tienda/ProductCarousel'
import ProductImage from '@/components/tienda/ProductImage'
import { ArrowRightIcon, RefreshIcon, ShieldIcon, TruckIcon, WhatsappIcon } from '@/components/ui/Icons'
import { prisma } from '@/lib/db'
import { getConfig } from '@/lib/config'
import { cardSelect, getCategoriasConPortada } from '@/lib/catalogo'
import { cn, formatPrice, whatsappLink } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [config, categorias, destacados, nuevos, ofertas] = await Promise.all([
    getConfig(),
    getCategoriasConPortada(),
    prisma.producto.findMany({
      where: { activo: true, destacado: true },
      select: cardSelect,
      orderBy: { updatedAt: 'desc' },
      take: 8,
    }),
    prisma.producto.findMany({ where: { activo: true }, select: cardSelect, orderBy: { createdAt: 'desc' }, take: 12 }),
    prisma.producto.findMany({
      where: { activo: true, precioAnterior: { not: null }, stock: { gt: 0 } },
      select: cardSelect,
      orderBy: { updatedAt: 'desc' },
      take: 12,
    }),
  ])

  // La cuadrícula de favoritos se muestra en filas completas de 4
  const favoritos = destacados.length >= 4 ? destacados.slice(0, Math.floor(destacados.length / 4) * 4) : destacados
  const conFoto = [...destacados, ...nuevos].filter((p) => p.imagenes[0])
  const heroImg = config.heroImagen
  const diptico = !heroImg && conFoto.length >= 2 ? [conFoto[0].imagenes[0], conFoto[1].imagenes[1] ?? conFoto[1].imagenes[0]] : null
  const editorialImg = config.editorialImagen || conFoto[2]?.imagenes[0] || conFoto[0]?.imagenes[1] || null
  const editorialImg2 = conFoto[3]?.imagenes[0] || null
  const wa = whatsappLink(config.whatsapp, `¡Hola ${config.nombreTienda}! Quiero asesoría para elegir mi talla.`)
  const vacia = nuevos.length === 0

  return (
    <>
      {/* ---------- Portada ---------- */}
      <section className="relative h-[100svh] min-h-[600px] w-full overflow-hidden bg-bone">
        {heroImg ? (
          <img src={heroImg} alt="" className="absolute inset-0 h-full w-full animate-kenburns object-cover" />
        ) : diptico ? (
          <div className="absolute inset-0 grid grid-cols-2">
            {diptico.map((src, i) => (
              <div key={i} className="relative overflow-hidden">
                <img src={src} alt="" className="absolute inset-0 h-full w-full animate-kenburns object-cover" style={{ animationDelay: `${i * 150}ms` }} />
              </div>
            ))}
          </div>
        ) : null}
        {(heroImg || diptico) && <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-black/25" />}

        <div className={cn('relative flex h-full flex-col justify-end pb-16 sm:pb-20', heroImg || diptico ? 'text-white' : 'text-ink')}>
          <div className="wrap">
            <p className="eyebrow mb-5 animate-rise" style={{ animationDelay: '200ms' }}>
              {config.nombreTienda} — {new Date().getFullYear()}
            </p>
            <h1
              className="max-w-5xl animate-rise font-display text-[15vw] font-light leading-[0.9] tracking-tight sm:text-[10vw] lg:text-[8.5vw]"
              style={{ animationDelay: '350ms' }}
            >
              {config.heroTitulo}
            </h1>
            <div className="mt-8 flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
              <p className="max-w-md animate-rise text-[15px] leading-relaxed opacity-90 sm:text-base" style={{ animationDelay: '500ms' }}>
                {config.heroSubtitulo}
              </p>
              <div className="flex animate-rise flex-col gap-3 sm:flex-row" style={{ animationDelay: '650ms' }}>
                <Link href="/productos" className={heroImg || diptico ? 'cta-light' : 'cta'}>
                  Descubrir colección
                </Link>
                {ofertas.length > 0 && (
                  <Link href="/productos?ofertas=1" className={heroImg || diptico ? 'cta-ghost-light' : 'cta-outline'}>
                    Ofertas
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Novedades ---------- */}
      <ProductCarousel eyebrow="Recién llegado" title="Novedades" href="/productos" cta="Ver todo" productos={nuevos} />

      {/* ---------- Categorías ---------- */}
      {categorias.length > 0 && (
        <section className="px-4 sm:px-6 lg:px-10">
          <div
            className={cn(
              'grid gap-2 sm:gap-3',
              categorias.length === 1 ? 'grid-cols-1' : categorias.length === 2 || categorias.length === 4 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-3'
            )}
          >
            {categorias.slice(0, 6).map((c) => (
              <Link key={c.id} href={`/categoria/${c.slug}`} className="group relative block aspect-[4/5] overflow-hidden bg-bone sm:aspect-[3/4]">
                <ProductImage src={c.portada} alt={c.nombre} className="transition duration-[1.2s] ease-out group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex flex-col items-center p-8 text-center text-white">
                  <h3 className="font-display text-5xl font-light">{c.nombre}</h3>
                  <span className="link-u-on mt-4 text-[11px] uppercase tracking-label">Descubrir</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ---------- Editorial ---------- */}
      {!vacia && (
        <section className="mt-16 grid bg-bone lg:mt-24 lg:grid-cols-2">
          <div className="relative aspect-[4/5] overflow-hidden lg:aspect-auto lg:min-h-[760px]">
            <ProductImage src={editorialImg} alt="" />
          </div>
          <div className="flex flex-col justify-center px-6 py-16 sm:px-12 lg:px-20">
            <p className="eyebrow mb-6 text-stone-500">Editorial</p>
            <h2 className="font-display text-5xl font-light leading-[0.95] sm:text-6xl xl:text-7xl">{config.editorialTitulo}</h2>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-ink-soft">{config.editorialTexto}</p>
            <div className="mt-10 flex flex-wrap items-end gap-8">
              <Link href="/productos" className="cta">Comprar ahora</Link>
              {editorialImg2 && (
                <div className="hidden aspect-[3/4] w-40 overflow-hidden xl:block">
                  <img src={editorialImg2} alt="" loading="lazy" className="h-full w-full object-cover" />
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ---------- Favoritos ---------- */}
      {destacados.length > 0 && (
        <section className="wrap py-16 lg:py-24">
          <div className="mb-10 flex flex-col items-center text-center">
            <p className="eyebrow mb-3 text-stone-500">Selección</p>
            <h2 className="font-display text-4xl font-light sm:text-5xl">Favoritos de la casa</h2>
          </div>
          <div className="grid grid-cols-2 gap-x-2 gap-y-10 sm:gap-x-3 lg:grid-cols-4">
            {favoritos.map((p, i) => (
              <ProductCard key={p.id} producto={p} eager={i < 2} />
            ))}
          </div>
          <div className="mt-12 flex justify-center">
            <Link href="/productos" className="cta-outline">Ver toda la colección</Link>
          </div>
        </section>
      )}

      <Marquee items={['Nueva colección', 'Envíos a toda Colombia', config.pagoContraentrega ? 'Paga al recibir' : 'Compra segura', 'Cambios fáciles']} />

      {/* ---------- Ofertas ---------- */}
      {ofertas.length > 0 && (
        <ProductCarousel eyebrow="Precios especiales" title="Ofertas" href="/productos?ofertas=1" cta="Ver ofertas" productos={ofertas} />
      )}

      {/* ---------- Tienda vacía ---------- */}
      {vacia && (
        <section className="wrap flex flex-col items-center py-28 text-center">
          <p className="eyebrow mb-4 text-stone-500">Próximamente</p>
          <h2 className="font-display text-5xl font-light">La colección está en camino</h2>
          <p className="mt-4 max-w-md text-stone-500">Estamos preparando cada prenda. Déjanos tu correo abajo y sé la primera en saberlo.</p>
        </section>
      )}

      {/* ---------- Servicios ---------- */}
      <section className="wrap grid gap-10 border-t border-black/10 py-16 sm:grid-cols-2 lg:grid-cols-4 lg:py-20">
        {[
          {
            icon: TruckIcon,
            title: 'Envíos nacionales',
            text: config.envioGratisDesde ? `Gratis en compras desde ${formatPrice(config.envioGratisDesde)}.` : 'Llegamos a toda Colombia.',
          },
          {
            icon: ShieldIcon,
            title: config.pagoContraentrega ? 'Paga al recibir' : 'Compra segura',
            text: config.pagoContraentrega ? 'Pago contra entrega en tu ciudad.' : 'Tus datos siempre protegidos.',
          },
          { icon: RefreshIcon, title: 'Cambios fáciles', text: 'Si la talla no es, te ayudamos con el cambio.' },
          { icon: WhatsappIcon, title: 'Asesoría personal', text: 'Te ayudamos a elegir por WhatsApp.', href: wa },
        ].map((b) => {
          const inner = (
            <>
              <b.icon width={22} height={22} />
              <p className="mt-4 text-[12px] font-medium uppercase tracking-label">{b.title}</p>
              <p className="mt-2 text-[14px] text-stone-500">{b.text}</p>
              {b.href && (
                <span className="mt-3 inline-flex items-center gap-1 text-[12px] uppercase tracking-label">
                  Escríbenos <ArrowRightIcon width={14} height={14} />
                </span>
              )}
            </>
          )
          return b.href ? (
            <a key={b.title} href={b.href} target="_blank" rel="noreferrer" className="block hover:opacity-70">
              {inner}
            </a>
          ) : (
            <div key={b.title}>{inner}</div>
          )
        })}
      </section>
    </>
  )
}

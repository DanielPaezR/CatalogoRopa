import Link from 'next/link'
import { Suspense } from 'react'
import CatalogShell from './CatalogShell'
import { buscarProductos, getCategoriasMenu, opcionesFiltro, ORDENES, parseFiltros } from '@/lib/catalogo'
import { cn } from '@/lib/utils'

export default async function CatalogView({
  title,
  description,
  searchParams,
  categoriaSlug,
  eyebrow,
}: {
  title: string
  description?: string | null
  searchParams: Record<string, string | string[] | undefined>
  categoriaSlug?: string
  eyebrow?: string
}) {
  const filtros = { ...parseFiltros(searchParams), ...(categoriaSlug ? { categoria: categoriaSlug } : {}) }
  const [{ productos, total, page, pages }, categorias, opciones] = await Promise.all([
    buscarProductos(filtros),
    getCategoriasMenu(),
    opcionesFiltro(categoriaSlug),
  ])

  const ordenes = Object.entries(ORDENES).map(([value, o]) => ({ value, label: o.label }))
  const ofertas = searchParams.ofertas === '1'

  return (
    <div className="wrap pb-10 pt-10 lg:pt-14">
      <header className="mb-8 flex flex-col items-center text-center">
        {eyebrow && <p className="eyebrow mb-4 text-stone-500">{eyebrow}</p>}
        <h1 className="font-display text-5xl font-light leading-none sm:text-7xl">
          {filtros.q ? <>Resultados para <em>“{filtros.q}”</em></> : title}
        </h1>
        {description && !filtros.q && <p className="mt-5 max-w-xl text-[15px] text-stone-500">{description}</p>}

        <nav className="scrollbar-none -mx-4 mt-8 flex max-w-full gap-6 overflow-x-auto px-4 sm:gap-8" aria-label="Categorías">
          <Link
            href="/productos"
            className={cn('shrink-0 text-[12px] uppercase tracking-label', !categoriaSlug && !ofertas ? 'link-u-on' : 'link-u text-stone-500 hover:text-ink')}
          >
            Ver todo
          </Link>
          {categorias.map((c) => (
            <Link
              key={c.id}
              href={`/categoria/${c.slug}`}
              className={cn('shrink-0 text-[12px] uppercase tracking-label', categoriaSlug === c.slug ? 'link-u-on' : 'link-u text-stone-500 hover:text-ink')}
            >
              {c.nombre}
            </Link>
          ))}
          <Link
            href="/productos?ofertas=1"
            className={cn('shrink-0 text-[12px] uppercase tracking-label text-sale', ofertas && !categoriaSlug ? 'link-u-on' : 'link-u')}
          >
            Ofertas
          </Link>
        </nav>
      </header>

      <Suspense>
        <CatalogShell
          productos={productos}
          total={total}
          page={page}
          pages={pages}
          ordenes={ordenes}
          tallas={opciones.tallas}
          colores={opciones.colores}
        />
      </Suspense>
    </div>
  )
}

import Link from 'next/link'
import { Suspense } from 'react'
import ProductCard from './ProductCard'
import CatalogFilters from './CatalogFilters'
import Pagination from './Pagination'
import { buscarProductos, getCategoriasMenu, ORDENES, parseFiltros, tallasDisponibles } from '@/lib/catalogo'
import { cn } from '@/lib/utils'

export default async function CatalogView({
  title,
  description,
  basePath,
  searchParams,
  categoriaSlug,
}: {
  title: string
  description?: string | null
  basePath: string
  searchParams: Record<string, string | string[] | undefined>
  categoriaSlug?: string
}) {
  const filtros = { ...parseFiltros(searchParams), ...(categoriaSlug ? { categoria: categoriaSlug } : {}) }
  const [{ productos, total, page, pages }, categorias, tallas] = await Promise.all([
    buscarProductos(filtros),
    getCategoriasMenu(),
    tallasDisponibles(categoriaSlug),
  ])

  const ordenes = Object.entries(ORDENES).map(([value, o]) => ({ value, label: o.label }))

  return (
    <div className="container-page pt-10">
      <header className="mb-8">
        <nav className="mb-3 text-xs text-stone-500" aria-label="Ruta">
          <Link href="/" className="hover:text-ink">Inicio</Link> <span className="mx-1">/</span>
          <span className="text-ink">{title}</span>
        </nav>
        <h1 className="text-4xl sm:text-5xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-stone-500">{description}</p>}
        {filtros.q && (
          <p className="mt-2 text-stone-500">
            Resultados para <strong className="text-ink">“{filtros.q}”</strong>
          </p>
        )}
      </header>

      <div className="scrollbar-none -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
        <Link
          href="/productos"
          className={cn(
            'shrink-0 rounded-full border px-4 py-1.5 text-sm',
            !categoriaSlug ? 'border-ink bg-ink text-white' : 'border-sand-300 bg-white hover:border-ink'
          )}
        >
          Todo
        </Link>
        {categorias.map((c) => (
          <Link
            key={c.id}
            href={`/categoria/${c.slug}`}
            className={cn(
              'shrink-0 rounded-full border px-4 py-1.5 text-sm',
              categoriaSlug === c.slug ? 'border-ink bg-ink text-white' : 'border-sand-300 bg-white hover:border-ink'
            )}
          >
            {c.nombre}
          </Link>
        ))}
      </div>

      <Suspense>
        <CatalogFilters ordenes={ordenes} tallas={tallas} />
      </Suspense>

      <p className="mb-6 mt-8 text-sm text-stone-500">
        {total} {total === 1 ? 'producto' : 'productos'}
      </p>

      {productos.length === 0 ? (
        <div className="card px-6 py-16 text-center">
          <p className="font-display text-2xl">No encontramos productos</p>
          <p className="mt-2 text-stone-500">Prueba con otros filtros o explora todo el catálogo.</p>
          <Link href="/productos" className="btn-primary mt-6">
            Ver todo
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          {productos.map((p, i) => (
            <ProductCard key={p.id} producto={p} eager={i < 4} />
          ))}
        </div>
      )}

      <Pagination page={page} pages={pages} basePath={basePath} params={searchParams} />
    </div>
  )
}

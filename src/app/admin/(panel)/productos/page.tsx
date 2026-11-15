import Link from 'next/link'
import { Suspense } from 'react'
import type { Prisma } from '@prisma/client'
import PageHeader from '@/components/admin/PageHeader'
import AdminSearch from '@/components/admin/AdminSearch'
import ProductRowActions, { ActiveToggle } from '@/components/admin/ProductRowActions'
import ProductImage from '@/components/tienda/ProductImage'
import Pagination from '@/components/tienda/Pagination'
import { prisma } from '@/lib/db'
import { STOCK_BAJO } from '@/lib/constants'
import { cn, formatPrice } from '@/lib/utils'

export const dynamic = 'force-dynamic'

const PAGE = 30

type SP = Record<string, string | undefined>

export default async function AdminProductosPage({ searchParams }: { searchParams: SP }) {
  const { q, categoria, estado, stock } = searchParams
  const page = Math.max(1, Number(searchParams.page) || 1)

  const where: Prisma.ProductoWhereInput = {}
  if (q) {
    where.OR = [
      { nombre: { contains: q, mode: 'insensitive' } },
      { sku: { contains: q, mode: 'insensitive' } },
    ]
  }
  if (categoria === 'ninguna') where.categoriaId = null
  else if (categoria) where.categoriaId = categoria
  if (estado === 'activos') where.activo = true
  if (estado === 'ocultos') where.activo = false
  if (stock === 'bajo') where.stock = { lte: STOCK_BAJO }

  const [productos, total, categorias] = await Promise.all([
    prisma.producto.findMany({
      where,
      include: { categoria: { select: { nombre: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE,
      take: PAGE,
    }),
    prisma.producto.count({ where }),
    prisma.categoria.findMany({ orderBy: { orden: 'asc' }, select: { id: true, nombre: true } }),
  ])

  const filtroLink = (changes: SP) => {
    const sp = new URLSearchParams()
    Object.entries({ ...searchParams, ...changes, page: undefined }).forEach(([k, v]) => v && sp.set(k, v))
    const s = sp.toString()
    return s ? `/admin/productos?${s}` : '/admin/productos'
  }

  const chip = (active: boolean) =>
    cn('rounded-full border px-3 py-1 text-sm', active ? 'border-ink bg-ink text-white' : 'border-sand-300 bg-white hover:border-ink')

  return (
    <>
      <PageHeader
        title="Productos"
        description={`${total} ${total === 1 ? 'producto' : 'productos'}`}
        actions={<Link href="/admin/productos/nuevo" className="btn-primary">+ Nuevo producto</Link>}
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Suspense>
          <AdminSearch placeholder="Buscar por nombre o referencia" />
        </Suspense>
        <div className="flex flex-wrap gap-2">
          <Link href={filtroLink({ estado: undefined, stock: undefined })} className={chip(!estado && !stock)}>Todos</Link>
          <Link href={filtroLink({ estado: 'activos', stock: undefined })} className={chip(estado === 'activos')}>Visibles</Link>
          <Link href={filtroLink({ estado: 'ocultos', stock: undefined })} className={chip(estado === 'ocultos')}>Ocultos</Link>
          <Link href={filtroLink({ stock: 'bajo', estado: undefined })} className={chip(stock === 'bajo')}>Stock bajo</Link>
        </div>
      </div>

      {categorias.length > 0 && (
        <div className="scrollbar-none mb-6 flex gap-2 overflow-x-auto">
          <Link href={filtroLink({ categoria: undefined })} className={chip(!categoria)}>Todas las categorías</Link>
          {categorias.map((c) => (
            <Link key={c.id} href={filtroLink({ categoria: c.id })} className={cn(chip(categoria === c.id), 'shrink-0')}>
              {c.nombre}
            </Link>
          ))}
          <Link href={filtroLink({ categoria: 'ninguna' })} className={cn(chip(categoria === 'ninguna'), 'shrink-0')}>Sin categoría</Link>
        </div>
      )}

      {productos.length === 0 ? (
        <div className="card px-6 py-16 text-center">
          <p className="font-display text-2xl">{total === 0 && !q && !categoria && !estado && !stock ? 'Aún no tienes productos' : 'Sin resultados'}</p>
          <p className="mt-2 text-sm text-stone-500">Crea tu primer producto con fotos, tallas y colores.</p>
          <Link href="/admin/productos/nuevo" className="btn-primary mt-6">+ Nuevo producto</Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-sand-200 bg-sand-50 text-left text-xs uppercase tracking-wider text-stone-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Producto</th>
                  <th className="hidden px-4 py-3 font-medium md:table-cell">Categoría</th>
                  <th className="px-4 py-3 font-medium">Precio</th>
                  <th className="px-4 py-3 font-medium">Stock</th>
                  <th className="px-4 py-3 font-medium">Visible</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-200">
                {productos.map((p) => (
                  <tr key={p.id} className={cn(!p.activo && 'bg-sand-50/60')}>
                    <td className="px-4 py-3">
                      <Link href={`/admin/productos/${p.id}`} className="flex items-center gap-3">
                        <div className="h-14 w-11 shrink-0 overflow-hidden rounded-lg bg-sand-100">
                          <ProductImage src={p.imagenes[0]} alt={p.nombre} />
                        </div>
                        <div className="min-w-0">
                          <p className={cn('truncate font-medium', !p.activo && 'text-stone-400')}>{p.nombre}</p>
                          <p className="truncate text-xs text-stone-400">
                            {[p.sku, p.tallas.join(', ')].filter(Boolean).join(' · ') || '—'}
                          </p>
                        </div>
                      </Link>
                    </td>
                    <td className="hidden px-4 py-3 text-ink-soft md:table-cell">{p.categoria?.nombre ?? '—'}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {formatPrice(p.precio)}
                      {p.precioAnterior && <span className="ml-1 text-xs text-stone-400 line-through">{formatPrice(p.precioAnterior)}</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'chip',
                          p.stock === 0 ? 'bg-red-100 text-red-700' : p.stock <= STOCK_BAJO ? 'bg-amber-100 text-amber-800' : 'bg-sand-100 text-ink-soft'
                        )}
                      >
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <ActiveToggle id={p.id} activo={p.activo} />
                    </td>
                    <td className="px-2 py-3">
                      <ProductRowActions id={p.id} slug={p.slug} nombre={p.nombre} destacado={p.destacado} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Pagination page={page} pages={Math.ceil(total / PAGE)} basePath="/admin/productos" params={searchParams} />
    </>
  )
}

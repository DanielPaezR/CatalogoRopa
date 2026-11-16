import Link from 'next/link'
import PageHeader from '@/components/admin/PageHeader'
import ProductImage from '@/components/tienda/ProductImage'
import { prisma } from '@/lib/db'
import { ESTADO_COLOR, ESTADO_LABEL, STOCK_BAJO } from '@/lib/constants'
import { cn, formatDate, formatPrice } from '@/lib/utils'

export const dynamic = 'force-dynamic'

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

/** Inicio de mes en hora de Colombia (UTC-5), desplazado n meses. */
function inicioMes(n = 0) {
  const ahora = new Date(Date.now() - 5 * 3600 * 1000)
  return new Date(Date.UTC(ahora.getUTCFullYear(), ahora.getUTCMonth() + n, 1, 5))
}

export default async function DashboardPage() {
  const desde6 = inicioMes(-5)
  const [ventasMes, ventasMesAnterior, pendientes, productosActivos, bajoStock, recientes, pedidos6, top] = await Promise.all([
    prisma.pedido.aggregate({
      where: { estado: { not: 'CANCELADO' }, createdAt: { gte: inicioMes(0) } },
      _sum: { total: true },
      _count: true,
    }),
    prisma.pedido.aggregate({
      where: { estado: { not: 'CANCELADO' }, createdAt: { gte: inicioMes(-1), lt: inicioMes(0) } },
      _sum: { total: true },
    }),
    prisma.pedido.count({ where: { estado: 'PENDIENTE' } }),
    prisma.producto.count({ where: { activo: true } }),
    prisma.producto.findMany({
      where: { activo: true, stock: { lte: STOCK_BAJO } },
      orderBy: { stock: 'asc' },
      take: 6,
      select: { id: true, nombre: true, stock: true, imagenes: true },
    }),
    prisma.pedido.findMany({
      orderBy: { createdAt: 'desc' },
      take: 6,
      select: { id: true, numero: true, clienteNombre: true, total: true, estado: true, createdAt: true },
    }),
    prisma.pedido.findMany({
      where: { estado: { not: 'CANCELADO' }, createdAt: { gte: desde6 } },
      select: { total: true, createdAt: true },
    }),
    prisma.pedidoItem.groupBy({
      by: ['nombre'],
      where: { pedido: { estado: { not: 'CANCELADO' } } },
      _sum: { cantidad: true },
      orderBy: { _sum: { cantidad: 'desc' } },
      take: 5,
    }),
  ])

  const serie = Array.from({ length: 6 }, (_, i) => {
    const ini = inicioMes(i - 5)
    const fin = inicioMes(i - 4)
    const total = pedidos6.filter((p) => p.createdAt >= ini && p.createdAt < fin).reduce((s, p) => s + p.total, 0)
    const mesLocal = new Date(ini.getTime() - 5 * 3600 * 1000).getUTCMonth()
    return { label: MESES[mesLocal], total }
  })
  const maxSerie = Math.max(1, ...serie.map((s) => s.total))

  const totalMes = ventasMes._sum.total ?? 0
  const totalAnterior = ventasMesAnterior._sum.total ?? 0
  const variacion = totalAnterior > 0 ? Math.round(((totalMes - totalAnterior) / totalAnterior) * 100) : null

  const stats = [
    {
      label: 'Ventas del mes',
      value: formatPrice(totalMes),
      hint: variacion === null ? `${ventasMes._count} pedidos` : `${variacion >= 0 ? '+' : ''}${variacion}% vs. mes anterior`,
    },
    { label: 'Pedidos pendientes', value: String(pendientes), hint: 'Por confirmar', href: '/admin/pedidos?estado=PENDIENTE' },
    { label: 'Productos activos', value: String(productosActivos), hint: 'Visibles en la tienda', href: '/admin/productos' },
    { label: 'Stock bajo', value: String(bajoStock.length), hint: `${STOCK_BAJO} unidades o menos`, href: '/admin/productos?stock=bajo' },
  ]

  const demo = await prisma.producto.count({ where: { sku: { startsWith: 'DEMO-' } } })

  return (
    <>
      {demo > 0 && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
          La tienda muestra {demo} productos de ejemplo para que veas cómo luce.{' '}
          <Link href="/admin/configuracion" className="font-medium underline">Elimínalos aquí</Link> cuando subas tu catálogo.
        </div>
      )}
      <PageHeader
        title="Resumen"
        description="Así va tu tienda."
        actions={<Link href="/admin/productos/nuevo" className="btn-primary">+ Nuevo producto</Link>}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => {
          const inner = (
            <>
              <p className="text-xs font-medium uppercase tracking-widest text-stone-500">{s.label}</p>
              <p className="mt-2 text-2xl font-semibold sm:text-3xl">{s.value}</p>
              <p className="mt-1 text-xs text-stone-500">{s.hint}</p>
            </>
          )
          return s.href ? (
            <Link key={s.label} href={s.href} className="card p-5 transition hover:border-ink">{inner}</Link>
          ) : (
            <div key={s.label} className="card p-5">{inner}</div>
          )
        })}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="card p-6 lg:col-span-2">
          <h2 className="font-sans text-sm font-semibold uppercase tracking-widest text-stone-500">Ventas últimos 6 meses</h2>
          <div className="mt-6 flex h-48 items-end gap-3">
            {serie.map((s) => (
              <div key={s.label} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                <span className="text-[10px] text-stone-500">{s.total > 0 ? formatPrice(s.total).replace(/\s/g, '') : ''}</span>
                <div
                  className="w-full max-w-[56px] rounded-t-lg bg-ink transition-all"
                  style={{ height: `${Math.max(2, (s.total / maxSerie) * 100)}%`, opacity: s.total ? 1 : 0.15 }}
                  title={formatPrice(s.total)}
                />
                <span className="text-xs text-stone-500">{s.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="card p-6">
          <h2 className="font-sans text-sm font-semibold uppercase tracking-widest text-stone-500">Más vendidos</h2>
          {top.length === 0 ? (
            <p className="mt-6 text-sm text-stone-400">Aún no hay ventas.</p>
          ) : (
            <ol className="mt-4 space-y-3">
              {top.map((t, i) => (
                <li key={t.nombre} className="flex items-center gap-3 text-sm">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sand-100 text-xs font-semibold">{i + 1}</span>
                  <span className="flex-1 truncate">{t.nombre}</span>
                  <span className="text-stone-500">{t._sum.cantidad} ud.</span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="card p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-sans text-sm font-semibold uppercase tracking-widest text-stone-500">Pedidos recientes</h2>
            <Link href="/admin/pedidos" className="text-sm text-stone-500 hover:text-ink">Ver todos</Link>
          </div>
          {recientes.length === 0 ? (
            <p className="mt-6 text-sm text-stone-400">Todavía no hay pedidos.</p>
          ) : (
            <ul className="mt-4 divide-y divide-sand-200">
              {recientes.map((p) => (
                <li key={p.id}>
                  <Link href={`/admin/pedidos/${p.id}`} className="flex items-center gap-3 py-3 text-sm hover:opacity-80">
                    <span className="font-semibold">#{p.numero}</span>
                    <span className="flex-1 truncate text-ink-soft">{p.clienteNombre}</span>
                    <span className={cn('chip', ESTADO_COLOR[p.estado])}>{ESTADO_LABEL[p.estado]}</span>
                    <span className="hidden w-24 text-right sm:block">{formatPrice(p.total)}</span>
                    <span className="hidden w-24 text-right text-xs text-stone-400 md:block">{formatDate(p.createdAt)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card p-6">
          <h2 className="font-sans text-sm font-semibold uppercase tracking-widest text-stone-500">Stock bajo</h2>
          {bajoStock.length === 0 ? (
            <p className="mt-6 text-sm text-stone-400">Todo en orden. 👌</p>
          ) : (
            <ul className="mt-4 divide-y divide-sand-200">
              {bajoStock.map((p) => (
                <li key={p.id}>
                  <Link href={`/admin/productos/${p.id}`} className="flex items-center gap-3 py-2.5 text-sm hover:opacity-80">
                    <div className="h-10 w-8 shrink-0 overflow-hidden rounded-md bg-sand-100">
                      <ProductImage src={p.imagenes[0]} alt={p.nombre} />
                    </div>
                    <span className="flex-1 truncate">{p.nombre}</span>
                    <span className={cn('chip', p.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800')}>
                      {p.stock === 0 ? 'Agotado' : `${p.stock} ud.`}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  )
}

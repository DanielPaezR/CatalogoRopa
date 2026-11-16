import Link from 'next/link'
import { Suspense } from 'react'
import type { Prisma } from '@prisma/client'
import PageHeader from '@/components/admin/PageHeader'
import AdminSearch from '@/components/admin/AdminSearch'
import Pagination from '@/components/admin/Pagination'
import { prisma } from '@/lib/db'
import { ESTADO_COLOR, ESTADO_LABEL, ESTADOS_PEDIDO, METODO_LABEL } from '@/lib/constants'
import { cn, formatDate, formatPrice } from '@/lib/utils'

export const dynamic = 'force-dynamic'

const PAGE = 30

export default async function AdminPedidosPage({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  const { estado, q } = searchParams
  const page = Math.max(1, Number(searchParams.page) || 1)

  const where: Prisma.PedidoWhereInput = {}
  if (estado && (ESTADOS_PEDIDO as readonly string[]).includes(estado)) where.estado = estado
  if (q) {
    const num = Number(q.replace('#', ''))
    where.OR = [
      { clienteNombre: { contains: q, mode: 'insensitive' } },
      { clienteTelefono: { contains: q } },
      { clienteEmail: { contains: q, mode: 'insensitive' } },
      ...(Number.isInteger(num) && num > 0 ? [{ numero: num }] : []),
    ]
  }

  const [pedidos, total, conteos] = await Promise.all([
    prisma.pedido.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE,
      take: PAGE,
      include: { _count: { select: { items: true } } },
    }),
    prisma.pedido.count({ where }),
    prisma.pedido.groupBy({ by: ['estado'], _count: true }),
  ])

  const conteo = (e: string) => conteos.find((c) => c.estado === e)?._count ?? 0
  const tab = (active: boolean) =>
    cn('shrink-0 rounded-full border px-3 py-1 text-sm', active ? 'border-ink bg-ink text-white' : 'border-sand-300 bg-white hover:border-ink')

  return (
    <>
      <PageHeader title="Pedidos" description="Gestiona y actualiza el estado de cada compra." />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="scrollbar-none flex gap-2 overflow-x-auto">
          <Link href="/admin/pedidos" className={tab(!estado)}>Todos</Link>
          {ESTADOS_PEDIDO.map((e) => (
            <Link key={e} href={`/admin/pedidos?estado=${e}`} className={tab(estado === e)}>
              {ESTADO_LABEL[e]} <span className="opacity-60">{conteo(e)}</span>
            </Link>
          ))}
        </div>
        <Suspense>
          <AdminSearch placeholder="Nombre, teléfono o #número" />
        </Suspense>
      </div>

      {pedidos.length === 0 ? (
        <div className="card px-6 py-16 text-center text-sm text-stone-400">No hay pedidos {estado ? 'con este estado' : 'todavía'}.</div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-sand-200 bg-sand-50 text-left text-xs uppercase tracking-wider text-stone-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Pedido</th>
                  <th className="px-4 py-3 font-medium">Cliente</th>
                  <th className="hidden px-4 py-3 font-medium md:table-cell">Pago</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-200">
                {pedidos.map((p) => (
                  <tr key={p.id} className="hover:bg-sand-50">
                    <td className="px-4 py-3">
                      <Link href={`/admin/pedidos/${p.id}`} className="font-semibold hover:underline">#{p.numero}</Link>
                      <p className="text-xs text-stone-400">{formatDate(p.createdAt, true)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/pedidos/${p.id}`} className="block">
                        <p className="font-medium">{p.clienteNombre}</p>
                        <p className="text-xs text-stone-500">{p.ciudad} · {p.clienteTelefono}</p>
                      </Link>
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      <p className="text-ink-soft">{METODO_LABEL[p.metodoPago]}</p>
                      {p.pagado && <span className="chip mt-1 bg-emerald-100 text-emerald-800">Pagado</span>}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <p className="font-medium">{formatPrice(p.total)}</p>
                      <p className="text-xs text-stone-400">{p._count.items} {p._count.items === 1 ? 'artículo' : 'artículos'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('chip', ESTADO_COLOR[p.estado])}>{ESTADO_LABEL[p.estado]}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Pagination page={page} pages={Math.ceil(total / PAGE)} basePath="/admin/pedidos" params={searchParams} />
    </>
  )
}

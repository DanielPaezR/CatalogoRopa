import Link from 'next/link'
import { notFound } from 'next/navigation'
import OrderActions from '@/components/admin/OrderActions'
import ProductImage from '@/components/tienda/ProductImage'
import { MailIcon, MapPinIcon, PhoneIcon, WhatsappIcon } from '@/components/ui/Icons'
import { prisma } from '@/lib/db'
import { getConfig } from '@/lib/config'
import { ESTADO_COLOR, ESTADO_LABEL, METODO_LABEL } from '@/lib/constants'
import { cn, formatDate, formatPrice, whatsappLink } from '@/lib/utils'

export const dynamic = 'force-dynamic'

const MENSAJE_ESTADO: Record<string, string> = {
  PENDIENTE: 'recibimos tu pedido y lo estamos revisando',
  CONFIRMADO: 'tu pedido está confirmado y lo estamos preparando',
  ENVIADO: 'tu pedido ya fue enviado',
  ENTREGADO: 'tu pedido figura como entregado. ¡Gracias por tu compra!',
  CANCELADO: 'tu pedido fue cancelado',
}

export default async function AdminPedidoPage({ params }: { params: { id: string } }) {
  const [pedido, config] = await Promise.all([
    prisma.pedido.findUnique({ where: { id: params.id }, include: { items: { include: { producto: { select: { id: true, slug: true } } } } } }),
    getConfig(),
  ])
  if (!pedido) notFound()

  const wa = whatsappLink(
    pedido.clienteTelefono,
    `Hola ${pedido.clienteNombre.split(' ')[0]}, te escribimos de ${config.nombreTienda} sobre tu pedido #${pedido.numero}: ${MENSAJE_ESTADO[pedido.estado]}.`
  )

  return (
    <>
      <Link href="/admin/pedidos" className="mb-2 inline-block text-sm text-stone-500 hover:text-ink">← Pedidos</Link>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl">Pedido #{pedido.numero}</h1>
          <p className="mt-1 text-sm text-stone-500">{formatDate(pedido.createdAt, true)}</p>
        </div>
        <div className="flex gap-2">
          {pedido.pagado && <span className="chip bg-emerald-100 text-emerald-800">Pagado</span>}
          <span className={cn('chip', ESTADO_COLOR[pedido.estado])}>{ESTADO_LABEL[pedido.estado]}</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <section className="card p-6">
            <h2 className="mb-4 font-sans text-sm font-semibold uppercase tracking-widest text-stone-500">Artículos</h2>
            <ul className="divide-y divide-sand-200">
              {pedido.items.map((i) => (
                <li key={i.id} className="flex items-center gap-4 py-3">
                  <div className="h-16 w-12 shrink-0 overflow-hidden rounded-lg bg-sand-100">
                    <ProductImage src={i.imagen} alt={i.nombre} />
                  </div>
                  <div className="min-w-0 flex-1 text-sm">
                    {i.producto ? (
                      <Link href={`/admin/productos/${i.producto.id}`} className="font-medium hover:underline">{i.nombre}</Link>
                    ) : (
                      <p className="font-medium">{i.nombre}</p>
                    )}
                    <p className="text-xs text-stone-500">
                      {[i.talla && `Talla ${i.talla}`, i.color].filter(Boolean).join(' · ') || '—'}
                    </p>
                  </div>
                  <p className="text-sm text-stone-500">{i.cantidad} × {formatPrice(i.precio)}</p>
                  <p className="w-24 text-right text-sm font-medium">{formatPrice(i.precio * i.cantidad)}</p>
                </li>
              ))}
            </ul>
            <div className="mt-4 space-y-1.5 border-t border-sand-200 pt-4 text-sm">
              <div className="flex justify-between"><span className="text-stone-500">Subtotal</span><span>{formatPrice(pedido.subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-stone-500">Envío</span><span>{pedido.envio ? formatPrice(pedido.envio) : 'Gratis'}</span></div>
              <div className="flex justify-between pt-2 text-lg font-semibold"><span>Total</span><span>{formatPrice(pedido.total)}</span></div>
            </div>
          </section>

          <section className="card grid gap-6 p-6 sm:grid-cols-2">
            <div className="space-y-2 text-sm">
              <h2 className="mb-3 font-sans text-sm font-semibold uppercase tracking-widest text-stone-500">Cliente</h2>
              <p className="font-medium">{pedido.clienteNombre}</p>
              <p className="flex items-center gap-2 text-ink-soft"><PhoneIcon width={16} height={16} /> {pedido.clienteTelefono}</p>
              {pedido.clienteEmail && (
                <p className="flex items-center gap-2 text-ink-soft"><MailIcon width={16} height={16} /> {pedido.clienteEmail}</p>
              )}
              <p className="flex items-start gap-2 text-ink-soft"><MapPinIcon width={16} height={16} className="mt-0.5 shrink-0" /> {pedido.direccion}, {pedido.ciudad}</p>
            </div>
            <div className="space-y-2 text-sm">
              <h2 className="mb-3 font-sans text-sm font-semibold uppercase tracking-widest text-stone-500">Pago</h2>
              <p>{METODO_LABEL[pedido.metodoPago]}</p>
              {pedido.notas && (
                <>
                  <h2 className="mb-1 mt-4 font-sans text-sm font-semibold uppercase tracking-widest text-stone-500">Notas</h2>
                  <p className="whitespace-pre-line text-ink-soft">{pedido.notas}</p>
                </>
              )}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="card p-6">
            <OrderActions id={pedido.id} estado={pedido.estado} pagado={pedido.pagado} />
          </section>
          {wa && (
            <a href={wa} target="_blank" rel="noreferrer" className="btn-whatsapp w-full py-3">
              <WhatsappIcon /> Escribir al cliente
            </a>
          )}
          <Link href={`/pedido/${pedido.id}`} target="_blank" className="btn-outline w-full">
            Ver página del cliente
          </Link>
        </aside>
      </div>
    </>
  )
}

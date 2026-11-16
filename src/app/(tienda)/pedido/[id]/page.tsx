import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ProductImage from '@/components/tienda/ProductImage'
import { WhatsappIcon } from '@/components/ui/Icons'
import { prisma } from '@/lib/db'
import { getConfig } from '@/lib/config'
import { ESTADO_LABEL, METODO_LABEL } from '@/lib/constants'
import { cn, formatDate, formatPrice, whatsappLink } from '@/lib/utils'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Tu pedido', robots: { index: false } }

const PASOS = ['PENDIENTE', 'CONFIRMADO', 'ENVIADO', 'ENTREGADO']

export default async function PedidoPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { nuevo?: string; pago?: string }
}) {
  const [pedido, config] = await Promise.all([
    prisma.pedido.findUnique({ where: { id: params.id }, include: { items: true } }),
    getConfig(),
  ])
  if (!pedido) notFound()

  const lineas = pedido.items
    .map((i) => `• ${i.cantidad} x ${i.nombre}${i.talla ? ` (talla ${i.talla})` : ''}${i.color ? ` ${i.color}` : ''} — ${formatPrice(i.precio * i.cantidad)}`)
    .join('\n')
  const mensaje = `¡Hola ${config.nombreTienda}! Acabo de hacer el pedido #${pedido.numero}:\n${lineas}\nEnvío: ${
    pedido.envio ? formatPrice(pedido.envio) : 'Gratis'
  }\nTotal: ${formatPrice(pedido.total)}\nPago: ${METODO_LABEL[pedido.metodoPago]}\nA nombre de ${pedido.clienteNombre}, ${pedido.direccion}, ${pedido.ciudad}.`
  const wa = whatsappLink(config.whatsapp, mensaje)

  const nuevo = searchParams.nuevo === '1' || searchParams.pago === 'ok'
  const pasoActual = PASOS.indexOf(pedido.estado)
  const cancelado = pedido.estado === 'CANCELADO'

  const label = 'mb-3 text-[11px] uppercase tracking-label text-stone-500'

  return (
    <div className="wrap max-w-5xl pb-10 pt-12 lg:pt-20">
      {searchParams.pago === 'cancelado' && !pedido.pagado && (
        <div className="mb-10 border border-black/15 p-5 text-[14px]">
          El pago con tarjeta no se completó. Escríbenos por WhatsApp y te ayudamos a terminar tu compra.
        </div>
      )}

      <header className="text-center">
        <p className="eyebrow mb-4 text-stone-500">Pedido #{pedido.numero}</p>
        <h1 className="font-display text-5xl font-light leading-none sm:text-7xl">
          {cancelado ? 'Pedido cancelado' : nuevo ? <>Gracias, <em>{pedido.clienteNombre.split(' ')[0]}</em></> : ESTADO_LABEL[pedido.estado]}
        </h1>
        <p className="mx-auto mt-5 max-w-md text-[15px] text-stone-500">
          {nuevo && !cancelado
            ? 'Recibimos tu pedido. Guarda esta página para consultar su estado cuando quieras.'
            : `Realizado el ${formatDate(pedido.createdAt, true)}`}
        </p>
      </header>

      {wa && !cancelado && pedido.metodoPago !== 'STRIPE' && (
        <div className="mx-auto mt-12 max-w-xl bg-bone px-6 py-8 text-center">
          <p className="text-[12px] uppercase tracking-label">
            {pedido.metodoPago === 'WHATSAPP' ? 'Último paso' : 'Agiliza tu envío'}
          </p>
          <p className="mt-2 font-display text-3xl font-light">Envíanos tu pedido por WhatsApp</p>
          <p className="mt-2 text-[13px] text-stone-500">El mensaje ya va listo con el detalle de tu compra.</p>
          <a href={wa} target="_blank" rel="noreferrer" className="cta mt-6 bg-[#1f9d55] hover:bg-[#188a49]">
            <WhatsappIcon width={18} height={18} /> Enviar por WhatsApp
          </a>
        </div>
      )}

      {pedido.metodoPago === 'TRANSFERENCIA' && !pedido.pagado && config.infoTransferencia && !cancelado && (
        <div className="mx-auto mt-4 max-w-xl border border-black/10 p-6">
          <p className={label}>Datos para la transferencia</p>
          <p className="whitespace-pre-line text-[14px]">{config.infoTransferencia}</p>
          <p className="mt-4 text-[14px]">
            Valor: <strong className="font-medium">{formatPrice(pedido.total)}</strong>. Envíanos el comprobante por WhatsApp.
          </p>
        </div>
      )}

      {!cancelado && (
        <ol className="mx-auto mt-16 grid max-w-3xl grid-cols-4">
          {PASOS.map((p, i) => (
            <li key={p} className="relative text-center">
              <div className={cn('h-px', i <= pasoActual ? 'bg-ink' : 'bg-black/15')} />
              <span
                className={cn(
                  'absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border',
                  i <= pasoActual ? 'border-ink bg-ink' : 'border-black/25 bg-white'
                )}
              />
              <p className={cn('mt-4 text-[11px] uppercase tracking-label', i <= pasoActual ? 'text-ink' : 'text-stone-400')}>{ESTADO_LABEL[p]}</p>
            </li>
          ))}
        </ol>
      )}

      <div className="mt-16 grid gap-12 lg:grid-cols-[1fr_320px]">
        <section>
          <p className={label}>Artículos</p>
          <ul className="divide-y divide-black/10 border-y border-black/10">
            {pedido.items.map((i) => (
              <li key={i.id} className="flex items-center gap-5 py-5">
                <div className="aspect-[2/3] w-16 shrink-0 overflow-hidden bg-bone">
                  <ProductImage src={i.imagen} alt={i.nombre} />
                </div>
                <div className="flex-1">
                  <p className="text-[12px] uppercase tracking-wide">{i.nombre}</p>
                  <p className="mt-1 text-[13px] text-stone-500">
                    {[i.color, i.talla && `Talla ${i.talla}`, `${i.cantidad} ud.`].filter(Boolean).join(' · ')}
                  </p>
                </div>
                <p className="text-[14px]">{formatPrice(i.precio * i.cantidad)}</p>
              </li>
            ))}
          </ul>
          <div className="ml-auto mt-6 max-w-xs space-y-2 text-[14px]">
            <div className="flex justify-between"><span className="text-stone-500">Subtotal</span><span>{formatPrice(pedido.subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-stone-500">Envío</span><span>{pedido.envio ? formatPrice(pedido.envio) : 'Gratis'}</span></div>
            <div className="flex justify-between border-t border-black/10 pt-3 text-[15px] font-medium">
              <span className="uppercase tracking-label">Total</span><span>{formatPrice(pedido.total)}</span>
            </div>
          </div>
        </section>

        <aside className="space-y-8 text-[14px]">
          <div>
            <p className={label}>Entrega</p>
            <p>{pedido.clienteNombre}</p>
            <p className="text-stone-500">{pedido.direccion}</p>
            <p className="text-stone-500">{pedido.ciudad}</p>
            <p className="text-stone-500">{pedido.clienteTelefono}</p>
          </div>
          <div>
            <p className={label}>Pago</p>
            <p>{METODO_LABEL[pedido.metodoPago]}</p>
            {pedido.pagado && <p className="text-stone-500">Pago recibido</p>}
          </div>
          {pedido.notas && (
            <div>
              <p className={label}>Notas</p>
              <p className="text-stone-500">{pedido.notas}</p>
            </div>
          )}
        </aside>
      </div>

      <div className="mt-16 text-center">
        <Link href="/productos" className="cta-outline">Seguir comprando</Link>
      </div>
    </div>
  )
}

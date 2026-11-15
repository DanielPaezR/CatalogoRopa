import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ProductImage from '@/components/tienda/ProductImage'
import { CheckIcon, WhatsappIcon } from '@/components/ui/Icons'
import { prisma } from '@/lib/db'
import { getConfig } from '@/lib/config'
import { ESTADO_COLOR, ESTADO_LABEL, METODO_LABEL } from '@/lib/constants'
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

  return (
    <div className="container-page max-w-3xl pt-12">
      {searchParams.pago === 'cancelado' && !pedido.pagado ? (
        <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
          El pago con tarjeta no se completó. Si quieres, escríbenos por WhatsApp y te ayudamos a terminar la compra.
        </div>
      ) : null}

      <div className="text-center">
        {nuevo && (
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <CheckIcon width={32} height={32} />
          </div>
        )}
        <h1 className="text-4xl sm:text-5xl">{nuevo ? '¡Gracias por tu compra!' : `Pedido #${pedido.numero}`}</h1>
        <p className="mt-3 text-stone-500">
          {nuevo ? (
            <>
              Recibimos tu pedido <strong className="text-ink">#{pedido.numero}</strong>. Guarda esta página para consultar su estado.
            </>
          ) : (
            <>Realizado el {formatDate(pedido.createdAt, true)}</>
          )}
        </p>
      </div>

      {wa && pedido.estado !== 'CANCELADO' && pedido.metodoPago !== 'STRIPE' && (
        <div className="mt-8 rounded-2xl border border-[#25D366]/30 bg-[#25D366]/5 p-6 text-center">
          <p className="font-medium">
            {pedido.metodoPago === 'WHATSAPP' ? 'Último paso: envíanos tu pedido por WhatsApp' : 'Confirma tu pedido por WhatsApp para agilizar el envío'}
          </p>
          <p className="mt-1 text-sm text-stone-500">El mensaje ya va listo con el detalle de tu compra.</p>
          <a href={wa} target="_blank" rel="noreferrer" className="btn-whatsapp mt-4 px-8 py-3">
            <WhatsappIcon /> Enviar por WhatsApp
          </a>
        </div>
      )}

      {pedido.metodoPago === 'TRANSFERENCIA' && !pedido.pagado && config.infoTransferencia && pedido.estado !== 'CANCELADO' && (
        <div className="mt-6 rounded-2xl bg-sand-100 p-6">
          <p className="mb-2 font-medium">Datos para la transferencia</p>
          <p className="whitespace-pre-line text-sm text-ink-soft">{config.infoTransferencia}</p>
          <p className="mt-3 text-sm">
            Valor a transferir: <strong>{formatPrice(pedido.total)}</strong>. Envíanos el comprobante por WhatsApp.
          </p>
        </div>
      )}

      <div className="card mt-8 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl">Estado</h2>
          <div className="flex gap-2">
            {pedido.pagado && <span className="chip bg-emerald-100 text-emerald-800">Pagado</span>}
            <span className={cn('chip', ESTADO_COLOR[pedido.estado])}>{ESTADO_LABEL[pedido.estado]}</span>
          </div>
        </div>
        {pedido.estado !== 'CANCELADO' && (
          <ol className="mt-6 grid grid-cols-4 gap-2">
            {PASOS.map((p, i) => (
              <li key={p} className="text-center">
                <div className={cn('mx-auto h-1.5 rounded-full', i <= pasoActual ? 'bg-ink' : 'bg-sand-200')} />
                <p className={cn('mt-2 text-xs', i <= pasoActual ? 'font-medium text-ink' : 'text-stone-400')}>{ESTADO_LABEL[p]}</p>
              </li>
            ))}
          </ol>
        )}
      </div>

      <div className="card mt-6 p-6">
        <h2 className="mb-4 text-2xl">Detalle</h2>
        <ul className="divide-y divide-sand-200">
          {pedido.items.map((i) => (
            <li key={i.id} className="flex items-center gap-4 py-3">
              <div className="h-16 w-12 shrink-0 overflow-hidden rounded-lg bg-sand-100">
                <ProductImage src={i.imagen} alt={i.nombre} />
              </div>
              <div className="flex-1 text-sm">
                <p className="font-medium">{i.nombre}</p>
                <p className="text-xs text-stone-500">
                  {[i.talla && `Talla ${i.talla}`, i.color, `${i.cantidad} ud.`].filter(Boolean).join(' · ')}
                </p>
              </div>
              <p className="text-sm">{formatPrice(i.precio * i.cantidad)}</p>
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-1.5 border-t border-sand-200 pt-4 text-sm">
          <div className="flex justify-between"><span className="text-stone-500">Subtotal</span><span>{formatPrice(pedido.subtotal)}</span></div>
          <div className="flex justify-between"><span className="text-stone-500">Envío</span><span>{pedido.envio ? formatPrice(pedido.envio) : 'Gratis'}</span></div>
          <div className="flex justify-between pt-2 text-lg font-semibold"><span>Total</span><span>{formatPrice(pedido.total)}</span></div>
        </div>
      </div>

      <div className="card mt-6 grid gap-6 p-6 text-sm sm:grid-cols-2">
        <div>
          <p className="mb-1 font-medium">Entrega</p>
          <p className="text-ink-soft">{pedido.clienteNombre}</p>
          <p className="text-ink-soft">{pedido.direccion}</p>
          <p className="text-ink-soft">{pedido.ciudad}</p>
          <p className="text-ink-soft">{pedido.clienteTelefono}</p>
        </div>
        <div>
          <p className="mb-1 font-medium">Pago</p>
          <p className="text-ink-soft">{METODO_LABEL[pedido.metodoPago]}</p>
          {pedido.notas && (
            <>
              <p className="mb-1 mt-3 font-medium">Notas</p>
              <p className="text-ink-soft">{pedido.notas}</p>
            </>
          )}
        </div>
      </div>

      <div className="mt-10 text-center">
        <Link href="/productos" className="btn-outline px-8 py-3">
          Seguir comprando
        </Link>
      </div>
    </div>
  )
}

import type { Metadata } from 'next'
import { ClockIcon, InstagramIcon, MailIcon, MapPinIcon, PhoneIcon, WhatsappIcon } from '@/components/ui/Icons'
import { getConfig } from '@/lib/config'
import { formatPrice, whatsappLink } from '@/lib/utils'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Contacto' }

export default async function ContactoPage() {
  const config = await getConfig()
  const wa = whatsappLink(config.whatsapp, `¡Hola ${config.nombreTienda}! Tengo una pregunta.`)

  const datos = [
    config.whatsapp && { icon: WhatsappIcon, label: 'WhatsApp', value: config.whatsapp, href: wa },
    config.telefono && { icon: PhoneIcon, label: 'Teléfono', value: config.telefono, href: `tel:${config.telefono.replace(/\s/g, '')}` },
    config.email && { icon: MailIcon, label: 'Correo', value: config.email, href: `mailto:${config.email}` },
    (config.direccion || config.ciudad) && {
      icon: MapPinIcon,
      label: 'Dirección',
      value: [config.direccion, config.ciudad].filter(Boolean).join(', '),
      href: null,
    },
    config.horario && { icon: ClockIcon, label: 'Horario', value: config.horario, href: null },
    config.instagram && {
      icon: InstagramIcon,
      label: 'Instagram',
      value: config.instagram,
      href: /^https?:/.test(config.instagram) ? config.instagram : `https://instagram.com/${config.instagram.replace(/^@/, '')}`,
    },
  ].filter(Boolean) as { icon: typeof MailIcon; label: string; value: string; href: string | null }[]

  return (
    <div className="container-page max-w-5xl pt-12">
      <h1 className="text-5xl">Hablemos</h1>
      <p className="mt-3 max-w-xl text-stone-500">
        ¿Dudas sobre tallas, envíos o un pedido? Escríbenos y te respondemos lo antes posible.
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <div className="space-y-3">
          {datos.length === 0 && <p className="text-stone-500">Pronto publicaremos nuestros datos de contacto.</p>}
          {datos.map((d) => {
            const content = (
              <>
                <div className="rounded-full bg-accent-light p-3 text-accent">
                  <d.icon />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-stone-500">{d.label}</p>
                  <p className="font-medium">{d.value}</p>
                </div>
              </>
            )
            return d.href ? (
              <a key={d.label} href={d.href} target="_blank" rel="noreferrer" className="card flex items-center gap-4 p-4 transition hover:border-ink">
                {content}
              </a>
            ) : (
              <div key={d.label} className="card flex items-center gap-4 p-4">
                {content}
              </div>
            )
          })}
          {wa && (
            <a href={wa} target="_blank" rel="noreferrer" className="btn-whatsapp mt-4 w-full py-3.5">
              <WhatsappIcon /> Escríbenos por WhatsApp
            </a>
          )}
        </div>

        <div id="envios" className="space-y-6 rounded-3xl bg-sand-100 p-8">
          <h2 className="text-3xl">Envíos y cambios</h2>
          <div>
            <p className="font-medium">¿Cuánto cuesta el envío?</p>
            <p className="mt-1 text-sm text-ink-soft">
              El envío a cualquier ciudad de Colombia cuesta {formatPrice(config.costoEnvio)}
              {config.envioGratisDesde ? ` y es gratis en compras desde ${formatPrice(config.envioGratisDesde)}` : ''}.
            </p>
          </div>
          <div>
            <p className="font-medium">¿Cuánto tarda?</p>
            <p className="mt-1 text-sm text-ink-soft">Entre 2 y 5 días hábiles según la ciudad. Te compartimos la guía de seguimiento.</p>
          </div>
          <div>
            <p className="font-medium">¿Cómo pago?</p>
            <p className="mt-1 text-sm text-ink-soft">
              {[
                config.pagoContraentrega && 'contra entrega',
                config.pagoTransferencia && 'transferencia o Nequi',
                config.pagoWhatsapp && 'acordando por WhatsApp',
              ]
                .filter(Boolean)
                .join(', ') || 'Escríbenos para acordar el pago'}
              .
            </p>
          </div>
          <div>
            <p className="font-medium">¿Y si no me queda?</p>
            <p className="mt-1 text-sm text-ink-soft">
              Puedes solicitar cambio de talla dentro de los 15 días siguientes a la entrega, con la prenda sin uso y con etiquetas.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

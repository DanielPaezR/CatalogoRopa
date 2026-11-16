import type { Metadata } from 'next'
import Accordion from '@/components/tienda/Accordion'
import { SizeTables } from '@/components/tienda/SizeGuide'
import { WhatsappIcon } from '@/components/ui/Icons'
import { getConfig } from '@/lib/config'
import { formatPrice, whatsappLink } from '@/lib/utils'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Contacto y ayuda' }

export default async function ContactoPage() {
  const config = await getConfig()
  const wa = whatsappLink(config.whatsapp, `¡Hola ${config.nombreTienda}! Tengo una pregunta.`)

  const datos = [
    config.whatsapp && { label: 'WhatsApp', value: config.whatsapp, href: wa },
    config.telefono && { label: 'Teléfono', value: config.telefono, href: `tel:${config.telefono.replace(/\s/g, '')}` },
    config.email && { label: 'Correo', value: config.email, href: `mailto:${config.email}` },
    (config.direccion || config.ciudad) && { label: 'Tienda', value: [config.direccion, config.ciudad].filter(Boolean).join(', '), href: null },
    config.horario && { label: 'Horario', value: config.horario, href: null },
    config.instagram && {
      label: 'Instagram',
      value: config.instagram,
      href: /^https?:/.test(config.instagram) ? config.instagram : `https://instagram.com/${config.instagram.replace(/^@/, '')}`,
    },
  ].filter(Boolean) as { label: string; value: string; href: string | null }[]

  const pagos =
    [
      config.pagoContraentrega && 'contra entrega',
      config.pagoTransferencia && 'transferencia o Nequi',
      config.pagoWhatsapp && 'acordando por WhatsApp',
    ]
      .filter(Boolean)
      .join(', ') || 'escribiéndonos para acordar el pago'

  return (
    <div className="wrap pb-10 pt-12 lg:pt-20">
      <header className="mx-auto max-w-3xl text-center">
        <p className="eyebrow mb-4 text-stone-500">Atención al cliente</p>
        <h1 className="font-display text-6xl font-light leading-none sm:text-8xl">Hablemos</h1>
        <p className="mx-auto mt-6 max-w-lg text-[15px] text-stone-500">
          ¿Dudas sobre tallas, envíos o un pedido? Escríbenos y te respondemos lo antes posible.
        </p>
        {wa && (
          <a href={wa} target="_blank" rel="noreferrer" className="cta mt-10">
            <WhatsappIcon width={18} height={18} /> Escríbenos por WhatsApp
          </a>
        )}
      </header>

      {datos.length > 0 && (
        <div className="mx-auto mt-20 grid max-w-5xl border-t border-black/10 sm:grid-cols-2 lg:grid-cols-3">
          {datos.map((d) => (
            <div key={d.label} className="border-b border-black/10 py-8 sm:px-6">
              <p className="mb-2 text-[11px] uppercase tracking-label text-stone-500">{d.label}</p>
              {d.href ? (
                <a href={d.href} target="_blank" rel="noreferrer" className="link-u text-[17px]">{d.value}</a>
              ) : (
                <p className="text-[17px]">{d.value}</p>
              )}
            </div>
          ))}
        </div>
      )}

      <section id="envios" className="mx-auto mt-24 grid max-w-5xl scroll-mt-40 gap-10 lg:grid-cols-[280px_1fr]">
        <h2 className="font-display text-4xl font-light">Preguntas frecuentes</h2>
        <Accordion
          items={[
            {
              title: '¿Cuánto cuesta el envío?',
              open: true,
              content: (
                <p>
                  El envío a cualquier ciudad de Colombia cuesta {formatPrice(config.costoEnvio)}
                  {config.envioGratisDesde ? ` y es gratis en compras desde ${formatPrice(config.envioGratisDesde)}` : ''}.
                </p>
              ),
            },
            { title: '¿Cuánto tarda mi pedido?', content: <p>Entre 2 y 5 días hábiles según la ciudad. Te compartimos la guía para que sigas tu envío.</p> },
            { title: '¿Cómo puedo pagar?', content: <p>Puedes pagar {pagos}.</p> },
            {
              title: '¿Y si no me queda?',
              content: <p>Puedes solicitar cambio de talla dentro de los 15 días siguientes a la entrega, con la prenda sin uso y con sus etiquetas.</p>,
            },
            { title: '¿Cómo sé el estado de mi pedido?', content: <p>Al comprar recibes un enlace a la página de tu pedido, donde verás cada etapa. También puedes preguntarnos por WhatsApp.</p> },
          ]}
        />
      </section>

      <section id="tallas" className="mx-auto mt-24 grid max-w-5xl scroll-mt-40 gap-10 lg:grid-cols-[280px_1fr]">
        <h2 className="font-display text-4xl font-light">Guía de tallas</h2>
        <SizeTables />
      </section>
    </div>
  )
}

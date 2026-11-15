import Link from 'next/link'
import type { Configuracion } from '@prisma/client'
import {
  FacebookIcon,
  InstagramIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  TiktokIcon,
  WhatsappIcon,
} from '@/components/ui/Icons'
import { normalizeWhatsapp } from '@/lib/utils'

function socialUrl(value: string, base: string) {
  if (/^https?:\/\//.test(value)) return value
  return `${base}${value.replace(/^@/, '')}`
}

export default function Footer({
  config,
  categorias,
}: {
  config: Configuracion
  categorias: { nombre: string; slug: string }[]
}) {
  const wa = normalizeWhatsapp(config.whatsapp)
  return (
    <footer className="mt-24 bg-ink text-sand-200">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3">
          <p className="font-display text-2xl text-white">{config.nombreTienda}</p>
          <p className="text-sm text-sand-300">{config.eslogan}</p>
          <div className="flex gap-3 pt-2">
            {config.instagram && (
              <a href={socialUrl(config.instagram, 'https://instagram.com/')} target="_blank" rel="noreferrer" aria-label="Instagram" className="hover:text-white">
                <InstagramIcon />
              </a>
            )}
            {config.facebook && (
              <a href={socialUrl(config.facebook, 'https://facebook.com/')} target="_blank" rel="noreferrer" aria-label="Facebook" className="hover:text-white">
                <FacebookIcon />
              </a>
            )}
            {config.tiktok && (
              <a href={socialUrl(config.tiktok, 'https://tiktok.com/@')} target="_blank" rel="noreferrer" aria-label="TikTok" className="hover:text-white">
                <TiktokIcon />
              </a>
            )}
            {wa && (
              <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="hover:text-white">
                <WhatsappIcon />
              </a>
            )}
          </div>
        </div>

        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-white">Tienda</p>
          <ul className="space-y-2 text-sm">
            <li><Link href="/productos" className="hover:text-white">Todos los productos</Link></li>
            {categorias.map((c) => (
              <li key={c.slug}><Link href={`/categoria/${c.slug}`} className="hover:text-white">{c.nombre}</Link></li>
            ))}
            <li><Link href="/productos?ofertas=1" className="hover:text-white">Ofertas</Link></li>
          </ul>
        </div>

        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-white">Ayuda</p>
          <ul className="space-y-2 text-sm">
            <li><Link href="/contacto" className="hover:text-white">Contacto</Link></li>
            <li><Link href="/carrito" className="hover:text-white">Mi carrito</Link></li>
            <li><Link href="/contacto#envios" className="hover:text-white">Envíos y cambios</Link></li>
          </ul>
        </div>

        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-white">Contacto</p>
          <ul className="space-y-2.5 text-sm">
            {config.whatsapp && (
              <li className="flex items-center gap-2"><WhatsappIcon width={16} height={16} /> {config.whatsapp}</li>
            )}
            {config.telefono && (
              <li className="flex items-center gap-2"><PhoneIcon width={16} height={16} /> {config.telefono}</li>
            )}
            {config.email && (
              <li className="flex items-center gap-2"><MailIcon width={16} height={16} /> {config.email}</li>
            )}
            {(config.direccion || config.ciudad) && (
              <li className="flex items-start gap-2">
                <MapPinIcon width={16} height={16} className="mt-0.5 shrink-0" />
                {[config.direccion, config.ciudad].filter(Boolean).join(', ')}
              </li>
            )}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-2 py-6 text-xs text-sand-300 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} {config.nombreTienda}. Todos los derechos reservados.</p>
          <Link href="/admin" className="hover:text-white">Administrar tienda</Link>
        </div>
      </div>
    </footer>
  )
}

import Link from 'next/link'
import type { Configuracion } from '@prisma/client'
import { FacebookIcon, InstagramIcon, TiktokIcon, WhatsappIcon } from '@/components/ui/Icons'
import { normalizeWhatsapp } from '@/lib/utils'
import Newsletter from './Newsletter'

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
  const redes = [
    config.instagram && { href: socialUrl(config.instagram, 'https://instagram.com/'), label: 'Instagram', icon: InstagramIcon },
    config.tiktok && { href: socialUrl(config.tiktok, 'https://tiktok.com/@'), label: 'TikTok', icon: TiktokIcon },
    config.facebook && { href: socialUrl(config.facebook, 'https://facebook.com/'), label: 'Facebook', icon: FacebookIcon },
    wa && { href: `https://wa.me/${wa}`, label: 'WhatsApp', icon: WhatsappIcon },
  ].filter(Boolean) as { href: string; label: string; icon: typeof InstagramIcon }[]

  const col = 'mb-5 text-[11px] font-medium uppercase tracking-label text-white/50'
  const link = 'link-u text-[14px] text-white/85 hover:text-white'

  return (
    <footer className="mt-10 bg-ink text-white">
      <div className="wrap grid gap-14 border-b border-white/10 py-16 lg:grid-cols-[1.2fr_1fr] lg:py-24">
        <div>
          <p className="eyebrow mb-5 text-white/50">Boletín</p>
          <h2 className="max-w-lg font-display text-4xl font-light leading-tight sm:text-5xl">
            Novedades, lanzamientos y ofertas antes que nadie.
          </h2>
        </div>
        <div className="flex flex-col justify-end">
          <Newsletter />
          <p className="mt-3 text-[12px] text-white/40">Sin spam. Puedes darte de baja cuando quieras.</p>
        </div>
      </div>

      <div className="wrap grid grid-cols-2 gap-10 py-14 md:grid-cols-4">
        <div>
          <p className={col}>Comprar</p>
          <ul className="space-y-3">
            <li><Link href="/productos" className={link}>Novedades</Link></li>
            {categorias.map((c) => (
              <li key={c.slug}><Link href={`/categoria/${c.slug}`} className={link}>{c.nombre}</Link></li>
            ))}
            <li><Link href="/productos?ofertas=1" className={link}>Ofertas</Link></li>
          </ul>
        </div>
        <div>
          <p className={col}>Ayuda</p>
          <ul className="space-y-3">
            <li><Link href="/contacto" className={link}>Contacto</Link></li>
            <li><Link href="/contacto#envios" className={link}>Envíos y cambios</Link></li>
            <li><Link href="/contacto#tallas" className={link}>Guía de tallas</Link></li>
            <li><Link href="/favoritos" className={link}>Favoritos</Link></li>
          </ul>
        </div>
        <div>
          <p className={col}>Contacto</p>
          <ul className="space-y-3 text-[14px] text-white/85">
            {config.whatsapp && <li>WhatsApp {config.whatsapp}</li>}
            {config.telefono && <li>Tel. {config.telefono}</li>}
            {config.email && <li><a href={`mailto:${config.email}`} className={link}>{config.email}</a></li>}
            {(config.direccion || config.ciudad) && <li>{[config.direccion, config.ciudad].filter(Boolean).join(', ')}</li>}
            {config.horario && <li className="text-white/50">{config.horario}</li>}
          </ul>
        </div>
        <div>
          <p className={col}>Síguenos</p>
          <ul className="space-y-3">
            {redes.map((r) => (
              <li key={r.label}>
                <a href={r.href} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-[14px] text-white/85 hover:text-white">
                  <r.icon width={18} height={18} /> {r.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="wrap overflow-hidden">
        <p
          className="select-none whitespace-nowrap text-center font-medium uppercase leading-[0.8] tracking-[0.08em] text-white/[0.06]"
          style={{ fontSize: `min(17vw, ${(105 / Math.max(config.nombreTienda.length, 1)).toFixed(1)}vw)` }}
          aria-hidden="true"
        >
          {config.nombreTienda}
        </p>
      </div>

      <div className="wrap flex flex-col gap-3 border-t border-white/10 py-6 text-[11px] uppercase tracking-label text-white/40 sm:flex-row sm:justify-between">
        <p>© {new Date().getFullYear()} {config.nombreTienda} · Hecho en Colombia</p>
        <Link href="/admin" className="hover:text-white">Administrar tienda</Link>
      </div>
    </footer>
  )
}

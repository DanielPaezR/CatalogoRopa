'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { useCart } from '@/context/CartContext'
import { useFavorites } from '@/context/FavoritesContext'
import { BagIcon, HeartIcon, MenuIcon, SearchIcon, XIcon } from '@/components/ui/Icons'
import { cn } from '@/lib/utils'
import ProductImage from './ProductImage'
import SearchOverlay from './SearchOverlay'

type Categoria = { nombre: string; slug: string; portada: string | null }

type Props = {
  nombreTienda: string
  anuncios: string[]
  categorias: Categoria[]
}

function AnnouncementBar({ anuncios }: { anuncios: string[] }) {
  const [i, setI] = useState(0)
  useEffect(() => {
    if (anuncios.length < 2) return
    const t = setInterval(() => setI((x) => (x + 1) % anuncios.length), 4500)
    return () => clearInterval(t)
  }, [anuncios.length])
  if (!anuncios.length) return null
  return (
    <div className="relative flex h-9 items-center justify-center overflow-hidden bg-ink px-4 text-white">
      <p key={i} className="animate-slide-down truncate text-[10px] uppercase tracking-[0.12em] sm:text-[11px] sm:tracking-label">
        {anuncios[i]}
      </p>
    </div>
  )
}

export default function Header({ nombreTienda, anuncios, categorias }: Props) {
  const { count, setOpen, ready } = useCart()
  const fav = useFavorites()
  const pathname = usePathname()
  const overlay = pathname === '/'
  const [scrolled, setScrolled] = useState(false)
  const [mega, setMega] = useState(false)
  const [menu, setMenu] = useState(false)
  const [search, setSearch] = useState(false)
  const closeSearch = useCallback(() => setSearch(false), [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMenu(false)
    setMega(false)
    setSearch(false)
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow = menu ? 'hidden' : ''
  }, [menu])

  const solid = !overlay || scrolled || mega
  const nav = [
    { href: '/productos', label: 'Novedades' },
    ...categorias.map((c) => ({ href: `/categoria/${c.slug}`, label: c.nombre })),
  ]

  return (
    <>
      <div className={cn('z-40 w-full', overlay ? 'fixed inset-x-0 top-0' : 'sticky top-0')}>
        <AnnouncementBar anuncios={anuncios} />
        <header
          onMouseLeave={() => setMega(false)}
          className={cn(
            'relative transition-colors duration-500',
            solid ? 'border-b border-black/10 bg-white text-ink' : 'border-b border-transparent bg-transparent text-white'
          )}
        >
          <div className="wrap grid h-16 grid-cols-[1fr_auto_1fr] items-center lg:h-[72px]">
            <div className="flex items-center gap-1">
              <button className="icon-btn -ml-2 lg:hidden" onClick={() => setMenu(true)} aria-label="Abrir menú">
                <MenuIcon width={22} height={22} />
              </button>
              <nav className="hidden items-center gap-7 lg:flex" aria-label="Principal">
                {nav.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onMouseEnter={() => setMega(true)}
                    className={cn('link-u text-[12px] uppercase tracking-label', pathname === l.href && 'after:scale-x-100')}
                  >
                    {l.label}
                  </Link>
                ))}
                <Link href="/productos?ofertas=1" onMouseEnter={() => setMega(false)} className="link-u text-[12px] uppercase tracking-label">
                  Ofertas
                </Link>
              </nav>
            </div>

            <Link href="/" className="whitespace-nowrap text-center text-lg font-medium uppercase tracking-[0.32em] sm:text-xl lg:text-[22px]">
              {nombreTienda}
            </Link>

            <div className="flex items-center justify-end gap-0.5 sm:gap-2">
              <button className="icon-btn" onClick={() => setSearch(true)} aria-label="Buscar">
                <SearchIcon width={20} height={20} />
              </button>
              <Link href="/favoritos" className="icon-btn relative hidden sm:inline-flex" aria-label="Favoritos">
                <HeartIcon width={20} height={20} />
                {fav.ready && fav.items.length > 0 && (
                  <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-current" />
                )}
              </Link>
              <button className="relative flex h-10 items-center gap-2 pl-2 transition-opacity hover:opacity-60" onClick={() => setOpen(true)} aria-label="Ver bolsa">
                <BagIcon width={20} height={20} />
                <span className="hidden text-[12px] uppercase tracking-label lg:inline">Bolsa</span>
                {ready && count > 0 && <span className="text-[12px] tabular-nums">({count})</span>}
              </button>
            </div>
          </div>

          {mega && categorias.length > 0 && (
            <div className="absolute inset-x-0 top-full hidden animate-fade-in border-b border-black/10 bg-white text-ink lg:block">
              <div className="wrap grid grid-cols-[220px_1fr] gap-12 py-10">
                <ul className="space-y-3">
                  <li><Link href="/productos" className="link-u text-[13px] uppercase tracking-label">Ver todo</Link></li>
                  {categorias.map((c) => (
                    <li key={c.slug}>
                      <Link href={`/categoria/${c.slug}`} className="link-u text-[13px] uppercase tracking-label">{c.nombre}</Link>
                    </li>
                  ))}
                  <li><Link href="/productos?ofertas=1" className="link-u text-[13px] uppercase tracking-label text-sale">Ofertas</Link></li>
                </ul>
                <div className="grid grid-cols-4 gap-4">
                  {categorias.slice(0, 4).map((c) => (
                    <Link key={c.slug} href={`/categoria/${c.slug}`} className="group">
                      <div className="aspect-[4/5] overflow-hidden bg-bone">
                        <ProductImage src={c.portada} alt={c.nombre} className="transition duration-700 group-hover:scale-105" />
                      </div>
                      <p className="mt-3 text-[12px] uppercase tracking-label">{c.nombre}</p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </header>
      </div>

      {menu && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 animate-fade-in bg-black/40" onClick={() => setMenu(false)} />
          <div className="absolute inset-y-0 left-0 flex w-full max-w-sm animate-slide-in-left flex-col bg-white">
            <div className="flex h-16 items-center justify-between px-4">
              <span className="text-lg font-medium uppercase tracking-[0.32em]">{nombreTienda}</span>
              <button className="icon-btn -mr-2" onClick={() => setMenu(false)} aria-label="Cerrar menú">
                <XIcon width={22} height={22} />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-6 pt-6">
              <ul className="space-y-5">
                {[...nav, { href: '/productos?ofertas=1', label: 'Ofertas' }].map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className={cn('font-display text-4xl font-light', l.label === 'Ofertas' && 'text-sale')}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
              {categorias.some((c) => c.portada) && (
                <div className="scrollbar-none -mx-6 mt-10 flex gap-3 overflow-x-auto px-6">
                  {categorias.map((c) => (
                    <Link key={c.slug} href={`/categoria/${c.slug}`} className="w-36 shrink-0">
                      <div className="aspect-[3/4] overflow-hidden bg-bone">
                        <ProductImage src={c.portada} alt={c.nombre} />
                      </div>
                      <p className="mt-2 text-[11px] uppercase tracking-label">{c.nombre}</p>
                    </Link>
                  ))}
                </div>
              )}
            </nav>
            <div className="space-y-3 border-t border-black/10 px-6 py-6 text-[12px] uppercase tracking-label">
              <Link href="/favoritos" className="flex items-center gap-3"><HeartIcon width={18} height={18} /> Favoritos</Link>
              <Link href="/contacto" className="block pl-[30px]">Contacto y ayuda</Link>
            </div>
          </div>
        </div>
      )}

      <SearchOverlay open={search} onClose={closeSearch} categorias={categorias} />
    </>
  )
}

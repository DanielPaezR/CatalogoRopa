'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useCart } from '@/context/CartContext'
import { BagIcon, MenuIcon, SearchIcon, XIcon } from '@/components/ui/Icons'
import { cn } from '@/lib/utils'

type Props = {
  nombreTienda: string
  anuncio: string | null
  categorias: { nombre: string; slug: string }[]
}

export default function Header({ nombreTienda, anuncio, categorias }: Props) {
  const { count, setOpen, ready } = useCart()
  const [menu, setMenu] = useState(false)
  const [buscar, setBuscar] = useState(false)
  const [q, setQ] = useState('')
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    setMenu(false)
    setBuscar(false)
  }, [pathname])

  const links = [
    { href: '/productos', label: 'Todo' },
    ...categorias.map((c) => ({ href: `/categoria/${c.slug}`, label: c.nombre })),
    { href: '/productos?ofertas=1', label: 'Ofertas' },
  ]

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const term = q.trim()
    router.push(term ? `/productos?q=${encodeURIComponent(term)}` : '/productos')
  }

  return (
    <header className="sticky top-0 z-40">
      {anuncio && (
        <div className="bg-ink px-4 py-2 text-center text-xs font-medium tracking-wide text-sand-50">{anuncio}</div>
      )}
      <div className="border-b border-sand-200 bg-sand-50/90 backdrop-blur">
        <div className="container-page flex h-16 items-center gap-4">
          <button className="btn-ghost -ml-2 p-2 lg:hidden" onClick={() => setMenu(true)} aria-label="Abrir menú">
            <MenuIcon />
          </button>

          <Link href="/" className="font-display text-xl font-semibold tracking-tight sm:text-2xl">
            {nombreTienda}
          </Link>

          <nav className="ml-8 hidden items-center gap-6 lg:flex" aria-label="Categorías">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  'text-sm text-ink-soft transition hover:text-ink',
                  pathname === l.href.split('?')[0] && l.href !== '/productos?ofertas=1' && 'font-medium text-ink'
                )}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1">
            <button className="btn-ghost p-2" onClick={() => setBuscar((v) => !v)} aria-label="Buscar">
              <SearchIcon />
            </button>
            <button className="btn-ghost relative p-2" onClick={() => setOpen(true)} aria-label="Ver carrito">
              <BagIcon />
              {ready && count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-accent px-1 text-[11px] font-semibold text-white">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>

        {buscar && (
          <form onSubmit={submit} className="container-page animate-fade-in pb-4">
            <div className="relative">
              <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar camisas, jeans, vestidos…"
                className="input rounded-full pl-11"
                aria-label="Buscar productos"
              />
            </div>
          </form>
        )}
      </div>

      {menu && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 animate-fade-in bg-ink/40" onClick={() => setMenu(false)} />
          <div className="absolute inset-y-0 left-0 flex w-80 max-w-[85%] flex-col bg-sand-50 p-6 shadow-xl">
            <div className="mb-8 flex items-center justify-between">
              <span className="font-display text-xl font-semibold">{nombreTienda}</span>
              <button className="btn-ghost -mr-2 p-2" onClick={() => setMenu(false)} aria-label="Cerrar menú">
                <XIcon />
              </button>
            </div>
            <nav className="flex flex-col gap-1">
              {links.map((l) => (
                <Link key={l.href} href={l.href} className="rounded-xl px-3 py-3 text-lg hover:bg-sand-100">
                  {l.label}
                </Link>
              ))}
              <Link href="/contacto" className="rounded-xl px-3 py-3 text-lg hover:bg-sand-100">
                Contacto
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}

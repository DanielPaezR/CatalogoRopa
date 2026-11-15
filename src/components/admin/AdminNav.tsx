'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useState } from 'react'
import {
  BoxIcon,
  ExternalIcon,
  GridIcon,
  LogOutIcon,
  MenuIcon,
  ReceiptIcon,
  SettingsIcon,
  TagIcon,
  XIcon,
} from '@/components/ui/Icons'
import { cn } from '@/lib/utils'

const LINKS = [
  { href: '/admin', label: 'Resumen', icon: GridIcon, exact: true },
  { href: '/admin/pedidos', label: 'Pedidos', icon: ReceiptIcon },
  { href: '/admin/productos', label: 'Productos', icon: BoxIcon },
  { href: '/admin/categorias', label: 'Categorías', icon: TagIcon },
  { href: '/admin/configuracion', label: 'Configuración', icon: SettingsIcon },
]

export default function AdminNav({ tienda, usuario, pendientes }: { tienda: string; usuario: string; pendientes: number }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const nav = (
    <nav className="flex flex-col gap-1">
      {LINKS.map((l) => {
        const active = l.exact ? pathname === l.href : pathname.startsWith(l.href)
        return (
          <Link
            key={l.href}
            href={l.href}
            onClick={() => setOpen(false)}
            className={cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition',
              active ? 'bg-ink text-white' : 'text-ink-soft hover:bg-sand-100 hover:text-ink'
            )}
          >
            <l.icon width={18} height={18} />
            <span className="flex-1">{l.label}</span>
            {l.href === '/admin/pedidos' && pendientes > 0 && (
              <span className={cn('chip', active ? 'bg-white text-ink' : 'bg-accent text-white')}>{pendientes}</span>
            )}
          </Link>
        )
      })}
    </nav>
  )

  const footer = (
    <div className="space-y-1 border-t border-sand-200 pt-4">
      <Link href="/" target="_blank" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ink-soft hover:bg-sand-100">
        <ExternalIcon width={18} height={18} /> Ver tienda
      </Link>
      <button
        onClick={() => signOut({ callbackUrl: '/admin/login' })}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ink-soft hover:bg-sand-100"
      >
        <LogOutIcon width={18} height={18} /> Cerrar sesión
      </button>
      <p className="truncate px-3 pt-2 text-xs text-stone-400">{usuario}</p>
    </div>
  )

  return (
    <>
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col gap-6 border-r border-sand-200 bg-white p-5 lg:flex">
        <Link href="/admin" className="px-3 font-display text-xl font-semibold">{tienda}</Link>
        <div className="flex-1">{nav}</div>
        {footer}
      </aside>

      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-sand-200 bg-white px-4 lg:hidden">
        <button onClick={() => setOpen(true)} className="btn-ghost -ml-2 p-2" aria-label="Abrir menú">
          <MenuIcon />
        </button>
        <span className="font-display text-lg font-semibold">{tienda}</span>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col gap-6 bg-white p-5">
            <div className="flex items-center justify-between px-3">
              <span className="font-display text-xl font-semibold">{tienda}</span>
              <button onClick={() => setOpen(false)} className="btn-ghost -mr-2 p-2" aria-label="Cerrar menú">
                <XIcon />
              </button>
            </div>
            <div className="flex-1">{nav}</div>
            {footer}
          </aside>
        </div>
      )}
    </>
  )
}

'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState, useTransition } from 'react'
import { Grid2Icon, Grid4Icon, SlidersIcon, XIcon } from '@/components/ui/Icons'
import { cn } from '@/lib/utils'
import FilterDrawer, { type FilterState } from './FilterDrawer'
import ProductCard, { type ProductCardData } from './ProductCard'

type Props = {
  productos: ProductCardData[]
  total: number
  page: number
  pages: number
  ordenes: { value: string; label: string }[]
  tallas: string[]
  colores: string[]
}

const DENSITY_KEY = 'catalogo-ropa:densidad'

export default function CatalogShell({ productos, total, page, pages, ordenes, tallas, colores }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [pending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const [dense, setDense] = useState(false)

  useEffect(() => {
    try {
      setDense(localStorage.getItem(DENSITY_KEY) === '1')
    } catch {
      /* ignorar */
    }
  }, [])

  const toggleDense = (v: boolean) => {
    setDense(v)
    try {
      localStorage.setItem(DENSITY_KEY, v ? '1' : '0')
    } catch {
      /* ignorar */
    }
  }

  const current: FilterState = useMemo(
    () => ({
      orden: params.get('orden') ?? 'recientes',
      talla: params.get('talla') ?? '',
      color: params.get('color') ?? '',
      min: params.get('min') ?? '',
      max: params.get('max') ?? '',
      ofertas: params.get('ofertas') === '1',
      disponibles: params.get('disponibles') === '1',
    }),
    [params]
  )

  const push = useCallback(
    (changes: Record<string, string | null>) => {
      const next = new URLSearchParams(params.toString())
      Object.entries(changes).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)))
      next.delete('page')
      const qs = next.toString()
      startTransition(() => router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false }))
    },
    [params, pathname, router]
  )

  const apply = (f: FilterState) => {
    setOpen(false)
    push({
      orden: f.orden === 'recientes' ? null : f.orden,
      talla: f.talla || null,
      color: f.color || null,
      min: f.min || null,
      max: f.max || null,
      ofertas: f.ofertas ? '1' : null,
      disponibles: f.disponibles ? '1' : null,
    })
  }

  const chips = [
    current.talla && { key: 'talla', label: `Talla ${current.talla}` },
    current.color && { key: 'color', label: current.color },
    current.ofertas && { key: 'ofertas', label: 'Ofertas' },
    current.disponibles && { key: 'disponibles', label: 'Disponibles' },
    (current.min || current.max) && {
      key: 'precio',
      label: `$${current.min ? Number(current.min).toLocaleString('es-CO') : '0'} – ${current.max ? `$${Number(current.max).toLocaleString('es-CO')}` : '∞'}`,
    },
    params.get('q') && { key: 'q', label: `“${params.get('q')}”` },
  ].filter(Boolean) as { key: string; label: string }[]

  const nextHref = (() => {
    const sp = new URLSearchParams(params.toString())
    sp.set('page', String(page + 1))
    return `${pathname}?${sp.toString()}`
  })()

  return (
    <>
      <div className="sticky top-[100px] z-20 -mx-4 border-y border-black/10 bg-white/95 px-4 backdrop-blur sm:-mx-6 sm:px-6 lg:top-[108px] lg:-mx-10 lg:px-10">
        <div className="flex h-12 items-center gap-4">
          <button onClick={() => setOpen(true)} className="flex items-center gap-2 whitespace-nowrap text-[12px] uppercase tracking-label hover:opacity-60">
            <SlidersIcon width={18} height={18} />
            Filtrar y ordenar
            {chips.length > 0 && <span className="tabular-nums">({chips.length})</span>}
          </button>
          <p className="ml-auto whitespace-nowrap text-[11px] uppercase tracking-label text-stone-500 sm:text-[12px]">
            {total} {total === 1 ? 'artículo' : 'artículos'}
          </p>
          <div className="hidden items-center gap-1 border-l border-black/10 pl-3 sm:flex">
            <button
              onClick={() => toggleDense(false)}
              className={cn('icon-btn h-8 w-8', !dense ? 'opacity-100' : 'opacity-30')}
              aria-label="Vista amplia"
              aria-pressed={!dense}
            >
              <Grid2Icon width={18} height={18} />
            </button>
            <button
              onClick={() => toggleDense(true)}
              className={cn('icon-btn h-8 w-8', dense ? 'opacity-100' : 'opacity-30')}
              aria-label="Vista compacta"
              aria-pressed={dense}
            >
              <Grid4Icon width={18} height={18} />
            </button>
          </div>
        </div>
      </div>

      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-4">
          {chips.map((c) => (
            <button
              key={c.key}
              onClick={() => push(c.key === 'precio' ? { min: null, max: null } : { [c.key]: null })}
              className="flex items-center gap-1.5 border border-black/15 px-3 py-1.5 text-[12px] hover:border-ink"
            >
              {c.label} <XIcon width={12} height={12} />
            </button>
          ))}
          <button onClick={() => startTransition(() => router.push(pathname, { scroll: false }))} className="link-u-on ml-2 text-[12px]">
            Borrar todo
          </button>
        </div>
      )}

      <div className={cn('pt-6 transition-opacity duration-300', pending && 'opacity-40')}>
        {productos.length === 0 ? (
          <div className="flex flex-col items-center py-28 text-center">
            <p className="font-display text-4xl font-light">Sin resultados</p>
            <p className="mt-3 max-w-sm text-[14px] text-stone-500">No hay prendas que coincidan con estos filtros. Prueba quitando alguno.</p>
            <Link href={pathname} className="cta-outline mt-8">Ver todo</Link>
          </div>
        ) : (
          <div
            className={cn(
              'grid gap-x-2 gap-y-10 sm:gap-x-3',
              dense ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' : 'grid-cols-2 lg:grid-cols-3'
            )}
          >
            {productos.map((p, i) => (
              <ProductCard key={p.id} producto={p} eager={i < 4} sizes={dense ? 'normal' : 'large'} />
            ))}
          </div>
        )}
      </div>

      {total > 0 && (
        <div className="mx-auto mt-20 flex max-w-xs flex-col items-center gap-4 text-center">
          <p className="text-[12px] uppercase tracking-label text-stone-500">
            Has visto {productos.length} de {total}
          </p>
          <div className="h-px w-full bg-black/10">
            <div className="h-px bg-ink transition-all" style={{ width: `${(productos.length / total) * 100}%` }} />
          </div>
          {page < pages && (
            <Link href={nextHref} scroll={false} className="cta-outline mt-2 w-full">
              Ver más
            </Link>
          )}
        </div>
      )}

      <FilterDrawer
        open={open}
        onClose={() => setOpen(false)}
        initial={current}
        onApply={apply}
        ordenes={ordenes}
        tallas={tallas}
        colores={colores}
      />
    </>
  )
}

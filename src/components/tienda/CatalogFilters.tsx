'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'
import { cn } from '@/lib/utils'
import { XIcon } from '@/components/ui/Icons'

type Props = {
  ordenes: { value: string; label: string }[]
  tallas: string[]
}

export default function CatalogFilters({ ordenes, tallas }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [pending, startTransition] = useTransition()
  const [min, setMin] = useState(params.get('min') ?? '')
  const [max, setMax] = useState(params.get('max') ?? '')

  useEffect(() => {
    setMin(params.get('min') ?? '')
    setMax(params.get('max') ?? '')
  }, [params])

  const setParams = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(params.toString())
    Object.entries(changes).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)))
    next.delete('page')
    const qs = next.toString()
    startTransition(() => router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false }))
  }

  const talla = params.get('talla')
  const ofertas = params.get('ofertas') === '1'
  const disponibles = params.get('disponibles') === '1'
  const hayFiltros = Boolean(talla || ofertas || disponibles || params.get('min') || params.get('max') || params.get('q'))

  return (
    <div className={cn('space-y-4 transition-opacity', pending && 'opacity-60')}>
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setParams({ ofertas: ofertas ? null : '1' })}
          className={cn('btn border px-4 py-1.5', ofertas ? 'border-ink bg-ink text-white' : 'border-sand-300 bg-white')}
        >
          En oferta
        </button>
        <button
          onClick={() => setParams({ disponibles: disponibles ? null : '1' })}
          className={cn('btn border px-4 py-1.5', disponibles ? 'border-ink bg-ink text-white' : 'border-sand-300 bg-white')}
        >
          Disponibles
        </button>

        <form
          className="flex items-center gap-1.5"
          onSubmit={(e) => {
            e.preventDefault()
            setParams({ min: min || null, max: max || null })
          }}
        >
          <input
            value={min}
            onChange={(e) => setMin(e.target.value.replace(/\D/g, ''))}
            inputMode="numeric"
            placeholder="Precio mín."
            className="input w-28 rounded-full py-1.5"
            aria-label="Precio mínimo"
          />
          <span className="text-stone-400">–</span>
          <input
            value={max}
            onChange={(e) => setMax(e.target.value.replace(/\D/g, ''))}
            inputMode="numeric"
            placeholder="Precio máx."
            className="input w-28 rounded-full py-1.5"
            aria-label="Precio máximo"
          />
          <button className="btn-outline px-4 py-1.5" type="submit">
            Aplicar
          </button>
        </form>

        <div className="ml-auto">
          <select
            value={params.get('orden') ?? 'recientes'}
            onChange={(e) => setParams({ orden: e.target.value === 'recientes' ? null : e.target.value })}
            className="input w-auto rounded-full py-1.5 pr-8"
            aria-label="Ordenar por"
          >
            {ordenes.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {tallas.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs font-medium uppercase tracking-widest text-stone-500">Talla</span>
          {tallas.map((t) => (
            <button
              key={t}
              onClick={() => setParams({ talla: talla === t ? null : t })}
              className={cn(
                'min-w-[40px] rounded-full border px-3 py-1 text-sm transition',
                talla === t ? 'border-ink bg-ink text-white' : 'border-sand-300 bg-white hover:border-ink'
              )}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {hayFiltros && (
        <button
          onClick={() => startTransition(() => router.push(pathname, { scroll: false }))}
          className="inline-flex items-center gap-1 text-sm text-stone-500 underline-offset-4 hover:text-ink hover:underline"
        >
          <XIcon width={14} height={14} /> Limpiar filtros
        </button>
      )}
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { colorHex } from '@/lib/colores'
import { cn } from '@/lib/utils'
import { XIcon } from '@/components/ui/Icons'

export type FilterState = {
  orden: string
  talla: string
  color: string
  min: string
  max: string
  ofertas: boolean
  disponibles: boolean
}

export default function FilterDrawer({
  open,
  onClose,
  initial,
  onApply,
  ordenes,
  tallas,
  colores,
}: {
  open: boolean
  onClose: () => void
  initial: FilterState
  onApply: (f: FilterState) => void
  ordenes: { value: string; label: string }[]
  tallas: string[]
  colores: string[]
}) {
  const [f, setF] = useState(initial)

  useEffect(() => {
    if (open) setF(initial)
  }, [open, initial])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section className="border-b border-black/10 py-6">
      <h3 className="mb-4 font-sans text-[11px] font-medium uppercase tracking-label">{title}</h3>
      {children}
    </section>
  )

  return (
    <div className="fixed inset-0 z-[55]" role="dialog" aria-modal="true" aria-label="Filtros">
      <div className="absolute inset-0 animate-fade-in bg-black/40" onClick={onClose} />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-md animate-slide-in flex-col bg-white">
        <div className="flex h-16 items-center justify-between border-b border-black/10 px-6">
          <p className="text-[12px] uppercase tracking-label">Filtrar y ordenar</p>
          <button onClick={onClose} className="icon-btn -mr-2" aria-label="Cerrar filtros">
            <XIcon width={20} height={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6">
          <Section title="Ordenar por">
            <div className="space-y-3">
              {ordenes.map((o) => (
                <label key={o.value} className="flex cursor-pointer items-center gap-3 text-[14px]">
                  <span
                    className={cn(
                      'flex h-4 w-4 items-center justify-center rounded-full border',
                      f.orden === o.value ? 'border-ink' : 'border-black/25'
                    )}
                  >
                    {f.orden === o.value && <span className="h-2 w-2 rounded-full bg-ink" />}
                  </span>
                  <input type="radio" className="sr-only" checked={f.orden === o.value} onChange={() => setF({ ...f, orden: o.value })} />
                  {o.label}
                </label>
              ))}
            </div>
          </Section>

          {tallas.length > 0 && (
            <Section title="Talla">
              <div className="grid grid-cols-5 gap-2">
                {tallas.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setF({ ...f, talla: f.talla === t ? '' : t })}
                    className={cn(
                      'h-11 border text-[13px] transition',
                      f.talla === t ? 'border-ink bg-ink text-white' : 'border-black/15 hover:border-ink'
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </Section>
          )}

          {colores.length > 0 && (
            <Section title="Color">
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                {colores.map((c) => {
                  const hex = colorHex(c)
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setF({ ...f, color: f.color === c ? '' : c })}
                      className="flex items-center gap-3 text-left text-[14px]"
                    >
                      <span
                        className={cn(
                          'h-6 w-6 rounded-full border border-black/15 ring-offset-2 transition',
                          f.color === c && 'ring-1 ring-ink'
                        )}
                        style={{ background: hex ?? 'linear-gradient(135deg,#eee,#ccc)' }}
                      />
                      <span className={cn(f.color === c && 'underline underline-offset-4')}>{c}</span>
                    </button>
                  )
                })}
              </div>
            </Section>
          )}

          <Section title="Precio">
            <div className="flex items-center gap-3">
              <input
                value={f.min}
                onChange={(e) => setF({ ...f, min: e.target.value.replace(/\D/g, '') })}
                inputMode="numeric"
                placeholder="Mínimo"
                className="field"
                aria-label="Precio mínimo"
              />
              <span className="text-stone-400">—</span>
              <input
                value={f.max}
                onChange={(e) => setF({ ...f, max: e.target.value.replace(/\D/g, '') })}
                inputMode="numeric"
                placeholder="Máximo"
                className="field"
                aria-label="Precio máximo"
              />
            </div>
          </Section>

          <Section title="Mostrar">
            <div className="space-y-4">
              {(
                [
                  ['ofertas', 'Solo ofertas'],
                  ['disponibles', 'Solo disponibles'],
                ] as const
              ).map(([k, label]) => (
                <label key={k} className="flex cursor-pointer items-center justify-between text-[14px]">
                  {label}
                  <span className={cn('relative h-5 w-9 rounded-full transition', f[k] ? 'bg-ink' : 'bg-black/15')}>
                    <span className={cn('absolute top-0.5 h-4 w-4 rounded-full bg-white transition', f[k] ? 'left-[18px]' : 'left-0.5')} />
                  </span>
                  <input type="checkbox" className="sr-only" checked={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.checked })} />
                </label>
              ))}
            </div>
          </Section>
        </div>

        <div className="grid grid-cols-2 gap-3 border-t border-black/10 p-6">
          <button
            type="button"
            onClick={() => setF({ orden: 'recientes', talla: '', color: '', min: '', max: '', ofertas: false, disponibles: false })}
            className="cta-outline px-4"
          >
            Borrar
          </button>
          <button type="button" onClick={() => onApply(f)} className="cta px-4">
            Aplicar
          </button>
        </div>
      </aside>
    </div>
  )
}

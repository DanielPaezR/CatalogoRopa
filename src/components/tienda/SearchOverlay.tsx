'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { ArrowRightIcon, XIcon } from '@/components/ui/Icons'
import { formatPrice } from '@/lib/utils'
import ProductImage from './ProductImage'

type Resultado = { id: string; slug: string; nombre: string; precio: number; precioAnterior: number | null; imagenes: string[] }

export default function SearchOverlay({
  open,
  onClose,
  categorias,
}: {
  open: boolean
  onClose: () => void
  categorias: { nombre: string; slug: string }[]
}) {
  const router = useRouter()
  const input = useRef<HTMLInputElement>(null)
  const [q, setQ] = useState('')
  const [res, setRes] = useState<{ productos: Resultado[]; total: number } | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    setTimeout(() => input.current?.focus(), 50)
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  useEffect(() => {
    const term = q.trim()
    if (term.length < 2) {
      setRes(null)
      return
    }
    setLoading(true)
    const ctrl = new AbortController()
    const t = setTimeout(() => {
      fetch(`/api/buscar?q=${encodeURIComponent(term)}`, { signal: ctrl.signal })
        .then((r) => r.json())
        .then((d) => setRes(d))
        .catch(() => {})
        .finally(() => setLoading(false))
    }, 220)
    return () => {
      clearTimeout(t)
      ctrl.abort()
    }
  }, [q])

  if (!open) return null

  const verTodo = () => {
    const term = q.trim()
    onClose()
    router.push(term ? `/productos?q=${encodeURIComponent(term)}` : '/productos')
  }

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-white animate-fade-in" role="dialog" aria-modal="true" aria-label="Buscar">
      <div className="wrap flex h-20 items-center justify-end">
        <button onClick={onClose} className="icon-btn -mr-2" aria-label="Cerrar búsqueda">
          <XIcon width={22} height={22} />
        </button>
      </div>
      <div className="wrap flex-1 overflow-y-auto pb-16">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            verTodo()
          }}
          className="mx-auto max-w-4xl border-b border-ink pb-3"
        >
          <input
            ref={input}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="¿Qué estás buscando?"
            className="w-full bg-transparent font-display text-4xl font-light text-ink outline-none placeholder:text-stone-300 sm:text-6xl"
            aria-label="Buscar productos"
          />
        </form>

        <div className="mx-auto mt-10 max-w-4xl">
          {!res && (
            <div>
              <p className="eyebrow mb-5 text-stone-500">Explora</p>
              <div className="flex flex-wrap gap-x-8 gap-y-3">
                <Link href="/productos" onClick={onClose} className="link-u text-lg">Novedades</Link>
                {categorias.map((c) => (
                  <Link key={c.slug} href={`/categoria/${c.slug}`} onClick={onClose} className="link-u text-lg">
                    {c.nombre}
                  </Link>
                ))}
                <Link href="/productos?ofertas=1" onClick={onClose} className="link-u text-lg text-sale">Ofertas</Link>
              </div>
            </div>
          )}

          {res && (
            <>
              <div className="mb-6 flex items-center justify-between">
                <p className="eyebrow text-stone-500">
                  {loading ? 'Buscando…' : res.total === 0 ? 'Sin resultados' : `${res.total} ${res.total === 1 ? 'resultado' : 'resultados'}`}
                </p>
                {res.total > 0 && (
                  <button onClick={verTodo} className="eyebrow link-u-on flex items-center gap-2">
                    Ver todos <ArrowRightIcon width={14} height={14} />
                  </button>
                )}
              </div>
              {res.total === 0 && !loading && (
                <p className="text-stone-500">No encontramos “{q}”. Prueba con otra palabra, como “camisa” o “negro”.</p>
              )}
              <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-4">
                {res.productos.map((p) => (
                  <Link key={p.id} href={`/productos/${p.slug}`} onClick={onClose} className="group">
                    <div className="aspect-[2/3] overflow-hidden bg-bone">
                      <ProductImage src={p.imagenes[0]} alt={p.nombre} className="transition duration-700 group-hover:scale-105" />
                    </div>
                    <p className="mt-3 text-[13px] uppercase tracking-wide">{p.nombre}</p>
                    <p className="mt-1 text-[13px]">{formatPrice(p.precio)}</p>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

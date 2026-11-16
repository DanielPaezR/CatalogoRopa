'use client'

import { useEffect, useRef, useState } from 'react'
import { XIcon } from '@/components/ui/Icons'
import { cn } from '@/lib/utils'
import ProductImage from './ProductImage'

export default function ProductGallery({ imagenes, nombre }: { imagenes: string[]; nombre: string }) {
  const [active, setActive] = useState(0)
  const [zoom, setZoom] = useState<number | null>(null)
  const track = useRef<HTMLDivElement>(null)
  const zoomRefs = useRef<(HTMLImageElement | null)[]>([])

  useEffect(() => {
    if (zoom === null) return
    document.body.style.overflow = 'hidden'
    zoomRefs.current[zoom]?.scrollIntoView({ block: 'start' })
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setZoom(null)
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', onKey)
    }
  }, [zoom])

  if (imagenes.length === 0) {
    return (
      <div className="aspect-[2/3] bg-bone">
        <ProductImage src={null} alt={nombre} />
      </div>
    )
  }

  return (
    <>
      {/* Móvil: carrusel deslizable */}
      <div className="relative -mx-4 sm:-mx-6 lg:hidden">
        <div
          ref={track}
          onScroll={(e) => {
            const el = e.currentTarget
            setActive(Math.round(el.scrollLeft / el.clientWidth))
          }}
          className="scrollbar-none flex snap-x snap-mandatory overflow-x-auto"
        >
          {imagenes.map((src, i) => (
            <button key={src + i} onClick={() => setZoom(i)} className="aspect-[2/3] w-full shrink-0 snap-center bg-bone">
              <img src={src} alt={`${nombre} — imagen ${i + 1}`} loading={i === 0 ? 'eager' : 'lazy'} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
        {imagenes.length > 1 && (
          <div className="absolute inset-x-0 bottom-4 flex justify-center gap-1.5">
            {imagenes.map((_, i) => (
              <span key={i} className={cn('h-px w-6 transition-colors', i === active ? 'bg-ink' : 'bg-ink/25')} />
            ))}
          </div>
        )}
      </div>

      {/* Escritorio: imágenes en cuadrícula editorial */}
      <div className={cn('hidden gap-2 lg:grid', imagenes.length > 1 ? 'grid-cols-2' : 'grid-cols-1')}>
        {imagenes.map((src, i) => (
          <button
            key={src + i}
            onClick={() => setZoom(i)}
            className={cn(
              'group relative aspect-[2/3] cursor-zoom-in overflow-hidden bg-bone',
              imagenes.length > 2 && imagenes.length % 2 === 1 && i === 0 && 'col-span-2 aspect-[4/3]'
            )}
            aria-label={`Ampliar imagen ${i + 1}`}
          >
            <img
              src={src}
              alt={`${nombre} — imagen ${i + 1}`}
              loading={i < 2 ? 'eager' : 'lazy'}
              className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.02]"
            />
          </button>
        ))}
      </div>

      {zoom !== null && (
        <div className="fixed inset-0 z-[70] overflow-y-auto bg-white animate-fade-in" role="dialog" aria-modal="true" aria-label="Imágenes ampliadas">
          <button onClick={() => setZoom(null)} className="fixed right-4 top-4 z-10 icon-btn bg-white/80" aria-label="Cerrar">
            <XIcon width={24} height={24} />
          </button>
          <div className="mx-auto max-w-4xl">
            {imagenes.map((src, i) => (
              <img
                key={src + i}
                ref={(el) => {
                  zoomRefs.current[i] = el
                }}
                src={src}
                alt={`${nombre} — imagen ${i + 1}`}
                className="w-full cursor-zoom-out"
                onClick={() => setZoom(null)}
              />
            ))}
          </div>
        </div>
      )}
    </>
  )
}

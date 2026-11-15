'use client'

import { useState } from 'react'
import ProductImage from './ProductImage'
import { cn } from '@/lib/utils'

export default function ProductGallery({ imagenes, nombre }: { imagenes: string[]; nombre: string }) {
  const [active, setActive] = useState(0)

  if (imagenes.length === 0) {
    return (
      <div className="aspect-[3/4] overflow-hidden rounded-3xl bg-sand-100">
        <ProductImage src={null} alt={nombre} />
      </div>
    )
  }

  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row">
      {imagenes.length > 1 && (
        <div className="scrollbar-none flex gap-3 overflow-x-auto sm:w-20 sm:flex-col sm:overflow-visible">
          {imagenes.map((src, i) => (
            <button
              key={src + i}
              onClick={() => setActive(i)}
              className={cn(
                'aspect-[3/4] w-16 shrink-0 overflow-hidden rounded-xl border-2 transition sm:w-full',
                i === active ? 'border-ink' : 'border-transparent opacity-70 hover:opacity-100'
              )}
              aria-label={`Ver imagen ${i + 1}`}
            >
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
      <div
        className="relative aspect-[3/4] flex-1 overflow-hidden rounded-3xl bg-sand-100"
        onTouchStart={(e) => ((e.currentTarget as HTMLElement).dataset.x = String(e.touches[0].clientX))}
        onTouchEnd={(e) => {
          const start = Number((e.currentTarget as HTMLElement).dataset.x)
          const dx = e.changedTouches[0].clientX - start
          if (Math.abs(dx) > 40) {
            setActive((a) => (dx < 0 ? Math.min(imagenes.length - 1, a + 1) : Math.max(0, a - 1)))
          }
        }}
      >
        <img src={imagenes[active]} alt={nombre} className="h-full w-full object-cover" />
        {imagenes.length > 1 && (
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5 sm:hidden">
            {imagenes.map((_, i) => (
              <span key={i} className={cn('h-1.5 w-1.5 rounded-full', i === active ? 'bg-white' : 'bg-white/50')} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

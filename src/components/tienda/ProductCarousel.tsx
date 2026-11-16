'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { ArrowLeftIcon, ArrowRightIcon } from '@/components/ui/Icons'
import ProductCard, { type ProductCardData } from './ProductCard'

export default function ProductCarousel({
  title,
  eyebrow,
  href,
  cta = 'Ver todo',
  productos,
}: {
  title: string
  eyebrow?: string
  href?: string
  cta?: string
  productos: ProductCardData[]
}) {
  const track = useRef<HTMLDivElement>(null)
  const [edges, setEdges] = useState({ start: true, end: false })

  const update = () => {
    const el = track.current
    if (!el) return
    setEdges({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8 })
  }

  useEffect(() => {
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const scroll = (dir: 1 | -1) => {
    const el = track.current
    if (!el) return
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: 'smooth' })
  }

  if (productos.length === 0) return null

  return (
    <section className="py-16 lg:py-24">
      <div className="wrap mb-8 flex items-end justify-between gap-6">
        <div>
          {eyebrow && <p className="eyebrow mb-3 text-stone-500">{eyebrow}</p>}
          <h2 className="font-display text-4xl font-light leading-none sm:text-5xl">{title}</h2>
        </div>
        <div className="flex items-center gap-6">
          {href && (
            <Link href={href} className="link-u-on hidden text-[12px] uppercase tracking-label sm:inline-block">
              {cta}
            </Link>
          )}
          <div className="hidden gap-1 md:flex">
            <button onClick={() => scroll(-1)} disabled={edges.start} className="icon-btn border border-black/15 disabled:opacity-25" aria-label="Anterior">
              <ArrowLeftIcon width={18} height={18} />
            </button>
            <button onClick={() => scroll(1)} disabled={edges.end} className="icon-btn border border-black/15 disabled:opacity-25" aria-label="Siguiente">
              <ArrowRightIcon width={18} height={18} />
            </button>
          </div>
        </div>
      </div>
      <div
        ref={track}
        onScroll={update}
        className="scrollbar-none flex snap-x snap-mandatory scroll-pl-4 gap-2 overflow-x-auto scroll-smooth px-4 sm:scroll-pl-6 sm:gap-3 sm:px-6 lg:scroll-pl-10 lg:px-10"
      >
        {productos.map((p) => (
          <div key={p.id} className="w-[72%] shrink-0 snap-start sm:w-[40%] md:w-[31%] lg:w-[23.5%] xl:w-[19%]">
            <ProductCard producto={p} />
          </div>
        ))}
        {href && (
          <Link
            href={href}
            className="flex w-[72%] shrink-0 snap-start flex-col items-center justify-center gap-3 bg-bone text-center sm:w-[40%] md:w-[31%] lg:w-[23.5%] xl:w-[19%]"
            style={{ aspectRatio: '2 / 3' }}
          >
            <span className="font-display text-3xl font-light">{cta}</span>
            <ArrowRightIcon />
          </Link>
        )}
      </div>
      {href && (
        <div className="wrap mt-8 sm:hidden">
          <Link href={href} className="cta-outline w-full">{cta}</Link>
        </div>
      )}
    </section>
  )
}

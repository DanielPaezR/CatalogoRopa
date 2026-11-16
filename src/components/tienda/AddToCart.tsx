'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { useCart } from '@/context/CartContext'
import { colorHex } from '@/lib/colores'
import { STOCK_BAJO } from '@/lib/constants'
import { cn, discountPercent, formatPrice, whatsappLink } from '@/lib/utils'
import { RulerIcon, WhatsappIcon } from '@/components/ui/Icons'
import FavoriteButton from './FavoriteButton'
import SizeGuide from './SizeGuide'

type Variante = { id: string; talla: string; color: string; stock: number }

type Props = {
  producto: {
    id: string
    slug: string
    nombre: string
    precio: number
    precioAnterior: number | null
    imagenes: string[]
    stock: number
    tallas: string[]
    colores: string[]
    variantes: Variante[]
  }
  whatsapp: string | null
  url: string
}

export default function AddToCart({ producto, whatsapp, url }: Props) {
  const { add, setOpen } = useCart()
  const tieneVariantes = producto.variantes.length > 0
  const { tallas, colores } = producto

  const [talla, setTalla] = useState<string | null>(tallas.length === 1 ? tallas[0] : null)
  const [color, setColor] = useState<string | null>(colores.length >= 1 ? colores[0] : null)
  const [guia, setGuia] = useState(false)
  const [aviso, setAviso] = useState(false)
  const [barra, setBarra] = useState(false)
  const boton = useRef<HTMLButtonElement>(null)

  // Barra de compra fija en móvil cuando el botón principal sale de pantalla
  useEffect(() => {
    const check = () => {
      const el = boton.current
      if (el) setBarra(el.getBoundingClientRect().bottom < 0)
    }
    check()
    window.addEventListener('scroll', check, { passive: true })
    return () => window.removeEventListener('scroll', check)
  }, [])

  const stockDe = (t: string | null, c: string | null) =>
    producto.variantes
      .filter((v) => (t === null || v.talla === t) && (c === null || v.color === c))
      .reduce((s, v) => s + v.stock, 0)

  const variante = useMemo(() => {
    if (!tieneVariantes) return null
    const needT = tallas.length > 0
    const needC = colores.length > 0
    if ((needT && !talla) || (needC && !color)) return null
    return producto.variantes.find((v) => v.talla === (needT ? talla : '') && v.color === (needC ? color : '')) ?? null
  }, [tieneVariantes, tallas.length, colores.length, talla, color, producto.variantes])

  const stockActual = tieneVariantes ? variante?.stock ?? 0 : producto.stock
  const faltaTalla = tieneVariantes && tallas.length > 0 && !talla
  const agotado = producto.stock <= 0
  const descuento = discountPercent(producto.precio, producto.precioAnterior)

  const handleAdd = () => {
    if (faltaTalla) {
      setAviso(true)
      document.getElementById('selector-talla')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    if (tieneVariantes && !variante) return
    const r = add({
      productoId: producto.id,
      varianteId: variante?.id ?? null,
      slug: producto.slug,
      nombre: producto.nombre,
      precio: producto.precio,
      imagen: producto.imagenes[0] ?? null,
      talla: variante?.talla || null,
      color: variante?.color || null,
      cantidad: 1,
      stock: stockActual,
    })
    if (!r.ok) {
      toast.error(r.message ?? 'No se pudo añadir')
      return
    }
    setOpen(true)
  }

  const mensaje = `¡Hola! Me interesa: ${producto.nombre}${talla ? `, talla ${talla}` : ''}${color ? `, color ${color}` : ''}. ${url}`
  const wa = whatsappLink(whatsapp, mensaje)
  const sinStockCombinacion = !agotado && !faltaTalla && stockActual <= 0
  const label = agotado ? 'Agotado' : sinStockCombinacion ? 'No disponible' : faltaTalla ? 'Selecciona una talla' : 'Añadir a la bolsa'

  return (
    <div>
      {colores.length > 0 && (
        <fieldset className="mb-7">
          <legend className="mb-3 text-[12px] uppercase tracking-label">
            Color <span className="text-stone-500">— {color}</span>
          </legend>
          <div className="flex flex-wrap gap-2.5">
            {colores.map((c) => {
              const hex = colorHex(c)
              const disponible = stockDe(null, c) > 0
              return hex ? (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  title={c}
                  aria-label={c}
                  aria-pressed={color === c}
                  className={cn(
                    'relative h-8 w-8 rounded-full border border-black/15 ring-offset-[3px] transition',
                    color === c ? 'ring-1 ring-ink' : 'hover:ring-1 hover:ring-black/30',
                    !disponible && 'opacity-35'
                  )}
                  style={{ background: hex }}
                />
              ) : (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  aria-pressed={color === c}
                  className={cn(
                    'h-9 border px-4 text-[13px] transition',
                    color === c ? 'border-ink' : 'border-black/15 hover:border-ink',
                    !disponible && 'text-stone-400'
                  )}
                >
                  {c}
                </button>
              )
            })}
          </div>
        </fieldset>
      )}

      {tallas.length > 0 && (
        <fieldset id="selector-talla" className="mb-7">
          <div className="mb-3 flex items-center justify-between">
            <legend className={cn('text-[12px] uppercase tracking-label', aviso && faltaTalla && 'text-sale')}>
              {aviso && faltaTalla ? 'Elige tu talla' : 'Talla'}
            </legend>
            <button type="button" onClick={() => setGuia(true)} className="link-u-on flex items-center gap-1.5 text-[12px]">
              <RulerIcon width={14} height={14} /> Guía de tallas
            </button>
          </div>
          <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-5">
            {tallas.map((t) => {
              const disponible = stockDe(t, colores.length ? color : null) > 0
              return (
                <button
                  key={t}
                  type="button"
                  disabled={!disponible}
                  onClick={() => {
                    setTalla(t)
                    setAviso(false)
                  }}
                  aria-pressed={talla === t}
                  className={cn(
                    'relative h-12 border text-[13px] transition',
                    talla === t ? 'border-ink bg-ink text-white' : 'border-black/15 hover:border-ink',
                    !disponible && 'cursor-not-allowed text-stone-300 hover:border-black/15',
                    aviso && faltaTalla && 'border-sale/40'
                  )}
                >
                  {t}
                  {!disponible && (
                    <span className="pointer-events-none absolute inset-0 overflow-hidden">
                      <span className="absolute left-1/2 top-1/2 h-px w-[140%] -translate-x-1/2 -translate-y-1/2 -rotate-[33deg] bg-black/15" />
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </fieldset>
      )}

      <div className="mb-4 h-5 text-[13px]">
        {!agotado && !faltaTalla && stockActual > 0 && stockActual <= STOCK_BAJO && (
          <span className="text-sale">Últimas {stockActual} unidades</span>
        )}
        {sinStockCombinacion && <span className="text-stone-500">Agotado en esta combinación — prueba otra talla o color</span>}
      </div>

      <div className="flex gap-2">
        <button ref={boton} onClick={handleAdd} disabled={agotado || sinStockCombinacion} className="cta h-14 flex-1">
          {label}
        </button>
        <FavoriteButton
          item={{ id: producto.id, slug: producto.slug, nombre: producto.nombre, precio: producto.precio, precioAnterior: producto.precioAnterior, imagenes: producto.imagenes }}
          className="h-14 w-14 border border-black/15 hover:border-ink"
          size={20}
        />
      </div>

      {wa && (
        <a href={wa} target="_blank" rel="noreferrer" className="mt-4 flex items-center justify-center gap-2 py-2 text-[12px] uppercase tracking-label hover:opacity-60">
          <WhatsappIcon width={16} height={16} /> ¿Dudas? Te asesoramos por WhatsApp
        </a>
      )}

      {/* Barra fija en móvil */}
      <div
        className={cn(
          'fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-black/10 bg-white px-4 py-3 transition-transform duration-300 lg:hidden',
          barra ? 'translate-y-0' : 'translate-y-full'
        )}
      >
        <div className="min-w-0 flex-1">
          <p className="truncate text-[12px] uppercase tracking-wide">{producto.nombre}</p>
          <p className="text-[13px]">
            <span className={cn(descuento > 0 && 'text-sale')}>{formatPrice(producto.precio)}</span>
            {talla && <span className="text-stone-500"> · Talla {talla}</span>}
          </p>
        </div>
        <button onClick={handleAdd} disabled={agotado || sinStockCombinacion} className="cta h-11 px-5">
          {agotado ? 'Agotado' : 'Añadir'}
        </button>
      </div>

      <SizeGuide open={guia} onClose={() => setGuia(false)} />
    </div>
  )
}

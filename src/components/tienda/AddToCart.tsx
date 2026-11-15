'use client'

import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useCart } from '@/context/CartContext'
import { colorHex } from '@/lib/colores'
import { STOCK_BAJO } from '@/lib/constants'
import { cn, whatsappLink } from '@/lib/utils'
import { BagIcon, WhatsappIcon } from '@/components/ui/Icons'
import QuantityInput from './QuantityInput'

type Variante = { id: string; talla: string; color: string; stock: number }

type Props = {
  producto: {
    id: string
    slug: string
    nombre: string
    precio: number
    imagen: string | null
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
  const tallas = producto.tallas
  const colores = producto.colores

  const [talla, setTalla] = useState<string | null>(tallas.length === 1 ? tallas[0] : null)
  const [color, setColor] = useState<string | null>(colores.length === 1 ? colores[0] : null)
  const [cantidad, setCantidad] = useState(1)

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
  const faltaSeleccion = tieneVariantes && !variante
  const agotado = producto.stock <= 0

  const handleAdd = () => {
    if (faltaSeleccion) {
      toast.error(tallas.length && !talla ? 'Elige una talla' : 'Elige un color')
      return
    }
    const r = add({
      productoId: producto.id,
      varianteId: variante?.id ?? null,
      slug: producto.slug,
      nombre: producto.nombre,
      precio: producto.precio,
      imagen: producto.imagen,
      talla: variante?.talla || null,
      color: variante?.color || null,
      cantidad,
      stock: stockActual,
    })
    if (!r.ok) {
      toast.error(r.message ?? 'No se pudo agregar')
      return
    }
    setCantidad(1)
    setOpen(true)
  }

  const mensaje = `¡Hola! Me interesa este producto: ${producto.nombre}${talla ? ` (talla ${talla})` : ''}${
    color ? ` color ${color}` : ''
  }. ${url}`
  const wa = whatsappLink(whatsapp, mensaje)

  return (
    <div className="space-y-6">
      {tallas.length > 0 && (
        <fieldset>
          <legend className="mb-3 flex w-full justify-between text-sm">
            <span className="font-medium">Talla{talla ? `: ${talla}` : ''}</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {tallas.map((t) => {
              const disponible = stockDe(t, color) > 0
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setTalla(t)
                    setCantidad(1)
                  }}
                  className={cn(
                    'relative min-w-[48px] rounded-xl border px-3 py-2.5 text-sm font-medium transition',
                    talla === t ? 'border-ink bg-ink text-white' : 'border-sand-300 bg-white hover:border-ink',
                    !disponible && 'text-stone-400 line-through decoration-stone-400'
                  )}
                  aria-pressed={talla === t}
                >
                  {t}
                </button>
              )
            })}
          </div>
        </fieldset>
      )}

      {colores.length > 0 && (
        <fieldset>
          <legend className="mb-3 text-sm font-medium">Color{color ? `: ${color}` : ''}</legend>
          <div className="flex flex-wrap gap-2">
            {colores.map((c) => {
              const hex = colorHex(c)
              const disponible = stockDe(talla, c) > 0
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    setColor(c)
                    setCantidad(1)
                  }}
                  title={c}
                  className={cn(
                    'flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition',
                    color === c ? 'border-ink ring-1 ring-ink' : 'border-sand-300 bg-white hover:border-ink',
                    !disponible && 'opacity-40'
                  )}
                  aria-pressed={color === c}
                >
                  {hex && <span className="h-4 w-4 rounded-full border border-black/10" style={{ background: hex }} />}
                  {c}
                </button>
              )
            })}
          </div>
        </fieldset>
      )}

      <div className="text-sm">
        {agotado ? (
          <span className="font-medium text-red-600">Agotado</span>
        ) : faltaSeleccion ? (
          <span className="text-stone-500">Selecciona {tallas.length && !talla ? 'una talla' : 'un color'} para ver disponibilidad</span>
        ) : stockActual <= 0 ? (
          <span className="font-medium text-red-600">Agotado en esta combinación</span>
        ) : stockActual <= STOCK_BAJO ? (
          <span className="font-medium text-accent">¡Solo quedan {stockActual}!</span>
        ) : (
          <span className="font-medium text-emerald-700">Disponible</span>
        )}
      </div>

      <div className="flex gap-3">
        {!agotado && stockActual > 0 && (
          <QuantityInput value={cantidad} max={stockActual} onChange={setCantidad} />
        )}
        <button
          onClick={handleAdd}
          disabled={agotado || (!faltaSeleccion && stockActual <= 0)}
          className="btn-primary flex-1 py-3"
        >
          <BagIcon width={18} height={18} />
          {agotado ? 'Agotado' : 'Agregar al carrito'}
        </button>
      </div>

      {wa && (
        <a href={wa} target="_blank" rel="noreferrer" className="btn-outline w-full py-3">
          <WhatsappIcon width={18} height={18} className="text-[#25D366]" />
          Preguntar por WhatsApp
        </a>
      )}
    </div>
  )
}

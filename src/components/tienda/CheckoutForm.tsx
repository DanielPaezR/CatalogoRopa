'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { itemKey, useCart } from '@/context/CartContext'
import { calcularEnvio } from '@/lib/config-shared'
import { METODO_LABEL } from '@/lib/constants'
import { cn, formatPrice } from '@/lib/utils'
import ProductImage from './ProductImage'
import { useCartSync } from './useCartSync'

type Props = {
  costoEnvio: number
  envioGratisDesde: number | null
  metodos: string[]
  infoTransferencia: string | null
}

const DESCRIPCION_METODO: Record<string, string> = {
  WHATSAPP: 'Te escribimos por WhatsApp para confirmar tu pedido y acordar el pago.',
  CONTRAENTREGA: 'Pagas en efectivo cuando recibes tu pedido.',
  TRANSFERENCIA: 'Te mostramos los datos para transferir al confirmar el pedido.',
  STRIPE: 'Paga de forma segura con tarjeta de crédito o débito.',
}

const CIUDADES = ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena', 'Bucaramanga', 'Pereira', 'Manizales', 'Cúcuta', 'Ibagué', 'Santa Marta', 'Villavicencio', 'Pasto', 'Armenia', 'Neiva', 'Montería', 'Popayán', 'Tunja', 'Valledupar', 'Sincelejo']

const STORAGE = 'catalogo-ropa:cliente'

export default function CheckoutForm({ costoEnvio, envioGratisDesde, metodos, infoTransferencia }: Props) {
  const router = useRouter()
  const { items, ready, subtotal, clear } = useCart()
  useCartSync()
  const [enviando, setEnviando] = useState(false)
  const [metodo, setMetodo] = useState(metodos[0] ?? 'WHATSAPP')
  const [form, setForm] = useState({ nombre: '', telefono: '', email: '', direccion: '', ciudad: '', notas: '' })

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE)
      if (saved) setForm((f) => ({ ...f, ...JSON.parse(saved), notas: '' }))
    } catch {
      /* ignorar */
    }
  }, [])

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const envio = calcularEnvio(subtotal, { costoEnvio, envioGratisDesde })

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (items.length === 0) return
    setEnviando(true)
    try {
      const { notas, ...cliente } = form
      try {
        localStorage.setItem(STORAGE, JSON.stringify(cliente))
      } catch {
        /* ignorar */
      }
      const res = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente: { ...cliente, notas: notas || undefined },
          metodoPago: metodo,
          items: items.map((i) => ({ productoId: i.productoId, varianteId: i.varianteId, cantidad: i.cantidad })),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? 'No se pudo crear el pedido')
        setEnviando(false)
        return
      }
      clear()
      if (data.url) {
        window.location.href = data.url
        return
      }
      router.push(`/pedido/${data.id}?nuevo=1`)
    } catch {
      toast.error('Error de conexión. Intenta de nuevo.')
      setEnviando(false)
    }
  }

  if (!ready) return <div className="wrap py-32 text-center text-[12px] uppercase tracking-label text-stone-400">Cargando…</div>

  if (items.length === 0 && !enviando) {
    return (
      <div className="wrap flex flex-col items-center py-32 text-center">
        <h1 className="font-display text-5xl font-light">Tu bolsa está vacía</h1>
        <Link href="/productos" className="cta mt-10">
          Comprar novedades
        </Link>
      </div>
    )
  }

  return (
    <div className="wrap pb-10 pt-10 lg:pt-14">
      <h1 className="mb-12 font-display text-5xl font-light sm:text-6xl">Finalizar compra</h1>
      <form onSubmit={submit} className="grid gap-12 lg:grid-cols-[1fr_440px] lg:gap-20">
        <div className="space-y-14">
          <section>
            <h2 className="mb-6 flex items-baseline gap-3 border-b border-black/10 pb-4 font-sans text-[13px] uppercase tracking-label"><span className="font-display text-2xl italic">01</span> Tus datos</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="field-label" htmlFor="nombre">Nombre completo *</label>
                <input id="nombre" required minLength={3} autoComplete="name" className="field" value={form.nombre} onChange={set('nombre')} />
              </div>
              <div>
                <label className="field-label" htmlFor="telefono">Celular / WhatsApp *</label>
                <input id="telefono" required type="tel" autoComplete="tel" inputMode="tel" placeholder="300 123 4567" className="field" value={form.telefono} onChange={set('telefono')} />
              </div>
              <div>
                <label className="field-label" htmlFor="email">Correo (opcional)</label>
                <input id="email" type="email" autoComplete="email" className="field" value={form.email} onChange={set('email')} />
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-6 flex items-baseline gap-3 border-b border-black/10 pb-4 font-sans text-[13px] uppercase tracking-label"><span className="font-display text-2xl italic">02</span> Entrega</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="field-label" htmlFor="direccion">Dirección *</label>
                <input id="direccion" required minLength={5} autoComplete="street-address" placeholder="Calle 10 # 20-30, apto 401, barrio…" className="field" value={form.direccion} onChange={set('direccion')} />
              </div>
              <div>
                <label className="field-label" htmlFor="ciudad">Ciudad / municipio *</label>
                <input id="ciudad" required list="ciudades" autoComplete="address-level2" className="field" value={form.ciudad} onChange={set('ciudad')} />
                <datalist id="ciudades">
                  {CIUDADES.map((c) => <option key={c} value={c} />)}
                </datalist>
              </div>
              <div className="sm:col-span-2">
                <label className="field-label" htmlFor="notas">Notas del pedido (opcional)</label>
                <textarea id="notas" rows={3} maxLength={500} placeholder="Indicaciones para la entrega, horario, etc." className="field h-auto py-3" value={form.notas} onChange={set('notas')} />
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-6 flex items-baseline gap-3 border-b border-black/10 pb-4 font-sans text-[13px] uppercase tracking-label"><span className="font-display text-2xl italic">03</span> Pago</h2>
            {metodos.length === 0 ? (
              <p className="text-sm text-red-600">No hay métodos de pago habilitados. Contáctanos para completar tu compra.</p>
            ) : (
              <div className="space-y-2">
                {metodos.map((m) => (
                  <label
                    key={m}
                    className={cn(
                      'flex cursor-pointer gap-4 border bg-white p-5 transition',
                      metodo === m ? 'border-ink' : 'border-black/15 hover:border-black/40'
                    )}
                  >
                    <input type="radio" name="metodo" value={m} checked={metodo === m} onChange={() => setMetodo(m)} className="sr-only" />
                    <span className={cn('mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border', metodo === m ? 'border-ink' : 'border-black/25')}>
                      {metodo === m && <span className="h-2 w-2 rounded-full bg-ink" />}
                    </span>
                    <div>
                      <p className="text-[13px] uppercase tracking-wide">{METODO_LABEL[m]}</p>
                      <p className="mt-1 text-[13px] text-stone-500">{DESCRIPCION_METODO[m]}</p>
                      {m === 'TRANSFERENCIA' && metodo === m && infoTransferencia && (
                        <p className="mt-3 whitespace-pre-line bg-bone p-4 text-[13px] text-ink-soft">{infoTransferencia}</p>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="h-fit space-y-5 bg-bone p-8 lg:sticky lg:top-[140px]">
          <p className="text-[12px] uppercase tracking-label">Tu pedido</p>
          <ul className="max-h-80 space-y-4 overflow-y-auto">
            {items.map((item) => (
              <li key={itemKey(item)} className="flex gap-3">
                <div className="relative aspect-[2/3] w-14 shrink-0 bg-white">
                  <ProductImage src={item.imagen} alt={item.nombre} />
                  <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-ink text-[10px] text-white">
                    {item.cantidad}
                  </span>
                </div>
                <div className="min-w-0 flex-1 text-sm">
                  <p className="truncate text-[12px] uppercase tracking-wide">{item.nombre}</p>
                  <p className="text-xs text-stone-500">{[item.talla && `Talla ${item.talla}`, item.color].filter(Boolean).join(' · ')}</p>
                </div>
                <p className="text-sm">{formatPrice(item.precio * item.cantidad)}</p>
              </li>
            ))}
          </ul>
          <div className="space-y-2 border-t border-black/10 pt-5 text-[14px]">
            <div className="flex justify-between">
              <span className="text-stone-500">Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Envío</span>
              <span>{envio === 0 ? 'Gratis' : formatPrice(envio)}</span>
            </div>
          </div>
          <div className="flex justify-between border-t border-black/10 pt-5 text-[15px] font-medium">
            <span className="uppercase tracking-label">Total</span>
            <span>{formatPrice(subtotal + envio)}</span>
          </div>
          <button type="submit" disabled={enviando || metodos.length === 0} className="cta h-14 w-full">
            {enviando ? 'Procesando…' : metodo === 'STRIPE' ? 'Ir a pagar' : 'Confirmar pedido'}
          </button>
          <p className="text-center text-[11px] text-stone-500">Al confirmar aceptas que te contactemos para coordinar la entrega.</p>
        </aside>
      </form>
    </div>
  )
}

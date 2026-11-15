'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import toast from 'react-hot-toast'
import ImageUploader from './ImageUploader'
import MoneyInput from './MoneyInput'
import { Toggle } from './ProductRowActions'

export type Settings = {
  nombreTienda: string
  eslogan: string
  anuncio: string | null
  heroTitulo: string
  heroSubtitulo: string
  heroImagen: string | null
  whatsapp: string | null
  email: string | null
  telefono: string | null
  direccion: string | null
  ciudad: string | null
  horario: string | null
  instagram: string | null
  facebook: string | null
  tiktok: string | null
  costoEnvio: number
  envioGratisDesde: number | null
  infoTransferencia: string | null
  pagoWhatsapp: boolean
  pagoContraentrega: boolean
  pagoTransferencia: boolean
}

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-stone-400">{hint}</p>}
    </div>
  )
}

export default function SettingsForm({ initial, stripe }: { initial: Settings; stripe: boolean }) {
  const router = useRouter()
  const [s, setS] = useState<Settings>(initial)
  const [guardando, setGuardando] = useState(false)

  const txt = (k: keyof Settings) => ({
    value: (s[k] as string | null) ?? '',
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setS({ ...s, [k]: e.target.value }),
  })

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setGuardando(true)
    const res = await fetch('/api/admin/configuracion', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(s),
    })
    const data = await res.json().catch(() => ({}))
    setGuardando(false)
    if (!res.ok) {
      toast.error(data.error ?? 'No se pudo guardar')
      return
    }
    toast.success('Configuración guardada')
    router.refresh()
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <section className="card grid gap-4 p-6 sm:grid-cols-2">
        <h2 className="font-sans text-base font-semibold sm:col-span-2">Tienda</h2>
        <Field label="Nombre de la tienda *">
          <input required className="input" {...txt('nombreTienda')} />
        </Field>
        <Field label="Eslogan">
          <input className="input" {...txt('eslogan')} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Barra de anuncio" hint="Texto que aparece arriba de toda la tienda. Déjalo vacío para ocultarla.">
            <input className="input" {...txt('anuncio')} />
          </Field>
        </div>
      </section>

      <section className="card grid gap-4 p-6 sm:grid-cols-2">
        <h2 className="font-sans text-base font-semibold sm:col-span-2">Portada (inicio)</h2>
        <Field label="Título principal">
          <input className="input" {...txt('heroTitulo')} />
        </Field>
        <Field label="Texto secundario">
          <input className="input" {...txt('heroSubtitulo')} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Imagen de portada" hint="Si no subes una, se usa la foto de un producto destacado.">
            <ImageUploader single value={s.heroImagen ? [s.heroImagen] : []} onChange={(v) => setS({ ...s, heroImagen: v[0] ?? null })} />
          </Field>
        </div>
      </section>

      <section className="card grid gap-4 p-6 sm:grid-cols-2">
        <h2 className="font-sans text-base font-semibold sm:col-span-2">Contacto y redes</h2>
        <Field label="WhatsApp" hint="Número al que llegan los pedidos. Ej: 300 123 4567">
          <input className="input" inputMode="tel" {...txt('whatsapp')} />
        </Field>
        <Field label="Teléfono">
          <input className="input" inputMode="tel" {...txt('telefono')} />
        </Field>
        <Field label="Correo">
          <input className="input" type="email" {...txt('email')} />
        </Field>
        <Field label="Horario de atención">
          <input className="input" {...txt('horario')} />
        </Field>
        <Field label="Dirección">
          <input className="input" {...txt('direccion')} />
        </Field>
        <Field label="Ciudad">
          <input className="input" {...txt('ciudad')} />
        </Field>
        <Field label="Instagram" hint="@usuario o enlace">
          <input className="input" {...txt('instagram')} />
        </Field>
        <Field label="Facebook" hint="usuario o enlace">
          <input className="input" {...txt('facebook')} />
        </Field>
        <Field label="TikTok" hint="@usuario o enlace">
          <input className="input" {...txt('tiktok')} />
        </Field>
      </section>

      <section className="card grid gap-4 p-6 sm:grid-cols-2">
        <h2 className="font-sans text-base font-semibold sm:col-span-2">Envíos</h2>
        <Field label="Costo de envío">
          <MoneyInput value={s.costoEnvio} onChange={(v) => setS({ ...s, costoEnvio: v ?? 0 })} />
        </Field>
        <Field label="Envío gratis desde" hint="Déjalo vacío si no ofreces envío gratis.">
          <MoneyInput value={s.envioGratisDesde} onChange={(v) => setS({ ...s, envioGratisDesde: v })} />
        </Field>
      </section>

      <section className="card space-y-4 p-6">
        <h2 className="font-sans text-base font-semibold">Métodos de pago</h2>
        {(
          [
            ['pagoWhatsapp', 'Acordar por WhatsApp', 'El cliente envía su pedido por WhatsApp y acuerdan el pago.'],
            ['pagoContraentrega', 'Pago contra entrega', 'El cliente paga al recibir.'],
            ['pagoTransferencia', 'Transferencia / Nequi', 'Se muestran los datos de la cuenta al confirmar.'],
          ] as const
        ).map(([k, label, hint]) => (
          <label key={k} className="flex items-center justify-between gap-4">
            <span>
              <span className="block text-sm font-medium">{label}</span>
              <span className="block text-xs text-stone-500">{hint}</span>
            </span>
            <Toggle checked={s[k]} onChange={(v) => setS({ ...s, [k]: v })} label={label} />
          </label>
        ))}
        <div className="flex items-center justify-between gap-4 rounded-xl bg-sand-50 px-4 py-3">
          <span>
            <span className="block text-sm font-medium">Tarjeta (Stripe)</span>
            <span className="block text-xs text-stone-500">
              {stripe ? 'Activo: configurado con las llaves del servidor.' : 'Inactivo: requiere configurar STRIPE_SECRET_KEY en el servidor.'}
            </span>
          </span>
          <span className={`chip ${stripe ? 'bg-emerald-100 text-emerald-800' : 'bg-sand-200 text-stone-500'}`}>{stripe ? 'Activo' : 'Inactivo'}</span>
        </div>
        {s.pagoTransferencia && (
          <Field label="Datos para transferencia" hint="Banco, tipo y número de cuenta, titular, Nequi/Daviplata…">
            <textarea rows={4} className="input" {...txt('infoTransferencia')} />
          </Field>
        )}
      </section>

      <div className="sticky bottom-4 flex justify-end">
        <button type="submit" disabled={guardando} className="btn-primary px-8 py-3 shadow-lg">
          {guardando ? 'Guardando…' : 'Guardar configuración'}
        </button>
      </div>
    </form>
  )
}

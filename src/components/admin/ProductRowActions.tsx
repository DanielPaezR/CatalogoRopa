'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { EditIcon, EyeIcon, StarIcon, TrashIcon } from '@/components/ui/Icons'
import { cn } from '@/lib/utils'

export function Toggle({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition disabled:opacity-50',
        checked ? 'bg-emerald-600' : 'bg-sand-300'
      )}
    >
      <span className={cn('inline-block h-5 w-5 rounded-full bg-white shadow transition', checked ? 'translate-x-5' : 'translate-x-0.5')} />
    </button>
  )
}

export function ActiveToggle({ id, activo }: { id: string; activo: boolean }) {
  const router = useRouter()
  const [value, setValue] = useState(activo)
  const [busy, setBusy] = useState(false)
  const change = async (v: boolean) => {
    setBusy(true)
    setValue(v)
    const res = await fetch(`/api/admin/productos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activo: v }),
    })
    setBusy(false)
    if (!res.ok) {
      setValue(!v)
      toast.error('No se pudo actualizar')
      return
    }
    toast.success(v ? 'Producto visible en la tienda' : 'Producto oculto')
    router.refresh()
  }
  return <Toggle checked={value} onChange={change} disabled={busy} label="Visible en la tienda" />
}

export default function ProductRowActions({
  id,
  slug,
  nombre,
  destacado,
}: {
  id: string
  slug: string
  nombre: string
  destacado: boolean
}) {
  const router = useRouter()
  const [star, setStar] = useState(destacado)

  const toggleStar = async () => {
    const v = !star
    setStar(v)
    const res = await fetch(`/api/admin/productos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ destacado: v }),
    })
    if (!res.ok) {
      setStar(!v)
      toast.error('No se pudo actualizar')
    } else {
      toast.success(v ? 'Marcado como destacado' : 'Quitado de destacados')
      router.refresh()
    }
  }

  const eliminar = async () => {
    if (!confirm(`¿Eliminar "${nombre}"? Esta acción no se puede deshacer.\n\nSi solo quieres ocultarlo, desactiva el interruptor "Visible".`)) return
    const res = await fetch(`/api/admin/productos/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      toast.error('No se pudo eliminar')
      return
    }
    toast.success('Producto eliminado')
    router.refresh()
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <button
        onClick={toggleStar}
        className={cn('btn-ghost p-2', star ? 'text-amber-500' : 'text-stone-400')}
        title={star ? 'Quitar de destacados' : 'Destacar en inicio'}
        aria-label="Destacar"
      >
        <StarIcon width={18} height={18} fill={star ? 'currentColor' : 'none'} />
      </button>
      <Link href={`/productos/${slug}`} target="_blank" className="btn-ghost p-2 text-stone-500" title="Ver en tienda" aria-label="Ver en tienda">
        <EyeIcon width={18} height={18} />
      </Link>
      <Link href={`/admin/productos/${id}`} className="btn-ghost p-2 text-stone-500" title="Editar" aria-label="Editar">
        <EditIcon width={18} height={18} />
      </Link>
      <button onClick={eliminar} className="btn-ghost p-2 text-stone-500 hover:text-red-600" title="Eliminar" aria-label="Eliminar">
        <TrashIcon width={18} height={18} />
      </button>
    </div>
  )
}

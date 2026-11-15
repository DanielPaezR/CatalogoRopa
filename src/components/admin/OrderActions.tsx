'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Toggle } from './ProductRowActions'
import { ESTADO_LABEL, ESTADOS_PEDIDO } from '@/lib/constants'
import { cn } from '@/lib/utils'

export default function OrderActions({ id, estado, pagado }: { id: string; estado: string; pagado: boolean }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  const patch = async (body: { estado?: string; pagado?: boolean }) => {
    if (body.estado === 'CANCELADO' && !confirm('¿Cancelar el pedido? Las unidades volverán al inventario.')) return
    setBusy(true)
    const res = await fetch(`/api/admin/pedidos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json().catch(() => ({}))
    setBusy(false)
    if (!res.ok) {
      toast.error(data.error ?? 'No se pudo actualizar')
      return
    }
    toast.success('Pedido actualizado')
    router.refresh()
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-widest text-stone-500">Estado</p>
        <div className="grid grid-cols-2 gap-2">
          {ESTADOS_PEDIDO.map((e) => (
            <button
              key={e}
              disabled={busy || e === estado}
              onClick={() => patch({ estado: e })}
              className={cn(
                'rounded-xl border px-3 py-2 text-sm transition disabled:cursor-default',
                e === estado
                  ? e === 'CANCELADO'
                    ? 'border-stone-400 bg-stone-200 text-stone-700'
                    : 'border-ink bg-ink text-white'
                  : 'border-sand-300 bg-white hover:border-ink',
                e === 'CANCELADO' && e !== estado && 'text-red-600 hover:border-red-600'
              )}
            >
              {ESTADO_LABEL[e]}
            </button>
          ))}
        </div>
      </div>
      <label className="flex items-center justify-between gap-4 rounded-xl bg-sand-50 px-4 py-3">
        <span className="text-sm font-medium">Pago recibido</span>
        <Toggle checked={pagado} disabled={busy} onChange={(v) => patch({ pagado: v })} label="Pago recibido" />
      </label>
    </div>
  )
}

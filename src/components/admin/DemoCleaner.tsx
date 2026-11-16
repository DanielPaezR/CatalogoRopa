'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function DemoCleaner({ cantidad }: { cantidad: number }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  if (cantidad === 0) return null

  const borrar = async () => {
    if (!confirm(`¿Eliminar los ${cantidad} productos de muestra y sus imágenes de portada? Tus productos reales no se tocan.`)) return
    setBusy(true)
    const res = await fetch('/api/admin/demo', { method: 'DELETE' })
    setBusy(false)
    if (!res.ok) {
      toast.error('No se pudo eliminar')
      return
    }
    toast.success('Catálogo de muestra eliminado')
    router.refresh()
  }

  return (
    <section className="card flex flex-wrap items-center justify-between gap-4 border-amber-200 bg-amber-50 p-6">
      <div>
        <h2 className="font-sans text-base font-semibold">Productos de muestra</h2>
        <p className="text-xs text-stone-600">
          Hay {cantidad} productos de ejemplo (referencia DEMO-…). Elimínalos cuando subas tu propio catálogo.
        </p>
      </div>
      <button onClick={borrar} disabled={busy} className="btn-danger">
        {busy ? 'Eliminando…' : 'Eliminar muestra'}
      </button>
    </section>
  )
}

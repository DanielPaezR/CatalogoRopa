'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import toast from 'react-hot-toast'
import ImageUploader from './ImageUploader'
import { Toggle } from './ProductRowActions'
import ProductImage from '@/components/tienda/ProductImage'
import { EditIcon, TrashIcon } from '@/components/ui/Icons'
import { cn } from '@/lib/utils'

type Categoria = {
  id: string
  nombre: string
  slug: string
  descripcion: string | null
  imagen: string | null
  orden: number
  activo: boolean
  _count: { productos: number }
}

type FormState = { nombre: string; descripcion: string; imagen: string[]; orden: number; activo: boolean }

const VACIO: FormState = { nombre: '', descripcion: '', imagen: [], orden: 0, activo: true }

export default function CategoryManager({ categorias }: { categorias: Categoria[] }) {
  const router = useRouter()
  const [editando, setEditando] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>({ ...VACIO, orden: categorias.length + 1 })
  const [guardando, setGuardando] = useState(false)

  const editar = (c: Categoria) => {
    setEditando(c.id)
    setForm({ nombre: c.nombre, descripcion: c.descripcion ?? '', imagen: c.imagen ? [c.imagen] : [], orden: c.orden, activo: c.activo })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const cancelar = () => {
    setEditando(null)
    setForm({ ...VACIO, orden: categorias.length + 1 })
  }

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault()
    setGuardando(true)
    const res = await fetch(editando ? `/api/admin/categorias/${editando}` : '/api/admin/categorias', {
      method: editando ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: form.nombre,
        descripcion: form.descripcion || null,
        imagen: form.imagen[0] ?? null,
        orden: form.orden,
        activo: form.activo,
      }),
    })
    const data = await res.json().catch(() => ({}))
    setGuardando(false)
    if (!res.ok) {
      toast.error(data.error ?? 'No se pudo guardar')
      return
    }
    toast.success(editando ? 'Categoría actualizada' : 'Categoría creada')
    cancelar()
    router.refresh()
  }

  const eliminar = async (c: Categoria) => {
    const aviso = c._count.productos
      ? `\n\nSus ${c._count.productos} productos quedarán "sin categoría" (no se eliminan).`
      : ''
    if (!confirm(`¿Eliminar la categoría "${c.nombre}"?${aviso}`)) return
    const res = await fetch(`/api/admin/categorias/${c.id}`, { method: 'DELETE' })
    if (!res.ok) {
      toast.error('No se pudo eliminar')
      return
    }
    toast.success('Categoría eliminada')
    if (editando === c.id) cancelar()
    router.refresh()
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <form onSubmit={guardar} className="card h-fit space-y-4 p-6 lg:sticky lg:top-6">
        <h2 className="font-sans text-base font-semibold">{editando ? 'Editar categoría' : 'Nueva categoría'}</h2>
        <div>
          <label className="label" htmlFor="cat-nombre">Nombre *</label>
          <input id="cat-nombre" required className="input" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Ej: Vestidos" />
        </div>
        <div>
          <label className="label" htmlFor="cat-desc">Descripción</label>
          <input id="cat-desc" className="input" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} placeholder="Opcional" />
        </div>
        <div>
          <label className="label">Imagen de portada</label>
          <ImageUploader single value={form.imagen} onChange={(imagen) => setForm({ ...form, imagen })} />
          <p className="mt-1 text-xs text-stone-400">Si no subes una, se usa la foto del producto más reciente.</p>
        </div>
        <div className="flex items-end gap-4">
          <div className="w-24">
            <label className="label" htmlFor="cat-orden">Orden</label>
            <input id="cat-orden" type="number" min={0} className="input" value={form.orden} onChange={(e) => setForm({ ...form, orden: Math.max(0, Number(e.target.value) || 0) })} />
          </div>
          <label className="flex items-center gap-3 pb-2 text-sm">
            <Toggle checked={form.activo} onChange={(activo) => setForm({ ...form, activo })} label="Visible" /> Visible
          </label>
        </div>
        <div className="flex gap-2 pt-2">
          <button type="submit" disabled={guardando} className="btn-primary flex-1">
            {guardando ? 'Guardando…' : editando ? 'Guardar' : 'Crear categoría'}
          </button>
          {editando && (
            <button type="button" onClick={cancelar} className="btn-ghost">Cancelar</button>
          )}
        </div>
      </form>

      <div className="card divide-y divide-sand-200">
        {categorias.length === 0 && <p className="p-8 text-center text-sm text-stone-400">Aún no hay categorías.</p>}
        {categorias.map((c) => (
          <div key={c.id} className={cn('flex items-center gap-4 p-4', editando === c.id && 'bg-sand-50')}>
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-sand-100">
              <ProductImage src={c.imagen} alt={c.nombre} />
            </div>
            <div className="min-w-0 flex-1">
              <p className={cn('font-medium', !c.activo && 'text-stone-400')}>
                {c.nombre} {!c.activo && <span className="chip ml-1 bg-sand-200 text-stone-500">Oculta</span>}
              </p>
              <p className="truncate text-xs text-stone-500">
                /categoria/{c.slug} · {c._count.productos} {c._count.productos === 1 ? 'producto' : 'productos'} · orden {c.orden}
              </p>
            </div>
            <button onClick={() => editar(c)} className="btn-ghost p-2 text-stone-500" aria-label="Editar">
              <EditIcon width={18} height={18} />
            </button>
            <button onClick={() => eliminar(c)} className="btn-ghost p-2 text-stone-500 hover:text-red-600" aria-label="Eliminar">
              <TrashIcon width={18} height={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

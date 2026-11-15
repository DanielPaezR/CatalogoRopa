'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import ImageUploader from './ImageUploader'
import MoneyInput from './MoneyInput'
import TagInput from './TagInput'
import { Toggle } from './ProductRowActions'
import { TALLAS_SUGERIDAS } from '@/lib/constants'
import { discountPercent, slugify } from '@/lib/utils'

const COLORES_SUGERIDOS = ['Negro', 'Blanco', 'Beige', 'Azul', 'Gris', 'Rojo', 'Verde', 'Café', 'Rosado']

export type ProductFormValues = {
  nombre: string
  slug: string
  descripcion: string
  precio: number | null
  precioAnterior: number | null
  sku: string
  categoriaId: string
  imagenes: string[]
  tallas: string[]
  colores: string[]
  stock: number
  variantes: { talla: string; color: string; stock: number }[]
  destacado: boolean
  activo: boolean
}

export const EMPTY_PRODUCT: ProductFormValues = {
  nombre: '',
  slug: '',
  descripcion: '',
  precio: null,
  precioAnterior: null,
  sku: '',
  categoriaId: '',
  imagenes: [],
  tallas: [],
  colores: [],
  stock: 0,
  variantes: [],
  destacado: false,
  activo: true,
}

export default function ProductForm({
  id,
  initial,
  categorias,
}: {
  id?: string
  initial: ProductFormValues
  categorias: { id: string; nombre: string }[]
}) {
  const router = useRouter()
  const [v, setV] = useState<ProductFormValues>(initial)
  const [slugManual, setSlugManual] = useState(Boolean(id))
  const [guardando, setGuardando] = useState(false)

  const set = <K extends keyof ProductFormValues>(k: K, val: ProductFormValues[K]) => setV((p) => ({ ...p, [k]: val }))

  const combinaciones = useMemo(() => {
    if (!v.tallas.length && !v.colores.length) return []
    const ts = v.tallas.length ? v.tallas : ['']
    const cs = v.colores.length ? v.colores : ['']
    return ts.flatMap((talla) => cs.map((color) => ({ talla, color })))
  }, [v.tallas, v.colores])

  const stockDe = (talla: string, color: string) => v.variantes.find((x) => x.talla === talla && x.color === color)?.stock ?? 0

  const setStockVariante = (talla: string, color: string, stock: number) => {
    setV((p) => {
      const otras = p.variantes.filter((x) => !(x.talla === talla && x.color === color))
      return { ...p, variantes: [...otras, { talla, color, stock }] }
    })
  }

  const stockTotal = combinaciones.length ? combinaciones.reduce((s, c) => s + stockDe(c.talla, c.color), 0) : v.stock
  const descuento = v.precio ? discountPercent(v.precio, v.precioAnterior) : 0

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (v.precio === null) {
      toast.error('Escribe el precio')
      return
    }
    setGuardando(true)
    const payload = {
      ...v,
      precio: v.precio,
      precioAnterior: v.precioAnterior || null,
      categoriaId: v.categoriaId || null,
      sku: v.sku || null,
      slug: v.slug || undefined,
      variantes: combinaciones.map((c) => ({ ...c, stock: stockDe(c.talla, c.color) })),
    }
    const res = await fetch(id ? `/api/admin/productos/${id}` : '/api/admin/productos', {
      method: id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json().catch(() => ({}))
    setGuardando(false)
    if (!res.ok) {
      toast.error(data.error ?? 'No se pudo guardar')
      return
    }
    toast.success(id ? 'Cambios guardados' : 'Producto creado')
    router.push('/admin/productos')
    router.refresh()
  }

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <section className="card space-y-4 p-6">
          <div>
            <label className="label" htmlFor="nombre">Nombre *</label>
            <input
              id="nombre"
              required
              className="input"
              placeholder="Ej: Camisa de lino manga larga"
              value={v.nombre}
              onChange={(e) => {
                const nombre = e.target.value
                setV((p) => ({ ...p, nombre, slug: slugManual ? p.slug : slugify(nombre) }))
              }}
            />
          </div>
          <div>
            <label className="label" htmlFor="descripcion">Descripción</label>
            <textarea
              id="descripcion"
              rows={6}
              className="input"
              placeholder="Materiales, ajuste, cuidados, medidas…"
              value={v.descripcion}
              onChange={(e) => set('descripcion', e.target.value)}
            />
          </div>
        </section>

        <section className="card space-y-4 p-6">
          <div>
            <h2 className="font-sans text-base font-semibold">Fotos</h2>
            <p className="text-xs text-stone-500">La primera es la principal. Usa fotos verticales (3:4) para mejores resultados.</p>
          </div>
          <ImageUploader value={v.imagenes} onChange={(imgs) => set('imagenes', imgs)} max={10} />
        </section>

        <section className="card grid gap-4 p-6 sm:grid-cols-2">
          <h2 className="font-sans text-base font-semibold sm:col-span-2">Precio</h2>
          <div>
            <label className="label" htmlFor="precio">Precio de venta *</label>
            <MoneyInput id="precio" required value={v.precio} onChange={(n) => set('precio', n)} placeholder="89.900" />
          </div>
          <div>
            <label className="label" htmlFor="precioAnterior">Precio antes (opcional)</label>
            <MoneyInput id="precioAnterior" value={v.precioAnterior} onChange={(n) => set('precioAnterior', n)} placeholder="Para mostrar descuento" />
            {descuento > 0 && <p className="mt-1 text-xs text-accent">Se mostrará con {descuento}% de descuento</p>}
            {v.precioAnterior !== null && v.precio !== null && v.precioAnterior <= v.precio && (
              <p className="mt-1 text-xs text-stone-400">Debe ser mayor al precio de venta para mostrarse.</p>
            )}
          </div>
        </section>

        <section className="card space-y-5 p-6">
          <div>
            <h2 className="font-sans text-base font-semibold">Tallas, colores e inventario</h2>
            <p className="text-xs text-stone-500">Si agregas tallas o colores, podrás indicar cuántas unidades hay de cada combinación.</p>
          </div>
          <div>
            <label className="label">Tallas</label>
            <TagInput value={v.tallas} onChange={(t) => set('tallas', t)} sugerencias={TALLAS_SUGERIDAS.slice(0, 7)} placeholder="Escribe y presiona Enter (S, M, L…)" />
          </div>
          <div>
            <label className="label">Colores</label>
            <TagInput value={v.colores} onChange={(c) => set('colores', c)} sugerencias={COLORES_SUGERIDOS} placeholder="Escribe y presiona Enter (Negro, Beige…)" />
          </div>

          {combinaciones.length > 0 ? (
            <div className="overflow-hidden rounded-xl border border-sand-200">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-left text-xs uppercase tracking-wider text-stone-500">
                  <tr>
                    {v.tallas.length > 0 && <th className="px-4 py-2 font-medium">Talla</th>}
                    {v.colores.length > 0 && <th className="px-4 py-2 font-medium">Color</th>}
                    <th className="w-32 px-4 py-2 font-medium">Unidades</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand-200">
                  {combinaciones.map((c) => (
                    <tr key={`${c.talla}|${c.color}`}>
                      {v.tallas.length > 0 && <td className="px-4 py-2">{c.talla}</td>}
                      {v.colores.length > 0 && <td className="px-4 py-2">{c.color}</td>}
                      <td className="px-4 py-1.5">
                        <input
                          type="number"
                          min={0}
                          inputMode="numeric"
                          className="input py-1.5"
                          value={stockDe(c.talla, c.color)}
                          onChange={(e) => setStockVariante(c.talla, c.color, Math.max(0, Math.floor(Number(e.target.value) || 0)))}
                          aria-label={`Unidades ${c.talla} ${c.color}`}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-sand-50">
                  <tr>
                    <td className="px-4 py-2 text-xs font-medium uppercase tracking-wider text-stone-500" colSpan={(v.tallas.length > 0 ? 1 : 0) + (v.colores.length > 0 ? 1 : 0)}>
                      Total
                    </td>
                    <td className="px-4 py-2 font-semibold">{stockTotal}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <div className="max-w-[200px]">
              <label className="label" htmlFor="stock">Unidades disponibles</label>
              <input
                id="stock"
                type="number"
                min={0}
                className="input"
                value={v.stock}
                onChange={(e) => set('stock', Math.max(0, Math.floor(Number(e.target.value) || 0)))}
              />
            </div>
          )}
        </section>
      </div>

      <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
        <section className="card space-y-4 p-6">
          <label className="flex items-center justify-between gap-4">
            <span>
              <span className="block text-sm font-medium">Visible en la tienda</span>
              <span className="block text-xs text-stone-500">Si lo apagas, queda oculto</span>
            </span>
            <Toggle checked={v.activo} onChange={(x) => set('activo', x)} label="Visible" />
          </label>
          <label className="flex items-center justify-between gap-4">
            <span>
              <span className="block text-sm font-medium">Destacado</span>
              <span className="block text-xs text-stone-500">Aparece en la página de inicio</span>
            </span>
            <Toggle checked={v.destacado} onChange={(x) => set('destacado', x)} label="Destacado" />
          </label>
        </section>

        <section className="card space-y-4 p-6">
          <div>
            <label className="label" htmlFor="categoria">Categoría</label>
            <select id="categoria" className="input" value={v.categoriaId} onChange={(e) => set('categoriaId', e.target.value)}>
              <option value="">Sin categoría</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
            {categorias.length === 0 && (
              <p className="mt-1 text-xs text-stone-500">
                <Link href="/admin/categorias" className="underline">Crea categorías</Link> para organizar el catálogo.
              </p>
            )}
          </div>
          <div>
            <label className="label" htmlFor="sku">Referencia / SKU</label>
            <input id="sku" className="input" placeholder="Opcional" value={v.sku} onChange={(e) => set('sku', e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="slug">URL del producto</label>
            <div className="flex items-center rounded-xl border border-sand-300 bg-white focus-within:border-ink">
              <span className="pl-3 text-xs text-stone-400">/productos/</span>
              <input
                id="slug"
                className="w-full rounded-xl bg-transparent px-1 py-2.5 text-sm outline-none"
                value={v.slug}
                onChange={(e) => {
                  setSlugManual(true)
                  set('slug', slugify(e.target.value))
                }}
              />
            </div>
          </div>
        </section>

        <div className="flex flex-col gap-2">
          <button type="submit" disabled={guardando} className="btn-primary w-full py-3">
            {guardando ? 'Guardando…' : id ? 'Guardar cambios' : 'Crear producto'}
          </button>
          <Link href="/admin/productos" className="btn-ghost w-full">Cancelar</Link>
        </div>
      </aside>
    </form>
  )
}

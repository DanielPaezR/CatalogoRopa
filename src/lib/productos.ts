import { z } from 'zod'
import { prisma } from './db'
import { slugify } from './utils'

const lista = z.array(z.string().trim().min(1).max(40)).max(30)

export const productoSchema = z.object({
  nombre: z.string().trim().min(2, 'El nombre es muy corto').max(150),
  slug: z.string().trim().max(160).optional(),
  descripcion: z.string().trim().max(5000).default(''),
  precio: z.number().int('El precio debe ser un número entero').min(0),
  precioAnterior: z.number().int().min(0).nullish(),
  sku: z.string().trim().max(60).nullish(),
  categoriaId: z.string().nullish(),
  imagenes: z.array(z.string().min(1).max(1000)).max(12).default([]),
  tallas: lista.default([]),
  colores: lista.default([]),
  stock: z.number().int().min(0).default(0),
  variantes: z
    .array(z.object({ talla: z.string().default(''), color: z.string().default(''), stock: z.number().int().min(0) }))
    .default([]),
  destacado: z.boolean().default(false),
  activo: z.boolean().default(true),
})

export type ProductoInput = z.infer<typeof productoSchema>

export async function slugDisponible(base: string, excluirId?: string) {
  const raiz = slugify(base) || 'producto'
  let slug = raiz
  for (let i = 2; ; i++) {
    const existe = await prisma.producto.findUnique({ where: { slug }, select: { id: true } })
    if (!existe || existe.id === excluirId) return slug
    slug = `${raiz}-${i}`
  }
}

/** Genera la matriz talla × color a partir de las listas, tomando el stock indicado. */
export function construirVariantes(input: ProductoInput) {
  const tallas = Array.from(new Set(input.tallas))
  const colores = Array.from(new Set(input.colores))
  if (tallas.length === 0 && colores.length === 0) return []

  const ts = tallas.length ? tallas : ['']
  const cs = colores.length ? colores : ['']
  const out: { talla: string; color: string; stock: number }[] = []
  for (const talla of ts) {
    for (const color of cs) {
      const v = input.variantes.find((x) => x.talla === talla && x.color === color)
      out.push({ talla, color, stock: v?.stock ?? 0 })
    }
  }
  return out
}

export async function guardarProducto(input: ProductoInput, id?: string) {
  const variantes = construirVariantes(input)
  const stock = variantes.length ? variantes.reduce((s, v) => s + v.stock, 0) : input.stock
  const slug = await slugDisponible(input.slug || input.nombre, id)
  const precioAnterior = input.precioAnterior && input.precioAnterior > input.precio ? input.precioAnterior : null

  const data = {
    nombre: input.nombre,
    slug,
    descripcion: input.descripcion,
    precio: input.precio,
    precioAnterior,
    sku: input.sku || null,
    categoriaId: input.categoriaId || null,
    imagenes: input.imagenes,
    tallas: Array.from(new Set(input.tallas)),
    colores: Array.from(new Set(input.colores)),
    stock,
    destacado: input.destacado,
    activo: input.activo,
  }

  return prisma.$transaction(async (tx) => {
    const producto = id
      ? await tx.producto.update({ where: { id }, data })
      : await tx.producto.create({ data })

    const actuales = await tx.variante.findMany({ where: { productoId: producto.id } })
    const clave = (v: { talla: string; color: string }) => `${v.talla}|${v.color}`
    const nuevas = new Set(variantes.map(clave))

    const sobrantes = actuales.filter((v) => !nuevas.has(clave(v))).map((v) => v.id)
    if (sobrantes.length) await tx.variante.deleteMany({ where: { id: { in: sobrantes } } })

    for (const v of variantes) {
      await tx.variante.upsert({
        where: { productoId_talla_color: { productoId: producto.id, talla: v.talla, color: v.color } },
        update: { stock: v.stock },
        create: { productoId: producto.id, ...v },
      })
    }
    return producto
  })
}

import { cache } from 'react'
import type { Prisma } from '@prisma/client'
import { prisma } from './db'

export const cardSelect = {
  id: true,
  slug: true,
  nombre: true,
  precio: true,
  precioAnterior: true,
  imagenes: true,
  stock: true,
  colores: true,
  tallas: true,
  createdAt: true,
  categoria: { select: { nombre: true } },
  variantes: { select: { id: true, talla: true, color: true, stock: true } },
} satisfies Prisma.ProductoSelect

export const getCategoriasMenu = cache(async () =>
  prisma.categoria.findMany({
    where: { activo: true },
    orderBy: [{ orden: 'asc' }, { nombre: 'asc' }],
    select: { id: true, nombre: true, slug: true, descripcion: true, imagen: true },
  })
)

export const PAGE_SIZE = 24

export const ORDENES = {
  recientes: { label: 'Más recientes', orderBy: { createdAt: 'desc' } },
  'precio-asc': { label: 'Precio: menor a mayor', orderBy: { precio: 'asc' } },
  'precio-desc': { label: 'Precio: mayor a menor', orderBy: { precio: 'desc' } },
  nombre: { label: 'Nombre (A–Z)', orderBy: { nombre: 'asc' } },
} as const satisfies Record<string, { label: string; orderBy: Prisma.ProductoOrderByWithRelationInput }>

export type Filtros = {
  q?: string
  categoria?: string
  talla?: string
  color?: string
  orden?: string
  ofertas?: boolean
  disponibles?: boolean
  min?: number
  max?: number
  page?: number
}

export function parseFiltros(sp: Record<string, string | string[] | undefined>): Filtros {
  const get = (k: string) => {
    const v = sp[k]
    return (Array.isArray(v) ? v[0] : v)?.trim() || undefined
  }
  const num = (k: string) => {
    const v = Number(get(k))
    return Number.isFinite(v) && v > 0 ? Math.floor(v) : undefined
  }
  return {
    q: get('q'),
    categoria: get('categoria'),
    talla: get('talla'),
    color: get('color'),
    orden: get('orden'),
    ofertas: get('ofertas') === '1',
    disponibles: get('disponibles') === '1',
    min: num('min'),
    max: num('max'),
    page: num('page') ?? 1,
  }
}

export async function buscarProductos(f: Filtros) {
  const where: Prisma.ProductoWhereInput = { activo: true }
  if (f.q) {
    where.OR = [
      { nombre: { contains: f.q, mode: 'insensitive' } },
      { descripcion: { contains: f.q, mode: 'insensitive' } },
      { categoria: { nombre: { contains: f.q, mode: 'insensitive' } } },
    ]
  }
  if (f.categoria) where.categoria = { slug: f.categoria }
  if (f.talla) where.tallas = { has: f.talla }
  if (f.color) where.colores = { has: f.color }
  if (f.ofertas) where.precioAnterior = { not: null }
  if (f.disponibles) where.stock = { gt: 0 }
  if (f.min || f.max) where.precio = { ...(f.min ? { gte: f.min } : {}), ...(f.max ? { lte: f.max } : {}) }

  const orden = ORDENES[(f.orden as keyof typeof ORDENES) ?? 'recientes'] ?? ORDENES.recientes
  const page = Math.max(1, f.page ?? 1)

  const [productos, total] = await Promise.all([
    prisma.producto.findMany({
      where,
      select: cardSelect,
      orderBy: [orden.orderBy, { id: 'asc' }],
      take: PAGE_SIZE * page,
    }),
    prisma.producto.count({ where }),
  ])

  return { productos, total, page, pages: Math.max(1, Math.ceil(total / PAGE_SIZE)) }
}

/** Tallas y colores disponibles en el catálogo activo, para los filtros. */
export async function opcionesFiltro(categoriaSlug?: string) {
  const rows = await prisma.producto.findMany({
    where: { activo: true, ...(categoriaSlug ? { categoria: { slug: categoriaSlug } } : {}) },
    select: { tallas: true, colores: true },
  })
  const set = new Set<string>()
  const colores = new Set<string>()
  rows.forEach((r) => {
    r.tallas.forEach((t) => set.add(t))
    r.colores.forEach((c) => colores.add(c))
  })
  return { tallas: ordenarTallas(Array.from(set)), colores: Array.from(colores).sort((a, b) => a.localeCompare(b, 'es')) }
}

export function ordenarTallas(tallas: string[]) {
  const orden = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']
  return [...tallas].sort((a, b) => {
    const ia = orden.indexOf(a.toUpperCase())
    const ib = orden.indexOf(b.toUpperCase())
    if (ia >= 0 && ib >= 0) return ia - ib
    if (ia >= 0) return -1
    if (ib >= 0) return 1
    return a.localeCompare(b, 'es', { numeric: true })
  })
}

/** Categorías del menú con una imagen de portada (la propia o la del producto más reciente). */
export const getCategoriasConPortada = cache(async () => {
  const categorias = await getCategoriasMenu()
  return Promise.all(
    categorias.map(async (c) => {
      if (c.imagen) return { ...c, portada: c.imagen }
      const p = await prisma.producto.findFirst({
        where: { activo: true, categoriaId: c.id, imagenes: { isEmpty: false } },
        orderBy: { createdAt: 'desc' },
        select: { imagenes: true },
      })
      return { ...c, portada: p?.imagenes[0] ?? null }
    })
  )
})

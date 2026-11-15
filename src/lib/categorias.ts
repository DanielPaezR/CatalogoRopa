import { z } from 'zod'
import { prisma } from './db'
import { slugify } from './utils'

export const categoriaSchema = z.object({
  nombre: z.string().trim().min(2, 'El nombre es muy corto').max(80),
  slug: z.string().trim().max(100).optional(),
  descripcion: z.string().trim().max(300).nullish(),
  imagen: z.string().max(1000).nullish(),
  orden: z.number().int().min(0).default(0),
  activo: z.boolean().default(true),
})

export async function slugCategoria(base: string, excluirId?: string) {
  const raiz = slugify(base) || 'categoria'
  let slug = raiz
  for (let i = 2; ; i++) {
    const existe = await prisma.categoria.findUnique({ where: { slug }, select: { id: true } })
    if (!existe || existe.id === excluirId) return slug
    slug = `${raiz}-${i}`
  }
}

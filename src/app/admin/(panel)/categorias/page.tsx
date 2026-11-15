import PageHeader from '@/components/admin/PageHeader'
import CategoryManager from '@/components/admin/CategoryManager'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function CategoriasPage() {
  const categorias = await prisma.categoria.findMany({
    orderBy: [{ orden: 'asc' }, { nombre: 'asc' }],
    include: { _count: { select: { productos: true } } },
  })
  return (
    <>
      <PageHeader title="Categorías" description="Organiza tu catálogo. Aparecen en el menú de la tienda según su orden." />
      <CategoryManager categorias={categorias} />
    </>
  )
}

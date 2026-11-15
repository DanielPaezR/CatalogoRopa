import Link from 'next/link'
import PageHeader from '@/components/admin/PageHeader'
import ProductForm, { EMPTY_PRODUCT } from '@/components/admin/ProductForm'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function NuevoProductoPage() {
  const categorias = await prisma.categoria.findMany({ orderBy: { orden: 'asc' }, select: { id: true, nombre: true } })
  return (
    <>
      <Link href="/admin/productos" className="mb-2 inline-block text-sm text-stone-500 hover:text-ink">← Productos</Link>
      <PageHeader title="Nuevo producto" />
      <ProductForm initial={EMPTY_PRODUCT} categorias={categorias} />
    </>
  )
}

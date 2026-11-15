import Link from 'next/link'
import { notFound } from 'next/navigation'
import PageHeader from '@/components/admin/PageHeader'
import ProductForm from '@/components/admin/ProductForm'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function EditarProductoPage({ params }: { params: { id: string } }) {
  const [producto, categorias] = await Promise.all([
    prisma.producto.findUnique({ where: { id: params.id }, include: { variantes: true } }),
    prisma.categoria.findMany({ orderBy: { orden: 'asc' }, select: { id: true, nombre: true } }),
  ])
  if (!producto) notFound()

  return (
    <>
      <Link href="/admin/productos" className="mb-2 inline-block text-sm text-stone-500 hover:text-ink">← Productos</Link>
      <PageHeader
        title={producto.nombre}
        actions={
          <Link href={`/productos/${producto.slug}`} target="_blank" className="btn-outline">
            Ver en la tienda
          </Link>
        }
      />
      <ProductForm
        id={producto.id}
        categorias={categorias}
        initial={{
          nombre: producto.nombre,
          slug: producto.slug,
          descripcion: producto.descripcion,
          precio: producto.precio,
          precioAnterior: producto.precioAnterior,
          sku: producto.sku ?? '',
          categoriaId: producto.categoriaId ?? '',
          imagenes: producto.imagenes,
          tallas: producto.tallas,
          colores: producto.colores,
          stock: producto.stock,
          variantes: producto.variantes.map((x) => ({ talla: x.talla, color: x.color, stock: x.stock })),
          destacado: producto.destacado,
          activo: producto.activo,
        }}
      />
    </>
  )
}

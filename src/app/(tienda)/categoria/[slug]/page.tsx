import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import CatalogView from '@/components/tienda/CatalogView'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

type Props = {
  params: { slug: string }
  searchParams: Record<string, string | string[] | undefined>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = await prisma.categoria.findUnique({ where: { slug: params.slug }, select: { nombre: true } })
  return { title: c?.nombre ?? 'Categoría' }
}

export default async function CategoriaPage({ params, searchParams }: Props) {
  const categoria = await prisma.categoria.findUnique({ where: { slug: params.slug } })
  if (!categoria || !categoria.activo) notFound()

  return (
    <CatalogView
      title={categoria.nombre}
      description={categoria.descripcion}
      basePath={`/categoria/${categoria.slug}`}
      searchParams={searchParams}
      categoriaSlug={categoria.slug}
    />
  )
}

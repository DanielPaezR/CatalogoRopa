import type { Metadata } from 'next'
import CatalogView from '@/components/tienda/CatalogView'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = { title: 'Catálogo' }

export default function ProductosPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const ofertas = searchParams.ofertas === '1'
  return (
    <CatalogView
      title={ofertas ? 'Ofertas' : 'Catálogo'}
      description={ofertas ? 'Prendas con precio especial por tiempo limitado.' : 'Explora todas nuestras prendas.'}
      basePath="/productos"
      searchParams={searchParams}
    />
  )
}

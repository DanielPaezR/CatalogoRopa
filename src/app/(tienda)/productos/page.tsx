import type { Metadata } from 'next'
import CatalogView from '@/components/tienda/CatalogView'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = { title: 'Catálogo' }

export default function ProductosPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const ofertas = searchParams.ofertas === '1'
  return (
    <CatalogView
      title={ofertas ? 'Ofertas' : 'Novedades'}
      eyebrow={ofertas ? 'Por tiempo limitado' : 'Colección'}
      description={ofertas ? 'Prendas seleccionadas con precio especial.' : 'Todas nuestras prendas, de la más reciente a la de siempre.'}
      searchParams={searchParams}
    />
  )
}

import type { Metadata } from 'next'
import FavoritesView from '@/components/tienda/FavoritesView'

export const metadata: Metadata = { title: 'Favoritos' }

export default function FavoritosPage() {
  return <FavoritesView />
}

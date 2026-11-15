import type { Metadata } from 'next'
import CartPageClient from '@/components/tienda/CartPageClient'
import { getConfig } from '@/lib/config'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Carrito' }

export default async function CarritoPage() {
  const config = await getConfig()
  return <CartPageClient costoEnvio={config.costoEnvio} envioGratisDesde={config.envioGratisDesde} />
}

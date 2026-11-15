import type { Metadata } from 'next'
import CheckoutForm from '@/components/tienda/CheckoutForm'
import { getConfig, stripeEnabled } from '@/lib/config'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Finalizar compra' }

export default async function CheckoutPage() {
  const config = await getConfig()
  const metodos = [
    config.pagoWhatsapp && 'WHATSAPP',
    config.pagoContraentrega && 'CONTRAENTREGA',
    config.pagoTransferencia && 'TRANSFERENCIA',
    stripeEnabled() && 'STRIPE',
  ].filter(Boolean) as string[]

  return (
    <CheckoutForm
      costoEnvio={config.costoEnvio}
      envioGratisDesde={config.envioGratisDesde}
      metodos={metodos}
      infoTransferencia={config.infoTransferencia}
    />
  )
}

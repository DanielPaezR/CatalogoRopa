import type { Metadata } from 'next'
import CheckoutForm from '@/components/tienda/CheckoutForm'
import { getConfig, wompiEnabled } from '@/lib/config'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Finalizar compra' }

export default async function CheckoutPage() {
  const config = await getConfig()
  const metodos = [
    wompiEnabled() && 'WOMPI',
    config.pagoWhatsapp && 'WHATSAPP',
    config.pagoContraentrega && 'CONTRAENTREGA',
    config.pagoTransferencia && 'TRANSFERENCIA',
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

import Header from '@/components/tienda/Header'
import Footer from '@/components/tienda/Footer'
import CartDrawer from '@/components/tienda/CartDrawer'
import WhatsappFloat from '@/components/tienda/WhatsappFloat'
import { getConfig } from '@/lib/config'
import { getCategoriasMenu } from '@/lib/catalogo'

export default async function TiendaLayout({ children }: { children: React.ReactNode }) {
  const [config, categorias] = await Promise.all([getConfig(), getCategoriasMenu()])

  return (
    <div className="flex min-h-screen flex-col">
      <Header nombreTienda={config.nombreTienda} anuncio={config.anuncio} categorias={categorias} />
      <main className="flex-1">{children}</main>
      <Footer config={config} categorias={categorias} />
      <CartDrawer envioGratisDesde={config.envioGratisDesde} />
      <WhatsappFloat numero={config.whatsapp} tienda={config.nombreTienda} />
    </div>
  )
}

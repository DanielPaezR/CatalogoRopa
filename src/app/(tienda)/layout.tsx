import Header from '@/components/tienda/Header'
import Footer from '@/components/tienda/Footer'
import CartDrawer from '@/components/tienda/CartDrawer'
import WhatsappFloat from '@/components/tienda/WhatsappFloat'
import { getConfig } from '@/lib/config'
import { getCategoriasConPortada } from '@/lib/catalogo'
import { formatPrice } from '@/lib/utils'

export default async function TiendaLayout({ children }: { children: React.ReactNode }) {
  const [config, categorias] = await Promise.all([getConfig(), getCategoriasConPortada()])

  const anuncios = [
    config.anuncio,
    !config.anuncio && config.envioGratisDesde ? `Envío gratis desde ${formatPrice(config.envioGratisDesde)}` : null,
    'Envíos a toda Colombia',
    config.pagoContraentrega ? 'Paga contra entrega' : null,
  ].filter(Boolean) as string[]

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header
        nombreTienda={config.nombreTienda}
        anuncios={anuncios}
        categorias={categorias.map((c) => ({ nombre: c.nombre, slug: c.slug, portada: c.portada }))}
      />
      <main className="flex-1">{children}</main>
      <Footer config={config} categorias={categorias} />
      <CartDrawer envioGratisDesde={config.envioGratisDesde} />
      <WhatsappFloat numero={config.whatsapp} tienda={config.nombreTienda} />
    </div>
  )
}

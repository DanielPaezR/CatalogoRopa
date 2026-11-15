import type { Metadata, Viewport } from 'next'
import { Inter, Fraunces } from 'next/font/google'
import Providers from './providers'
import { getConfig } from '@/lib/config'
import './globals.css'

const sans = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' })
const display = Fraunces({ subsets: ['latin'], variable: '--font-display', display: 'swap' })

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  let nombre = 'ModaStyle'
  let eslogan = 'Tienda de ropa online'
  try {
    const config = await getConfig()
    nombre = config.nombreTienda
    eslogan = config.eslogan
  } catch {
    /* sin base de datos */
  }
  return {
    title: { default: `${nombre} · ${eslogan}`, template: `%s · ${nombre}` },
    description: `${nombre}: ${eslogan}. Compra online con envío a toda Colombia.`,
    icons: { icon: '/icon.svg' },
  }
}

export const viewport: Viewport = { themeColor: '#1c1917' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${sans.variable} ${display.variable}`}>
      <body className="min-h-screen bg-sand-50 font-sans text-ink antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

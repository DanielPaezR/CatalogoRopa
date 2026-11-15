import type { Metadata } from 'next'
import AdminNav from '@/components/admin/AdminNav'
import { requireAdminPage } from '@/lib/auth'
import { getConfig } from '@/lib/config'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Administración', robots: { index: false } }

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdminPage()
  const [config, pendientes] = await Promise.all([getConfig(), prisma.pedido.count({ where: { estado: 'PENDIENTE' } })])

  return (
    <div className="min-h-screen bg-sand-50">
      <AdminNav tienda={config.nombreTienda} usuario={session.user.email} pendientes={pendientes} />
      <main className="px-4 py-6 sm:px-8 lg:ml-64 lg:py-10">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  )
}

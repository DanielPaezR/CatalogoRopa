import PageHeader from '@/components/admin/PageHeader'
import PasswordForm from '@/components/admin/PasswordForm'
import SettingsForm from '@/components/admin/SettingsForm'
import DemoCleaner from '@/components/admin/DemoCleaner'
import { requireAdminPage } from '@/lib/auth'
import { headers } from 'next/headers'
import { getConfig } from '@/lib/config'
import { wompiEnabled, wompiSandbox } from '@/lib/wompi'
import { baseUrlFromHeaders } from '@/lib/utils'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function ConfiguracionPage() {
  const session = await requireAdminPage()
  const { id: _id, updatedAt: _u, demoCargado: _d, ...config } = await getConfig()
  const [suscriptores, demo] = await Promise.all([
    prisma.suscriptor.count(),
    prisma.producto.count({ where: { sku: { startsWith: 'DEMO-' } } }),
  ])

  return (
    <>
      <PageHeader title="Configuración" description="Datos de la tienda, envíos, pagos y acceso." />
      <div className="space-y-6">
        <DemoCleaner cantidad={demo} />
        <SettingsForm
          initial={config}
          wompi={{
            activo: wompiEnabled(),
            pruebas: wompiSandbox(),
            eventos: Boolean(process.env.WOMPI_EVENTS_SECRET),
            urlEventos: `${baseUrlFromHeaders(headers())}/api/wompi/eventos`,
          }}
        />
        <section className="card flex flex-wrap items-center justify-between gap-4 p-6">
          <div>
            <h2 className="font-sans text-base font-semibold">Suscriptores del boletín</h2>
            <p className="text-xs text-stone-500">{suscriptores} {suscriptores === 1 ? 'persona se ha suscrito' : 'personas se han suscrito'} desde el pie de página.</p>
          </div>
          {suscriptores > 0 && (
            <a href="/api/admin/suscriptores" className="btn-outline">Descargar CSV</a>
          )}
        </section>
        <PasswordForm email={session.user.email} />
      </div>
    </>
  )
}

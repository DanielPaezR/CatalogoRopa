import PageHeader from '@/components/admin/PageHeader'
import PasswordForm from '@/components/admin/PasswordForm'
import SettingsForm from '@/components/admin/SettingsForm'
import { requireAdminPage } from '@/lib/auth'
import { getConfig, stripeEnabled } from '@/lib/config'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function ConfiguracionPage() {
  const session = await requireAdminPage()
  const { id: _id, updatedAt: _u, ...config } = await getConfig()
  const suscriptores = await prisma.suscriptor.count()

  return (
    <>
      <PageHeader title="Configuración" description="Datos de la tienda, envíos, pagos y acceso." />
      <div className="space-y-6">
        <SettingsForm initial={config} stripe={stripeEnabled()} />
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

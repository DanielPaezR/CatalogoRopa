import PageHeader from '@/components/admin/PageHeader'
import PasswordForm from '@/components/admin/PasswordForm'
import SettingsForm from '@/components/admin/SettingsForm'
import { requireAdminPage } from '@/lib/auth'
import { getConfig, stripeEnabled } from '@/lib/config'

export const dynamic = 'force-dynamic'

export default async function ConfiguracionPage() {
  const session = await requireAdminPage()
  const { id: _id, updatedAt: _u, ...config } = await getConfig()

  return (
    <>
      <PageHeader title="Configuración" description="Datos de la tienda, envíos, pagos y acceso." />
      <div className="space-y-6">
        <SettingsForm initial={config} stripe={stripeEnabled()} />
        <PasswordForm email={session.user.email} />
      </div>
    </>
  )
}

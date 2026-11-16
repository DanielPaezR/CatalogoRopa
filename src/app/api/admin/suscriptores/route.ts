import { prisma } from '@/lib/db'
import { requireAdminApi } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/** Exporta los suscriptores del boletín en CSV. */
export async function GET() {
  const { error } = await requireAdminApi()
  if (error) return error
  const subs = await prisma.suscriptor.findMany({ orderBy: { createdAt: 'desc' } })
  const csv = ['email,fecha', ...subs.map((s) => `${s.email},${s.createdAt.toISOString()}`)].join('\n')
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="suscriptores.csv"',
    },
  })
}

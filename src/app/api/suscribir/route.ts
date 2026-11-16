import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

const schema = z.object({ email: z.string().trim().toLowerCase().email('Escribe un correo válido').max(160) })

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Correo inválido' }, { status: 400 })
  }
  await prisma.suscriptor.upsert({ where: { email: parsed.data.email }, update: {}, create: { email: parsed.data.email } })
  return NextResponse.json({ ok: true })
}

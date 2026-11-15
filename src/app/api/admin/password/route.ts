import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { requireAdminApi } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const schema = z.object({
  actual: z.string().min(1, 'Escribe tu contraseña actual'),
  nueva: z.string().min(8, 'La nueva contraseña debe tener al menos 8 caracteres').max(100),
  email: z.string().trim().toLowerCase().email('Correo inválido').optional(),
})

export async function PUT(req: NextRequest) {
  const { session, error } = await requireAdminApi()
  if (error) return error

  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }, { status: 400 })
  }

  const usuario = await prisma.usuario.findUnique({ where: { id: session.user.id } })
  if (!usuario || !(await bcrypt.compare(parsed.data.actual, usuario.password))) {
    return NextResponse.json({ error: 'La contraseña actual no es correcta' }, { status: 400 })
  }

  if (parsed.data.email && parsed.data.email !== usuario.email) {
    const ocupado = await prisma.usuario.findUnique({ where: { email: parsed.data.email } })
    if (ocupado) return NextResponse.json({ error: 'Ese correo ya está en uso' }, { status: 400 })
  }

  await prisma.usuario.update({
    where: { id: usuario.id },
    data: {
      password: await bcrypt.hash(parsed.data.nueva, 10),
      ...(parsed.data.email ? { email: parsed.data.email } : {}),
    },
  })
  return NextResponse.json({ ok: true })
}

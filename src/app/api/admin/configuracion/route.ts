import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { requireAdminApi } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const texto = (max: number) => z.string().trim().max(max)
const opcional = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullish()
    .transform((v) => (v ? v : null))

const schema = z.object({
  nombreTienda: texto(60).min(1, 'El nombre de la tienda es obligatorio'),
  eslogan: texto(120),
  anuncio: opcional(160),
  heroTitulo: texto(80),
  heroSubtitulo: texto(200),
  heroImagen: opcional(1000),
  editorialTitulo: texto(100),
  editorialTexto: texto(400),
  editorialImagen: opcional(1000),
  whatsapp: opcional(30),
  email: opcional(120),
  telefono: opcional(30),
  direccion: opcional(200),
  ciudad: opcional(80),
  horario: opcional(120),
  instagram: opcional(200),
  facebook: opcional(200),
  tiktok: opcional(200),
  costoEnvio: z.number().int().min(0),
  envioGratisDesde: z.number().int().min(0).nullish().transform((v) => (v ? v : null)),
  infoTransferencia: opcional(1000),
  pagoWhatsapp: z.boolean(),
  pagoContraentrega: z.boolean(),
  pagoTransferencia: z.boolean(),
})

export async function PUT(req: NextRequest) {
  const { error } = await requireAdminApi()
  if (error) return error

  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }, { status: 400 })
  }
  const config = await prisma.configuracion.upsert({
    where: { id: 1 },
    update: parsed.data,
    create: { id: 1, ...parsed.data },
  })
  return NextResponse.json(config)
}

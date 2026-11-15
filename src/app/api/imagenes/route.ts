import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdminApi } from '@/lib/auth'
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES } from '@/lib/images'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const { error } = await requireAdminApi()
  if (error) return error

  const form = await req.formData()
  const file = form.get('file')
  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: 'No se recibió ninguna imagen' }, { status: 400 })
  }
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Formato no soportado (usa JPG, PNG o WEBP)' }, { status: 400 })
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return NextResponse.json({ error: 'La imagen supera 4 MB' }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const imagen = await prisma.imagen.create({
    data: { mimeType: file.type, data: buffer },
    select: { id: true },
  })

  return NextResponse.json({ url: `/api/imagenes/${imagen.id}` }, { status: 201 })
}

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const imagen = await prisma.imagen.findUnique({ where: { id: params.id } })
  if (!imagen) return new NextResponse('No encontrada', { status: 404 })

  return new NextResponse(new Uint8Array(imagen.data), {
    headers: {
      'Content-Type': imagen.mimeType,
      'Content-Length': String(imagen.data.length),
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}

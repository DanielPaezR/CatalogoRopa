import { NextRequest, NextResponse } from 'next/server'
import { aplicarTransaccion, verificarEvento, type TransaccionWompi } from '@/lib/wompi'

export const dynamic = 'force-dynamic'

/** URL de eventos para configurar en el panel de Wompi. */
export async function POST(req: NextRequest) {
  const evento = await req.json().catch(() => null)
  if (!evento) return NextResponse.json({ error: 'Solicitud inválida' }, { status: 400 })

  if (!verificarEvento(evento, req.headers.get('x-event-checksum'))) {
    return NextResponse.json({ error: 'Firma inválida' }, { status: 401 })
  }

  if (evento.event === 'transaction.updated') {
    const tx = evento.data?.transaction as TransaccionWompi | undefined
    if (tx?.reference) await aplicarTransaccion(tx)
  }
  return NextResponse.json({ ok: true })
}

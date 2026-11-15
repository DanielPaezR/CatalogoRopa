import { NextRequest, NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { prisma } from '@/lib/db'
import { getStripe } from '@/lib/stripe'
import { cambiarEstadoPedido } from '@/lib/pedidos'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const stripe = getStripe()
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!stripe || !secret) {
    return NextResponse.json({ error: 'Stripe no está configurado' }, { status: 400 })
  }

  const signature = req.headers.get('stripe-signature')
  if (!signature) return NextResponse.json({ error: 'Falta la firma' }, { status: 400 })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(await req.text(), signature, secret)
  } catch (err) {
    console.error('Firma de webhook inválida:', err)
    return NextResponse.json({ error: 'Firma inválida' }, { status: 400 })
  }

  const session = event.data.object as Stripe.Checkout.Session
  const pedidoId = session.metadata?.pedidoId || session.client_reference_id
  if (!pedidoId) return NextResponse.json({ received: true })

  const pedido = await prisma.pedido.findUnique({ where: { id: pedidoId } })
  if (!pedido) return NextResponse.json({ received: true })

  switch (event.type) {
    case 'checkout.session.completed':
    case 'checkout.session.async_payment_succeeded':
      if (session.payment_status === 'paid') {
        await cambiarEstadoPedido(pedido.id, pedido.estado === 'PENDIENTE' || pedido.estado === 'CANCELADO' ? 'CONFIRMADO' : pedido.estado, { pagado: true })
      }
      break
    case 'checkout.session.expired':
    case 'checkout.session.async_payment_failed':
      if (!pedido.pagado && pedido.estado === 'PENDIENTE') {
        await cambiarEstadoPedido(pedido.id, 'CANCELADO')
      }
      break
  }

  return NextResponse.json({ received: true })
}

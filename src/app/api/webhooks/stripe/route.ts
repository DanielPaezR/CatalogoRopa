import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '../../../../lib/db';
import { headers } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = (await headers()).get('stripe-signature') as string;
  
  let event: Stripe.Event;
  
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }
  
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
      break;
      
    case 'checkout.session.expired':
      await handleCheckoutSessionExpired(event.data.object as Stripe.Checkout.Session);
      break;
      
    case 'payment_intent.succeeded':
      await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
      break;
      
    case 'payment_intent.payment_failed':
      await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
      break;
  }
  
  return NextResponse.json({ received: true });
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  try {
    const pedidoId = session.metadata?.pedido_id;
    
    if (!pedidoId) {
      console.error('No pedido_id in session metadata');
      return;
    }
    
    // Actualizar estado del pedido
    await prisma.pedido.update({
      where: { id: pedidoId },
      data: {
        estadoPago: 'PAGADO',
        stripePaymentId: session.payment_intent as string,
      }
    });
    
    // Obtener items del pedido para actualizar stock
    const pedido = await prisma.pedido.findUnique({
      where: { id: pedidoId },
      include: { items: true }
    });
    
    if (!pedido) return;
    
    // Actualizar stock de productos
    for (const item of pedido.items) {
      if (item.varianteId) {
        // Actualizar stock de variante
        await prisma.variante.update({
          where: { id: item.varianteId },
          data: {
            stock: { decrement: item.cantidad }
          }
        });
      }
      
      // Actualizar stock del producto principal
      await prisma.producto.update({
        where: { id: item.productoId },
        data: {
          stock: { decrement: item.cantidad }
        }
      });
    }
    
    // Enviar email de confirmación (aquí integrarías un servicio de email)
    console.log(`Pedido ${pedidoId} completado y stock actualizado`);
    
  } catch (error) {
    console.error('Error handling checkout session completed:', error);
  }
}

async function handleCheckoutSessionExpired(session: Stripe.Checkout.Session) {
  const pedidoId = session.metadata?.pedido_id;
  
  if (pedidoId) {
    await prisma.pedido.update({
      where: { id: pedidoId },
      data: { estadoPago: 'FALLIDO' }
    });
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  // Aquí puedes manejar lógica adicional cuando el pago se completa
  console.log(`Payment ${paymentIntent.id} succeeded`);
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  const pedido = await prisma.pedido.findFirst({
    where: { stripePaymentId: paymentIntent.id }
  });
  
  if (pedido) {
    await prisma.pedido.update({
      where: { id: pedido.id },
      data: { estadoPago: 'FALLIDO' }
    });
  }
}
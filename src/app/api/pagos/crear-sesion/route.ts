import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar datos del carrito
    const { items, customer, shippingAddress, metadata } = body;
    
    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'El carrito está vacío' },
        { status: 400 }
      );
    }
    
    // Verificar stock y obtener detalles actualizados
    const line_items = [];
    const productosActualizados = [];
    
    for (const item of items) {
      const producto = await prisma.producto.findUnique({
        where: { id: item.id },
        include: { variantes: true }
      });
      
      if (!producto) {
        return NextResponse.json(
          { error: `Producto ${item.nombre} no encontrado` },
          { status: 404 }
        );
      }
      
      if (producto.stock < item.cantidad) {
        return NextResponse.json(
          { error: `Stock insuficiente para ${producto.nombre}. Disponible: ${producto.stock}` },
          { status: 400 }
        );
      }
      
      // Determinar precio de la variante si existe
      let precio = parseFloat(producto.precio.toString());
      let varianteId = null;
      
      if (item.talla || item.color) {
        const variante = producto.variantes.find((v: any) => 
          v.talla === item.talla && v.color === item.color
        );
        
        if (variante) {
          if (variante.stock < item.cantidad) {
            return NextResponse.json(
              { error: `Stock insuficiente para la variante seleccionada de ${producto.nombre}` },
              { status: 400 }
            );
          }
          precio = parseFloat(variante.precio.toString());
          varianteId = variante.id;
        }
      }
      
      productosActualizados.push({
        productoId: producto.id,
        varianteId,
        nombre: producto.nombre,
        precio,
        cantidad: item.cantidad,
        talla: item.talla,
        color: item.color,
        imagen: item.imagen,
        stockActual: producto.stock,
        varianteStock: varianteId ? 
          producto.variantes.find((v: any) => v.id === varianteId)?.stock || 0 : 0
      });
      
      // Crear item para Stripe
      line_items.push({
        price_data: {
          currency: 'cop',
          product_data: {
            name: producto.nombre,
            images: [item.imagen],
            metadata: {
              producto_id: producto.id,
              variante_id: varianteId || '',
              talla: item.talla || '',
              color: item.color || ''
            }
          },
          unit_amount: Math.round(precio * 100),
        },
        quantity: item.cantidad,
      });
    }
    
    // Calcular totales
    const subtotal = productosActualizados.reduce(
      (sum, item) => sum + (item.precio * item.cantidad), 0
    );
    
    // Configuración de envío (podría venir de la base de datos)
    const envio = subtotal > 50000 ? 0 : 10000;
    const total = subtotal + envio;
    
    // Crear pedido temporal en la base de datos
    const pedido = await prisma.pedido.create({
      data: {
        numeroPedido: `PED-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        clienteEmail: customer.email,
        clienteNombre: customer.name,
        clienteTelefono: customer.phone,
        direccionEnvio: shippingAddress,
        subtotal: subtotal,
        envio: envio,
        total: total,
        metodoPago: 'TARJETA',
        estadoPedido: 'PENDIENTE',
        estadoPago: 'PENDIENTE',
        items: {
          create: productosActualizados.map(item => ({
            productoId: item.productoId,
            varianteId: item.varianteId,
            nombre: item.nombre,
            precio: item.precio,
            cantidad: item.cantidad,
            subtotal: item.precio * item.cantidad,
            talla: item.talla,
            color: item.color,
          }))
        }
      },
      include: { items: true }
    });
    
    // Crear sesión de pago en Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_URL}/pago-exitoso?session_id={CHECKOUT_SESSION_ID}&pedido_id=${pedido.id}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/carrito`,
      customer_email: customer.email,
      shipping_address_collection: {
        allowed_countries: ['CO', 'US', 'MX', 'ES'],
      },
      metadata: {
        pedido_id: pedido.id,
        customer: JSON.stringify(customer),
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: envio * 100,
              currency: 'cop',
            },
            display_name: envio === 0 ? 'Envío gratis' : 'Envío estándar',
            delivery_estimate: {
              minimum: {
                unit: 'business_day',
                value: 3,
              },
              maximum: {
                unit: 'business_day',
                value: 7,
              },
            },
          },
        },
      ],
    });
    
    // Actualizar pedido con ID de sesión de Stripe
    await prisma.pedido.update({
      where: { id: pedido.id },
      data: { stripeSessionId: session.id }
    });
    
    return NextResponse.json({ 
      sessionId: session.id,
      pedidoId: pedido.id,
      url: session.url 
    });
    
  } catch (error) {
    console.error('Error creating payment session:', error);
    return NextResponse.json(
      { error: 'Error al crear sesión de pago' },
      { status: 500 }
    );
  }
}
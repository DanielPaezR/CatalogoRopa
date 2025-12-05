import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../lib/auth'
import { prisma } from '../../../../../lib/db'
import { z } from 'zod'

const updateOrderSchema = z.object({
  estadoPedido: z.enum(['PENDIENTE', 'PROCESANDO', 'ENVIADO', 'ENTREGADO', 'CANCELADO']).optional(),
  estadoPago: z.enum(['PENDIENTE', 'PAGADO', 'FALLIDO', 'REEMBOLSADO']).optional(),
  trackingNumber: z.string().optional(),
  notas: z.string().optional(),
  fechaEnvio: z.string().optional(),
}).partial()

interface Params {
  params: {
    id: string
  }
}

export async function GET(
  request: NextRequest,
  { params }: Params
) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const pedido = await prisma.pedido.findUnique({
      where: { id: params.id },
      include: {
        items: {
          include: {
            producto: {
              select: {
                id: true,
                nombre: true,
                sku: true,
                imagenes: true,
                precio: true,
              }
            }
          }
        },
        usuario: {
          select: {
            id: true,
            nombre: true,
            email: true,
            telefono: true,
            direccion: true,
            ciudad: true,
            pais: true,
            codigoPostal: true,
          }
        }
      }
    })

    if (!pedido) {
      return NextResponse.json(
        { error: 'Pedido no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(pedido)

  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { error: 'Error al obtener pedido' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: Params
) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Validar datos
    const validatedData = updateOrderSchema.parse(body)

    // Verificar si el pedido existe
    const existingOrder = await prisma.pedido.findUnique({
      where: { id: params.id }
    })

    if (!existingOrder) {
      return NextResponse.json(
        { error: 'Pedido no encontrado' },
        { status: 404 }
      )
    }

    // Preparar datos para actualizar
    const updateData: any = { ...validatedData }

    if (validatedData.fechaEnvio) {
      updateData.fechaEnvio = new Date(validatedData.fechaEnvio)
    }

    // Actualizar pedido
    const pedido = await prisma.pedido.update({
      where: { id: params.id },
      data: updateData,
      include: {
        items: {
          include: {
            producto: true
          }
        }
      }
    })

    // Si el pedido fue marcado como ENVIADO, enviar notificación por email
    if (validatedData.estadoPedido === 'ENVIADO' && pedido.clienteEmail) {
      await sendShippingNotification(pedido)
    }

    // Si el pedido fue marcado como ENTREGADO, actualizar métricas
    if (validatedData.estadoPedido === 'ENTREGADO') {
      await updateMetrics(pedido)
    }

    return NextResponse.json(pedido)

  } catch (error) {
    console.error('Error updating order:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Error al actualizar pedido' },
      { status: 500 }
    )
  }
}

async function sendShippingNotification(pedido: any) {
  // Aquí implementarías el envío de email
  // Por ejemplo, usando nodemailer o un servicio como SendGrid
  console.log(`Enviando notificación de envío para pedido ${pedido.numeroPedido} a ${pedido.clienteEmail}`)
}

async function updateMetrics(pedido: any) {
  // Aquí actualizarías métricas o estadísticas
  console.log(`Actualizando métricas para pedido entregado: ${pedido.numeroPedido}`)
}
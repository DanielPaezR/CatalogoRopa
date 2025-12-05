import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'
import { prisma } from '../../../../lib/db'
import { z } from 'zod'

const updateProductSchema = z.object({
  nombre: z.string().min(3).max(200).optional(),
  descripcionCorta: z.string().min(10).max(500).optional(),
  descripcionLarga: z.string().optional(),
  precio: z.number().min(0).optional(),
  precioOriginal: z.number().optional().nullable(),
  categoriaId: z.string().optional(),
  stock: z.number().min(0).optional(),
  stockMinimo: z.number().min(1).optional(),
  imagenes: z.array(z.string().url()).optional(),
  colores: z.array(z.string()).optional(),
  tallas: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  destacado: z.boolean().optional(),
  activo: z.boolean().optional(),
  peso: z.number().optional(),
  dimensiones: z.object({
    largo: z.number().optional(),
    ancho: z.number().optional(),
    alto: z.number().optional(),
  }).optional(),
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

    const producto = await prisma.producto.findUnique({
      where: { id: params.id },
      include: {
        categoria: true,
        variantes: true,
        _count: {
          select: { pedidoItems: true }
        }
      }
    })

    if (!producto) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(producto)

  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Error al obtener producto' },
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
    const validatedData = updateProductSchema.parse(body)

    // Verificar si el producto existe
    const existingProduct = await prisma.producto.findUnique({
      where: { id: params.id }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    // Actualizar producto
    const producto = await prisma.producto.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        categoria: true,
        variantes: true,
      }
    })

    return NextResponse.json(producto)

  } catch (error) {
    console.error('Error updating product:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Error al actualizar producto' },
      { status: 500 }
    )
  }
}

export async function PATCH(
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
    
    // Validar datos mínimos para PATCH
    const patchSchema = z.object({
      activo: z.boolean().optional(),
      destacado: z.boolean().optional(),
      stock: z.number().min(0).optional(),
    }).partial()

    const validatedData = patchSchema.parse(body)

    // Verificar si el producto existe
    const existingProduct = await prisma.producto.findUnique({
      where: { id: params.id }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    // Actualizar producto
    const producto = await prisma.producto.update({
      where: { id: params.id },
      data: validatedData,
    })

    return NextResponse.json(producto)

  } catch (error) {
    console.error('Error patching product:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Error al actualizar producto' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    // Verificar si el producto existe
    const existingProduct = await prisma.producto.findUnique({
      where: { id: params.id },
      include: {
        pedidoItems: true
      }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    // Verificar si hay pedidos asociados
    if (existingProduct.pedidoItems.length > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar el producto porque tiene pedidos asociados' },
        { status: 400 }
      )
    }

    // Eliminar variantes primero
    await prisma.variante.deleteMany({
      where: { productoId: params.id }
    })

    // Eliminar producto
    await prisma.producto.delete({
      where: { id: params.id }
    })

    return NextResponse.json(
      { message: 'Producto eliminado exitosamente' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Error al eliminar producto' },
      { status: 500 }
    )
  }
}
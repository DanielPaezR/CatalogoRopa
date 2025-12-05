import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../lib/auth'
import { prisma } from '../../../../../lib/db'
import { z } from 'zod'

const categoriaSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  slug: z.string().min(1, 'El slug es requerido').regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug inválido'),
  descripcion: z.string().optional(),
  imagen: z.string().optional(),
  orden: z.number().int().min(0).default(0),
  activo: z.boolean().default(true),
})

const updateCategoriaSchema = categoriaSchema.partial()

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

    const categoria = await prisma.categoria.findUnique({
      where: { id: params.id },
      include: {
        productos: {
          select: {
            id: true,
            nombre: true,
            sku: true,
            precio: true,
            stock: true,
            activo: true,
          },
          take: 10,
        },
        _count: {
          select: { productos: true }
        }
      }
    })

    if (!categoria) {
      return NextResponse.json(
        { error: 'Categoría no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(categoria)

  } catch (error) {
    console.error('Error fetching category:', error)
    return NextResponse.json(
      { error: 'Error al obtener categoría' },
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
    const validatedData = updateCategoriaSchema.parse(body)

    // Verificar si la categoría existe
    const existingCategory = await prisma.categoria.findUnique({
      where: { id: params.id }
    })

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Categoría no encontrada' },
        { status: 404 }
      )
    }

    // Si se cambia el nombre, actualizar el slug
    let updateData = { ...validatedData }
    if (validatedData.nombre && validatedData.nombre !== existingCategory.nombre) {
      const newSlug = validatedData.nombre
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()

      // Verificar slug único
      let uniqueSlug = newSlug
      let counter = 1
      while (await prisma.categoria.findFirst({
        where: {
          slug: uniqueSlug,
          id: { not: params.id }
        }
      })) {
        uniqueSlug = `${newSlug}-${counter}`
        counter++
      }

      updateData.slug = uniqueSlug
    }

    // Actualizar categoría
    const categoria = await prisma.categoria.update({
      where: { id: params.id },
      data: updateData,
    })

    return NextResponse.json(categoria)

  } catch (error) {
    console.error('Error updating category:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Error al actualizar categoría' },
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

    // Verificar si la categoría existe
    const existingCategory = await prisma.categoria.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { productos: true }
        }
      }
    })

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Categoría no encontrada' },
        { status: 404 }
      )
    }

    // Verificar si hay productos asociados
    if (existingCategory._count.productos > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar la categoría porque tiene productos asociados' },
        { status: 400 }
      )
    }

    // Eliminar categoría
    await prisma.categoria.delete({
      where: { id: params.id }
    })

    return NextResponse.json(
      { message: 'Categoría eliminada exitosamente' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json(
      { error: 'Error al eliminar categoría' },
      { status: 500 }
    )
  }
}
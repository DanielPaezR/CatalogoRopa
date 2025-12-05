import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'
import { prisma } from '../../../../lib/db'
import { z } from 'zod'

// Esquema de validación
const categoriaSchema = z.object({
  nombre: z.string().min(2).max(100),
  descripcion: z.string().optional(),
  imagen: z.string().url().optional(),
  orden: z.number().int().min(0).default(0),
  activo: z.boolean().default(true),
})

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const categorias = await prisma.categoria.findMany({
      include: {
        _count: {
          select: { productos: true }
        }
      },
      orderBy: [
        { orden: 'asc' },
        { nombre: 'asc' },
      ],
    })

    return NextResponse.json(categorias)

  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Error al obtener categorías' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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
    const validatedData = categoriaSchema.parse(body)

    // Generar slug automático
    const slug = validatedData.nombre
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()

    // Verificar si ya existe una categoría con ese nombre
    const existingCategory = await prisma.categoria.findFirst({
      where: { nombre: validatedData.nombre }
    })

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Ya existe una categoría con ese nombre' },
        { status: 400 }
      )
    }

    // Verificar slug único
    let uniqueSlug = slug
    let counter = 1
    while (await prisma.categoria.findUnique({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${slug}-${counter}`
      counter++
    }

    // Crear categoría
    const categoria = await prisma.categoria.create({
      data: {
        ...validatedData,
        slug: uniqueSlug,
      },
    })

    return NextResponse.json(categoria, { status: 201 })

  } catch (error) {
    console.error('Error creating category:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Error al crear categoría' },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'
import { prisma } from '../../../lib/db'
import { z } from 'zod'

// Esquema de validación para crear producto
const createProductSchema = z.object({
  nombre: z.string().min(3).max(200),
  descripcionCorta: z.string().min(10).max(500),
  descripcionLarga: z.string().optional(),
  precio: z.number().min(0),
  precioOriginal: z.number().optional().nullable(),
  categoriaId: z.string(),
  sku: z.string().min(3).max(50),
  stock: z.number().min(0),
  stockMinimo: z.number().min(1).default(10),
  imagenes: z.array(z.string().url()).optional().default([]),
  colores: z.array(z.string()).optional().default([]),
  tallas: z.array(z.string()).optional().default([]),
  tags: z.array(z.string()).optional().default([]),
  destacado: z.boolean().default(false),
  activo: z.boolean().default(true),
  peso: z.number().optional(),
  dimensiones: z.object({
    largo: z.number().optional(),
    ancho: z.number().optional(),
    alto: z.number().optional(),
  }).optional(),
  variantes: z.array(z.object({
    talla: z.string(),
    color: z.string(),
    stock: z.number().min(0),
    precio: z.number().min(0),
    sku: z.string(),
  })).optional().default([]),
})

// Esquema de validación para actualizar producto
const updateProductSchema = createProductSchema.partial()

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

    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search')
    const categoria = searchParams.get('categoria')
    const stock = searchParams.get('stock')
    const activo = searchParams.get('activo')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const skip = (page - 1) * limit

    // Construir filtros
    const where: any = {}

    if (search) {
      where.OR = [
        { nombre: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { descripcionCorta: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (categoria) {
      where.categoriaId = categoria
    }

    if (stock) {
      if (stock === 'bajo') {
        where.stock = { lt: 10 }
      } else if (stock === 'agotado') {
        where.stock = 0
      } else if (stock === 'disponible') {
        where.stock = { gt: 0 }
      }
    }

    if (activo === 'true' || activo === 'false') {
      where.activo = activo === 'true'
    }

    // Obtener productos
    const [productos, total] = await Promise.all([
      prisma.producto.findMany({
        where,
        include: {
          categoria: {
            select: { nombre: true }
          },
          variantes: true,
          _count: {
            select: { pedidoItems: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.producto.count({ where })
    ])

    return NextResponse.json({
      productos,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      }
    })

  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Error al obtener productos' },
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
    const validatedData = createProductSchema.parse(body)
    
    // Generar slug automático
    const slug = validatedData.nombre
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()

    // Verificar si el SKU ya existe
    const existingSku = await prisma.producto.findUnique({
      where: { sku: validatedData.sku }
    })

    if (existingSku) {
      return NextResponse.json(
        { error: 'El SKU ya está en uso' },
        { status: 400 }
      )
    }

    // Crear producto
    const producto = await prisma.producto.create({
      data: {
        ...validatedData,
        slug: `${slug}-${Date.now().toString(36)}`,
        imagenes: validatedData.imagenes.length > 0 
          ? validatedData.imagenes 
          : ['https://images.unsplash.com/photo-1523381210434-271e8be1f52b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
      },
      include: {
        categoria: true,
        variantes: true,
      }
    })

    // Crear variantes si existen
    if (validatedData.variantes && validatedData.variantes.length > 0) {
      await prisma.variante.createMany({
        data: validatedData.variantes.map(variante => ({
          ...variante,
          productoId: producto.id,
        }))
      })
    }

    return NextResponse.json(producto, { status: 201 })

  } catch (error) {
    console.error('Error creating product:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Error al crear producto' },
      { status: 500 }
    )
  }
}
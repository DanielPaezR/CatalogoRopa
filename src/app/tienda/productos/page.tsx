import { prisma } from '@/lib/db'
import ProductFilters from '@/components/tienda/ProductFilters'
import ProductoCard from '@/components/tienda/ProductoCard'
import { Suspense } from 'react'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export const revalidate = 60

interface ProductosPageProps {
  searchParams: {
    categoria?: string
    subcategoria?: string
    search?: string
    minPrice?: string
    maxPrice?: string
    page?: string
    ofertas?: string
    destacados?: string
    tallas?: string
    colores?: string
  }
}

export default async function ProductosPage({
  searchParams,
}: ProductosPageProps) {
  const {
    categoria,
    subcategoria,
    search,
    minPrice,
    maxPrice,
    page = '1',
    ofertas,
    destacados,
    tallas,
    colores,
  } = searchParams

  const pageNum = parseInt(page)
  const limit = 12
  const skip = (pageNum - 1) * limit

  // Construir filtros
  const where: any = {
    activo: true,
  }

  if (categoria && categoria !== 'todas') {
    const categoriaObj = await prisma.categoria.findFirst({
      where: { slug: categoria, activo: true },
    })
    if (categoriaObj) {
      where.categoriaId = categoriaObj.id
    }
  }

  if (subcategoria) {
    where.subcategoria = subcategoria
  }

  if (search) {
    where.OR = [
      { nombre: { contains: search, mode: 'insensitive' } },
      { descripcionCorta: { contains: search, mode: 'insensitive' } },
      { tags: { has: search.toLowerCase() } },
    ]
  }

  if (minPrice || maxPrice) {
    where.precio = {}
    if (minPrice) {
      where.precio.gte = parseFloat(minPrice)
    }
    if (maxPrice) {
      where.precio.lte = parseFloat(maxPrice)
    }
  }

  if (ofertas === 'true') {
    where.precioOriginal = { not: null }
  }

  if (destacados === 'true') {
    where.destacado = true
  }

  if (tallas) {
    const tallasArray = tallas.split(',')
    where.tallas = { hasSome: tallasArray }
  }

  if (colores) {
    const coloresArray = colores.split(',')
    where.colores = { hasSome: coloresArray }
  }

  // Obtener productos y total
  const [productos, total, categorias] = await Promise.all([
    prisma.producto.findMany({
      where,
      include: {
        categoria: {
          select: { nombre: true, slug: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.producto.count({ where }),
    prisma.categoria.findMany({
      where: { activo: true },
      orderBy: { orden: 'asc' },
    }),
  ])

  const totalPages = Math.ceil(total / limit)

  // Obtener rangos de precios
  const priceRange = await prisma.producto.aggregate({
    where: { activo: true },
    _min: { precio: true },
    _max: { precio: true },
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Nuestra Colección
        </h1>
        <p className="text-gray-600">
          {total} productos encontrados
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar con filtros */}
        <div className="lg:col-span-1">
          <Suspense fallback={<LoadingSpinner />}>
            <ProductFilters
              categorias={categorias}
              priceRange={{
                min: priceRange._min.precio
                  ? parseFloat(priceRange._min.precio.toString())
                  : 0,
                max: priceRange._max.precio
                  ? parseFloat(priceRange._max.precio.toString())
                  : 1000000,
              }}
              currentFilters={searchParams}
            />
          </Suspense>
        </div>

        {/* Lista de productos */}
        <div className="lg:col-span-3">
          {productos.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold mb-2">
                No se encontraron productos
              </h3>
              <p className="text-gray-600 mb-8">
                Intenta con otros filtros o busca algo diferente
              </p>
              <a
                href="/productos"
                className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Ver todos los productos
              </a>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {productos.map((producto) => (
                  <ProductoCard
                    key={producto.id}
                    producto={{
                      ...producto,
                      categoria: producto.categoria,
                    }}
                  />
                ))}
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-12 space-x-2">
                  <a
                    href={`/productos?${new URLSearchParams({
                      ...searchParams,
                      page: (pageNum - 1).toString(),
                    }).toString()}`}
                    className={`px-4 py-2 border rounded-lg ${
                      pageNum === 1
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    aria-disabled={pageNum === 1}
                  >
                    Anterior
                  </a>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageToShow: number
                    if (totalPages <= 5) {
                      pageToShow = i + 1
                    } else if (pageNum <= 3) {
                      pageToShow = i + 1
                    } else if (pageNum >= totalPages - 2) {
                      pageToShow = totalPages - 4 + i
                    } else {
                      pageToShow = pageNum - 2 + i
                    }

                    return (
                      <a
                        key={pageToShow}
                        href={`/productos?${new URLSearchParams({
                          ...searchParams,
                          page: pageToShow.toString(),
                        }).toString()}`}
                        className={`px-4 py-2 border rounded-lg ${
                          pageNum === pageToShow
                            ? 'bg-primary-600 text-white border-primary-600'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pageToShow}
                      </a>
                    )
                  })}

                  <a
                    href={`/productos?${new URLSearchParams({
                      ...searchParams,
                      page: (pageNum + 1).toString(),
                    }).toString()}`}
                    className={`px-4 py-2 border rounded-lg ${
                      pageNum === totalPages
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    aria-disabled={pageNum === totalPages}
                  >
                    Siguiente
                  </a>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
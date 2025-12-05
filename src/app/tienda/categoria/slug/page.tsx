import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import ProductoCard from '@/components/tienda/ProductoCard'
import ProductFilters from '@/components/tienda/ProductFilters'

interface CategoriaPageProps {
  params: {
    slug: string
  }
  searchParams: {
    page?: string
    minPrice?: string
    maxPrice?: string
    search?: string
    ofertas?: string
    destacados?: string
    tallas?: string
    colores?: string
  }
}

export const revalidate = 60

export async function generateMetadata({ params }: CategoriaPageProps) {
  const categoria = await prisma.categoria.findUnique({
    where: { slug: params.slug, activo: true },
  })

  if (!categoria) {
    return {
      title: 'Categoría no encontrada',
    }
  }

  return {
    title: `${categoria.nombre} | ModaStyle`,
    description: categoria.descripcion || `Explora nuestra colección de ${categoria.nombre.toLowerCase()}`,
  }
}

export default async function CategoriaPage({ 
  params, 
  searchParams 
}: CategoriaPageProps) {
  const categoria = await prisma.categoria.findUnique({
    where: { slug: params.slug, activo: true },
  })

  if (!categoria) {
    notFound()
  }

  const {
    page = '1',
    minPrice,
    maxPrice,
    search,
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
    categoriaId: categoria.id,
    activo: true,
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
  const [productos, total, categorias, priceRange] = await Promise.all([
    prisma.producto.findMany({
      where,
      include: {
        categoria: true,
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
    prisma.producto.aggregate({
      where: { categoriaId: categoria.id, activo: true },
      _min: { precio: true },
      _max: { precio: true },
    }),
  ])

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header de categoría */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {categoria.nombre}
        </h1>
        {categoria.descripcion && (
          <p className="text-gray-600 max-w-3xl">
            {categoria.descripcion}
          </p>
        )}
        <p className="text-gray-500 mt-2">
          {total} productos encontrados
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar con filtros */}
        <div className="lg:col-span-1">
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
            currentFilters={{
              ...searchParams,
              categoria: params.slug,
            }}
          />
        </div>

        {/* Lista de productos */}
        <div className="lg:col-span-3">
          {productos.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold mb-2">
                No se encontraron productos en esta categoría
              </h3>
              <p className="text-gray-600 mb-8">
                Intenta con otros filtros o explora nuestras otras categorías
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
              {/* Ordenamiento */}
              <div className="flex justify-between items-center mb-6">
                <div className="text-sm text-gray-600">
                  Mostrando {(pageNum - 1) * limit + 1}-
                  {Math.min(pageNum * limit, total)} de {total} productos
                </div>
                <div className="flex items-center space-x-4">
                  <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                    <option value="newest">Más recientes</option>
                    <option value="price-low">Precio: menor a mayor</option>
                    <option value="price-high">Precio: mayor a menor</option>
                    <option value="name">Nombre A-Z</option>
                  </select>
                </div>
              </div>

              {/* Grid de productos */}
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
                    href={`/categoria/${params.slug}?${new URLSearchParams({
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
                        href={`/categoria/${params.slug}?${new URLSearchParams({
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
                    href={`/categoria/${params.slug}?${new URLSearchParams({
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

      {/* Subcategorías si existen */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Explora más en {categoria.nombre}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['Camisetas', 'Pantalones', 'Chaquetas', 'Accesorios'].map((subcat) => (
            <a
              key={subcat}
              href={`/categoria/${params.slug}?subcategoria=${subcat.toLowerCase()}`}
              className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow"
            >
              <div className="text-3xl mb-3">
                {getSubcategoryIcon(subcat)}
              </div>
              <h3 className="font-semibold text-gray-900">{subcat}</h3>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

function getSubcategoryIcon(subcat: string): string {
  const icons: Record<string, string> = {
    'Camisetas': '👕',
    'Pantalones': '👖',
    'Chaquetas': '🧥',
    'Accesorios': '👜',
    'Zapatos': '👟',
    'Vestidos': '👗',
  }
  return icons[subcat] || '👕'
}
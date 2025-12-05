import { prisma } from '../../../../lib/db';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import ProductModal from '../../../../components/tienda/ProductModal';
import { ProductoWithRelations } from '../../../../types';
import { formatPrice, calculateDiscount, getStockStatus } from '../../../../lib/utils';
export const dynamic = 'force-dynamic';

interface ProductoPageProps {
  params: {
    slug: string
  }
}

export const revalidate = 60

export async function generateMetadata({ params }: ProductoPageProps) {
  const producto = await prisma.producto.findUnique({
    where: { slug: params.slug, activo: true },
    include: { categoria: true },
  })

  if (!producto) {
    return {
      title: 'Producto no encontrado',
    }
  }

  return {
    title: `${producto.nombre} | ModaStyle`,
    description: producto.descripcionCorta,
    openGraph: {
      images: producto.imagenes[0] ? [producto.imagenes[0]] : [],
    },
  }
}

export default async function ProductoPage({ params }: ProductoPageProps) {
  const producto = await prisma.producto.findUnique({
    where: { slug: params.slug, activo: true },
    include: {
      categoria: true,
      variantes: true,
    },
  }) as ProductoWithRelations | null

  if (!producto) {
    notFound()
  }

  // Obtener productos relacionados
  const productosRelacionados = await prisma.producto.findMany({
    where: {
      categoriaId: producto.categoriaId,
      activo: true,
      id: { not: producto.id },
    },
    include: { categoria: true },
    take: 4,
  })

  const precio = parseFloat(producto.precio.toString())
  const precioOriginal = producto.precioOriginal 
    ? parseFloat(producto.precioOriginal.toString())
    : null
  const descuento = precioOriginal ? calculateDiscount(precioOriginal, precio) : 0
  const stockStatus = getStockStatus(producto.stock)

  // Calcular promedios de tallas si hay variantes
  const tallasDisponibles = Array.from(new Set(producto.variantes
    .filter((v: any) => v.stock > 0)
    .map((v: any) => v.talla)
    .concat(producto.tallas)
  )).filter(Boolean)

  const coloresDisponibles = Array.from(new Set(producto.variantes
    .filter((v: any) => v.stock > 0)
    .map((v: any) => v.color)
    .concat(producto.colores)
  )).filter(Boolean)

  function getStockColor(status: string): string {
    switch(status) {
      case 'agotado': return 'text-red-600'
      case 'critico': return 'text-red-600'
      case 'bajo': return 'text-yellow-600'
      default: return 'text-green-600'
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="mb-6 text-sm">
        <ol className="flex items-center space-x-2">
          <li>
            <a href="/" className="text-gray-500 hover:text-gray-700">
              Inicio
            </a>
          </li>
          <li className="text-gray-400">/</li>
          <li>
            <a 
              href={`/categoria/${producto.categoria.slug}`} 
              className="text-gray-500 hover:text-gray-700"
            >
              {producto.categoria.nombre}
            </a>
          </li>
          <li className="text-gray-400">/</li>
          <li className="text-gray-900 font-medium truncate">
            {producto.nombre}
          </li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Galería de imágenes */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
            <Image
              src={producto.imagenes[0] || '/images/placeholder.jpg'}
              alt={producto.nombre}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
            {descuento > 0 && (
              <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                -{descuento}%
              </div>
            )}
          </div>
          
          {producto.imagenes.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {producto.imagenes.slice(0, 3).map((img: string, idx: number) => (
                <div
                  key={idx}
                  className="relative aspect-square overflow-hidden rounded-lg bg-gray-100 cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <Image
                    src={producto.imagenes[0] || ''}
                    alt={`${producto.nombre} - Imagen ${idx + 2}`}
                    fill
                    className="object-cover"
                    sizes="25vw"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Información del producto */}
        <div>
          <div className="mb-4">
            <span className="text-sm text-gray-500">
              {producto.categoria.nombre}
            </span>
            <h1 className="text-3xl font-bold text-gray-900 mt-1">
              {producto.nombre}
            </h1>
            <div className="flex items-center mt-2">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className="w-5 h-5 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="ml-2 text-sm text-gray-600">
                  (25 reseñas)
                </span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center space-x-3">
              <span className="text-3xl font-bold text-gray-900">
                {formatPrice(precio)}
              </span>
              {precioOriginal && (
                <>
                  <span className="text-xl text-gray-500 line-through">
                    {formatPrice(precioOriginal)}
                  </span>
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-bold">
                    Ahorras {formatPrice(precioOriginal - precio)}
                  </span>
                </>
              )}
            </div>
            
            <div className="mt-2">
              <span className={`font-medium ${getStockColor(stockStatus)}`}>{stockStatus}</span>
              {producto.stock > 0 && (
                <span className="text-gray-600 text-sm ml-2">
                  • SKU: {producto.sku}
                </span>
              )}
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3">Descripción</h3>
            <div className="prose max-w-none text-gray-700">
              {producto.descripcionLarga?.split('\n').map((paragraph: string , idx: number) => (
                <p key={idx} className="mb-3">{paragraph}</p>
              ))}
            </div>
          </div>

          {/* Selectores de variantes */}
          {(tallasDisponibles.length > 0 || coloresDisponibles.length > 0) && (
            <div className="space-y-6 mb-8">
              {tallasDisponibles.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Talla</h4>
                  <div className="flex flex-wrap gap-2">
                    {tallasDisponibles.map((talla) => {
                      const varianteStock = producto.variantes
                        .filter((v: any) => v.talla === talla)
                        .reduce((sum: number, v: any) => sum + v.stock, 0)
                      
                      const stockTotal = varianteStock || producto.stock
                      const disponible = stockTotal > 0
                      
                      return (
                        <button
                          key={talla as string | number}  // <-- CORRECCIÓN
                          disabled={!disponible}
                          className={`px-4 py-2 border rounded-lg font-medium ${
                            disponible
                              ? 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                              : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                          }`}
                          title={disponible ? `${stockTotal} disponibles` : 'Agotado'}
                        >
                          {talla as React.ReactNode}  {/* <-- CORRECCIÓN */}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {coloresDisponibles.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Color</h4>
                  <div className="flex flex-wrap gap-3">
                    {coloresDisponibles.map((color) => {
                      const varianteStock = producto.variantes
                        .filter((v: any) => v.color === color)
                        .reduce((sum: number, v: any) => sum + v.stock, 0)
                      
                      const disponible = varianteStock > 0
                      
                      return (
                        <button
                          key={color as string | number}  // <-- CORRECCIÓN
                          disabled={!disponible}
                          className={`flex items-center space-x-2 px-4 py-2 border rounded-lg ${
                            disponible
                              ? 'border-gray-300 hover:border-blue-500'
                              : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          <span
                            className="w-6 h-6 rounded-full border"
                            style={{ backgroundColor: getColorHex(color as string) }}  // <-- CORRECCIÓN
                          />
                          <span>{color as React.ReactNode}</span>  {/* <-- CORRECCIÓN */}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Botones de acción */}
          <ProductModal producto={producto} />
        </div>
      </div>

      {/* Información adicional */}
      <div className="border-t pt-8 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Pago seguro
            </h3>
            <p className="text-gray-600">
              Tu información está protegida con encriptación de 256-bit
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Devolución gratuita
            </h3>
            <p className="text-gray-600">
              30 días para devolver o cambiar tu producto
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Envío rápido
            </h3>
            <p className="text-gray-600">
              Recibe tu pedido en 3-5 días hábiles
            </p>
          </div>
        </div>
      </div>

      {/* Productos relacionados */}
      {productosRelacionados.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Productos relacionados</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {productosRelacionados.map((relacionado: any) => (
              <div
                key={relacionado.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <a href={`/productos/${relacionado.slug}`}>
                  <div className="aspect-square relative overflow-hidden bg-gray-100">
                    <Image
                      src={relacionado.imagenes[0] || '/images/placeholder.jpg'}
                      alt={relacionado.nombre}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 hover:text-primary-600 line-clamp-2">
                      {relacionado.nombre}
                    </h3>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-lg font-bold text-gray-900">
                        {formatPrice(parseFloat(relacionado.precio.toString()))}
                      </span>
                      <span className="text-sm text-gray-500">
                        {getStockStatus(relacionado.stock)}
                      </span>
                    </div>
                  </div>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function getColorHex(color: string): string {
  const colorMap: Record<string, string> = {
    Negro: '#000000',
    Blanco: '#FFFFFF',
    Rojo: '#DC2626',
    Azul: '#2563EB',
    Verde: '#16A34A',
    Gris: '#6B7280',
    Beige: '#D6D3D1',
    Rosa: '#EC4899',
    Amarillo: '#FBBF24',
    Marrón: '#92400E',
  }
  return colorMap[color] || '#CCCCCC'
}
import { prisma } from '@/lib/db';
import ProductoCard from '@/components/tienda/ProductoCard';
import CategoriasNav from '@/components/tienda/CategoriasNav';
import HeroSlider from '@/components/tienda/HeroSlider';

export const revalidate = 60; // Revalidar cada 60 segundos

export default async function HomePage() {
  const [productosDestacados, categorias] = await Promise.all([
    prisma.producto.findMany({
      where: { 
        destacado: true,
        activo: true,
        stock: { gt: 0 }
      },
      include: { categoria: true },
      take: 12,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.categoria.findMany({
      where: { activo: true },
      orderBy: { orden: 'asc' }
    })
  ]);

  const totalProductos = await prisma.producto.count({
    where: { activo: true }
  });

  return (
    <div className="min-h-screen">
      {/* Hero Slider */}
      <HeroSlider />
      
      {/* Categorías */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Categorías
        </h2>
        <CategoriasNav categorias={categorias} />
      </section>
      
      {/* Productos Destacados */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Productos Destacados
          </h2>
          <a 
            href="/productos" 
            className="text-primary-600 hover:text-primary-800 font-semibold"
          >
            Ver todos los productos ({totalProductos})
          </a>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {productosDestacados.map((producto) => (
            <ProductoCard key={producto.id} producto={producto} />
          ))}
        </div>
      </section>
      
      {/* Banner de Ofertas */}
      <section className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-16 my-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Black Friday 2024</h2>
          <p className="text-xl mb-8">Hasta 50% de descuento en toda la tienda</p>
          <a 
            href="/categoria/ofertas" 
            className="bg-white text-primary-600 px-8 py-3 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors"
          >
            Ver Ofertas
          </a>
        </div>
      </section>
      
      {/* Features */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🚚</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Envío Gratis</h3>
            <p className="text-gray-600">En compras mayores a $50.000</p>
          </div>
          
          <div className="text-center">
            <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">↩️</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Devoluciones</h3>
            <p className="text-gray-600">30 días para cambiar o devolver</p>
          </div>
          
          <div className="text-center">
            <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔒</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Pago Seguro</h3>
            <p className="text-gray-600">Protegido con Stripe</p>
          </div>
        </div>
      </section>
    </div>
  );
}
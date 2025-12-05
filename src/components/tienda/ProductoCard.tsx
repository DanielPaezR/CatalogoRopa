'use client';

interface Producto {
  id: string;
  nombre: string;
  slug: string;
  descripcionCorta: string;
  precio: number;
  precioOriginal?: number;
  sku: string;
  stock: number;
  imagenes: string[];
  colores: string[];
  tallas: string[];
  destacado: boolean;
  activo: boolean;
  categoriaId: string;
}
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { toast } from 'react-hot-toast';

interface ProductoCardProps {
  producto: Producto & {
    categoria: {
      nombre: string;
      slug: string;
    };
  };
}

export default function ProductoCard({ producto }: ProductoCardProps) {
  const { addToCart } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(false);

  const precioOriginal = producto.precioOriginal 
    ? parseFloat(producto.precioOriginal.toString())
    : null;
  
  const precioActual = parseFloat(producto.precio.toString());
  
  const descuento = precioOriginal 
    ? Math.round(((precioOriginal - precioActual) / precioOriginal) * 100)
    : 0;

  const handleAddToCart = async () => {
    if (producto.stock <= 0) {
      toast.error('Producto agotado');
      return;
    }

    setLoading(true);
    try {
      await addToCart({
        id: producto.id,
        nombre: producto.nombre,
        precio: precioActual,
        imagen: producto.imagenes[0],
        cantidad: 1,
        stock: producto.stock,
        talla: producto.tallas[0] || null,
        color: producto.colores[0] || null
      });
      
      toast.success('Producto agregado al carrito');
    } catch (error) {
      toast.error('Error al agregar producto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
      <div className="relative">
        <Link href={`/producto/${producto.slug}`}>
          <div className="aspect-square relative overflow-hidden">
            <Image
              src={producto.imagenes[selectedImage]}
              alt={producto.nombre}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
          
          {descuento > 0 && (
            <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
              -{descuento}%
            </div>
          )}
          
          {producto.stock <= 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-white text-lg font-bold">AGOTADO</span>
            </div>
          )}
        </Link>
        
        {/* Mini imágenes */}
        {producto.imagenes.length > 1 && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2">
            {producto.imagenes.slice(0, 3).map((img: string, idx: number) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`w-2 h-2 rounded-full ${
                  selectedImage === idx ? 'bg-white' : 'bg-white/50'
                }`}
                aria-label={`Ver imagen ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="mb-2">
          <Link 
            href={`/categoria/${producto.categoria.slug}`}
            className="text-xs text-gray-500 hover:text-primary-600"
          >
            {producto.categoria.nombre}
          </Link>
        </div>
        
        <Link href={`/producto/${producto.slug}`}>
          <h3 className="font-semibold text-gray-900 hover:text-primary-600 mb-2 line-clamp-2">
            {producto.nombre}
          </h3>
        </Link>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-gray-900">
              ${precioActual.toLocaleString()}
            </span>
            
            {precioOriginal && (
              <span className="text-sm text-gray-500 line-through">
                ${precioOriginal.toLocaleString()}
              </span>
            )}
          </div>
          
          <div className="text-sm text-gray-500">
            {producto.stock > 0 ? (
              <span className="text-green-600">{producto.stock} disponibles</span>
            ) : (
              <span className="text-red-600">Agotado</span>
            )}
          </div>
        </div>
        
        <button
          onClick={handleAddToCart}
          disabled={producto.stock <= 0 || loading}
          className={`w-full py-2 rounded-lg font-medium transition-colors ${
            producto.stock <= 0
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-primary-600 hover:bg-primary-700 text-white'
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Agregando...
            </span>
          ) : producto.stock > 0 ? (
            'Agregar al carrito'
          ) : (
            'Sin stock'
          )}
        </button>
      </div>
    </div>
  );
}
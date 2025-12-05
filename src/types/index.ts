// src/types/index.ts - VERSIÓN SIN DEPENDENCIA DE Prisma
export type CartItem = {
  id: string
  nombre: string
  precio: number
  imagen: string
  cantidad: number
  stock: number
  talla?: string | null
  color?: string | null
  varianteId?: string
}

export type CheckoutData = {
  customer: {
    email: string
    name: string
    phone?: string
  }
  shippingAddress: {
    line1: string
    line2?: string
    city: string
    state: string
    postal_code: string
    country: string
  }
}

// Tipos manuales en lugar de usar Prisma
export interface Producto {
  id: string
  nombre: string
  slug: string
  descripcionCorta: string
  descripcionLarga?: string
  precio: number
  precioOriginal?: number
  categoriaId: string
  sku: string
  stock: number
  stockMinimo: number
  imagenes: string[]
  colores: string[]
  tallas: string[]
  tags: string[]
  destacado: boolean
  activo: boolean
  createdAt: Date
}

export interface Pedido {
  id: string
  numeroPedido: string
  usuarioId?: string
  clienteEmail: string
  clienteNombre: string
  subtotal: number
  envio: number
  total: number
  estado: 'PENDIENTE' | 'PROCESANDO' | 'ENVIADO' | 'ENTREGADO' | 'CANCELADO'
  metodoPago: 'STRIPE' | 'MERCADOPAGO'
  stripeSessionId?: string
  createdAt: Date
}

export interface Usuario {
  id: string
  email: string
  nombre: string
  password: string
  rol: 'ADMIN' | 'CLIENTE'
  telefono?: string
  direccion?: string
  createdAt: Date
}

export interface Categoria {
  id: string
  nombre: string
  slug: string
  descripcion?: string
  imagen?: string
  orden: number
  activo: boolean
  createdAt: Date
}

export interface Variante {
  id: string
  productoId: string
  talla: string
  color: string
  stock: number
  precio: number
  sku: string
}

export interface PedidoItem {
  id: string
  pedidoId: string
  productoId: string
  varianteId?: string
  nombre: string
  precio: number
  cantidad: number
  talla?: string
  color?: string
}

export type ProductoWithRelations = Producto & {
  categoria: Categoria
  variantes: Variante[]
  _count?: {
    pedidoItems: number
  }
}

export type PedidoWithRelations = Pedido & {
  items: (PedidoItem & {
    producto: Producto
  })[]
  usuario?: Usuario
}

export type AdminStats = {
  totalVentas: number
  ventasMensuales: Array<{
    mes: string
    total: number
    cantidad: number
  }>
  productosMasVendidos: Array<{
    id: string
    nombre: string
    totalVendido: number
    ingresos: number
  }>
  totalPedidos: number
  pedidosPendientes: number
  totalProductos: number
  productosBajoStock: number
}

export type UserSession = {
  user: {
    id: string
    email: string
    nombre: string
    role: string
  }
}

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      nombre: string
      role: string
    }
  }

  interface User {
    id: string
    email: string
    nombre: string
    role: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
    nombre: string
  }
}
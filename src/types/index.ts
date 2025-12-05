import { Producto, Pedido, Usuario, Categoria, Variante } from '@prisma/client'

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
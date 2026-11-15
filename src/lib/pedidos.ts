import { Prisma } from '@prisma/client'
import { prisma } from './db'
import { calcularEnvio, getConfig } from './config'

export class PedidoError extends Error {}

export type ItemSolicitado = { productoId: string; varianteId?: string | null; cantidad: number }

type Tx = Prisma.TransactionClient

/** Descuenta stock de forma atómica; lanza PedidoError si no alcanza. */
async function descontarStock(tx: Tx, item: { productoId: string; varianteId: string | null; cantidad: number; nombre: string }) {
  if (item.varianteId) {
    const r = await tx.variante.updateMany({
      where: { id: item.varianteId, stock: { gte: item.cantidad } },
      data: { stock: { decrement: item.cantidad } },
    })
    if (r.count === 0) throw new PedidoError(`No hay stock suficiente de "${item.nombre}" en la talla/color elegidos`)
    await tx.producto.update({
      where: { id: item.productoId },
      data: { stock: { decrement: item.cantidad } },
    })
  } else {
    const r = await tx.producto.updateMany({
      where: { id: item.productoId, stock: { gte: item.cantidad } },
      data: { stock: { decrement: item.cantidad } },
    })
    if (r.count === 0) throw new PedidoError(`No hay stock suficiente de "${item.nombre}"`)
  }
}

export async function crearPedido(data: {
  cliente: {
    nombre: string
    email?: string | null
    telefono: string
    direccion: string
    ciudad: string
    notas?: string | null
  }
  metodoPago: string
  items: ItemSolicitado[]
}) {
  const config = await getConfig()

  // Agrupar líneas repetidas
  const agrupados = new Map<string, ItemSolicitado>()
  for (const it of data.items) {
    const key = `${it.productoId}:${it.varianteId ?? ''}`
    const prev = agrupados.get(key)
    agrupados.set(key, { ...it, cantidad: (prev?.cantidad ?? 0) + it.cantidad })
  }
  const items = Array.from(agrupados.values())

  return prisma.$transaction(async (tx) => {
    const productos = await tx.producto.findMany({
      where: { id: { in: items.map((i) => i.productoId) } },
      include: { variantes: true },
    })

    const lineas: Prisma.PedidoItemCreateWithoutPedidoInput[] = []
    let subtotal = 0

    for (const it of items) {
      const p = productos.find((x) => x.id === it.productoId)
      if (!p || !p.activo) throw new PedidoError('Uno de los productos del carrito ya no está disponible')

      let varianteId: string | null = null
      let talla: string | null = null
      let color: string | null = null
      if (p.variantes.length > 0) {
        const v = p.variantes.find((x) => x.id === it.varianteId)
        if (!v) throw new PedidoError(`Selecciona talla/color para "${p.nombre}"`)
        varianteId = v.id
        talla = v.talla || null
        color = v.color || null
      }

      await descontarStock(tx, { productoId: p.id, varianteId, cantidad: it.cantidad, nombre: p.nombre })

      subtotal += p.precio * it.cantidad
      lineas.push({
        producto: { connect: { id: p.id } },
        ...(varianteId ? { variante: { connect: { id: varianteId } } } : {}),
        nombre: p.nombre,
        imagen: p.imagenes[0] ?? null,
        talla,
        color,
        precio: p.precio,
        cantidad: it.cantidad,
      })
    }

    const envio = calcularEnvio(subtotal, config)

    return tx.pedido.create({
      data: {
        clienteNombre: data.cliente.nombre,
        clienteEmail: data.cliente.email || null,
        clienteTelefono: data.cliente.telefono,
        direccion: data.cliente.direccion,
        ciudad: data.cliente.ciudad,
        notas: data.cliente.notas || null,
        metodoPago: data.metodoPago,
        subtotal,
        envio,
        total: subtotal + envio,
        items: { create: lineas },
      },
      include: { items: true },
    })
  })
}

/** Devuelve al inventario las unidades de un pedido (al cancelarlo). */
async function devolverStock(tx: Tx, pedidoId: string) {
  const items = await tx.pedidoItem.findMany({ where: { pedidoId } })
  for (const it of items) {
    if (it.varianteId) {
      await tx.variante.updateMany({ where: { id: it.varianteId }, data: { stock: { increment: it.cantidad } } })
    }
    if (it.productoId) {
      await tx.producto.updateMany({ where: { id: it.productoId }, data: { stock: { increment: it.cantidad } } })
    }
  }
}

/** Vuelve a descontar las unidades de un pedido (al reactivar uno cancelado). */
async function redescontarStock(tx: Tx, pedidoId: string) {
  const items = await tx.pedidoItem.findMany({ where: { pedidoId } })
  for (const it of items) {
    if (!it.productoId) continue
    await descontarStock(tx, { productoId: it.productoId, varianteId: it.varianteId, cantidad: it.cantidad, nombre: it.nombre })
  }
}

export async function cambiarEstadoPedido(pedidoId: string, estado: string, extra: { pagado?: boolean } = {}) {
  return prisma.$transaction(async (tx) => {
    const pedido = await tx.pedido.findUnique({ where: { id: pedidoId } })
    if (!pedido) throw new PedidoError('Pedido no encontrado')

    if (estado !== pedido.estado) {
      if (estado === 'CANCELADO') await devolverStock(tx, pedidoId)
      else if (pedido.estado === 'CANCELADO') await redescontarStock(tx, pedidoId)
    }

    return tx.pedido.update({
      where: { id: pedidoId },
      data: { estado, ...(extra.pagado !== undefined ? { pagado: extra.pagado } : {}) },
    })
  })
}

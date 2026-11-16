import { cache } from 'react'
import { prisma } from './db'

/** Configuración de la tienda (fila única). Se crea si no existe. */
export const getConfig = cache(async () => {
  const config = await prisma.configuracion.findUnique({ where: { id: 1 } })
  if (config) return config
  return prisma.configuracion.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } })
})

export { wompiEnabled } from './wompi'

export { calcularEnvio } from './config-shared'

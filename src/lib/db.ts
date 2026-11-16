import { existsSync } from 'fs'
import { PrismaClient } from '@prisma/client'

// Variables heredadas de configuraciones antiguas (p. ej. en Railway) pueden apuntar a un
// motor de Prisma que no existe en esta imagen y tumbar la app. Si el archivo no existe, se ignoran.
for (const name of ['PRISMA_QUERY_ENGINE_LIBRARY', 'PRISMA_QUERY_ENGINE_BINARY']) {
  const value = process.env[name]
  if (value && !existsSync(value)) {
    console.warn(`AVISO: se ignora ${name}=${value} (el archivo no existe). Borra esa variable en Railway.`)
    delete process.env[name]
  }
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

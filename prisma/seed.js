// Inicializa la base de datos: usuario administrador, configuración y categorías base.
// Es idempotente: se ejecuta en cada arranque y solo crea lo que falte.
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const { cargarDemo } = require('./demo')

const prisma = new PrismaClient()

async function main() {
  const email = (process.env.ADMIN_EMAIL || 'admin@tienda.com').toLowerCase().trim()
  const password = process.env.ADMIN_PASSWORD || 'admin123'

  const admins = await prisma.usuario.count({ where: { rol: 'ADMIN' } })
  if (admins === 0) {
    await prisma.usuario.upsert({
      where: { email },
      update: { rol: 'ADMIN', password: await bcrypt.hash(password, 10) },
      create: {
        email,
        nombre: 'Administrador',
        password: await bcrypt.hash(password, 10),
        rol: 'ADMIN',
      },
    })
    console.log(`[seed] Usuario administrador creado: ${email}`)
  }

  await prisma.configuracion.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } })

  const categorias = await prisma.categoria.count()
  if (categorias === 0) {
    const base = [
      { nombre: 'Mujer', slug: 'mujer', descripcion: 'Blusas, vestidos, jeans y más', orden: 1 },
      { nombre: 'Hombre', slug: 'hombre', descripcion: 'Camisas, camisetas, pantalones y más', orden: 2 },
      { nombre: 'Accesorios', slug: 'accesorios', descripcion: 'Gorras, bolsos, cinturones y más', orden: 3 },
    ]
    await prisma.categoria.createMany({ data: base })
    console.log('[seed] Categorías base creadas')
  }

  if (process.env.SEED_DEMO !== '0') await cargarDemo(prisma)
}

main()
  .catch((e) => {
    console.error('[seed] Error:', e)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())

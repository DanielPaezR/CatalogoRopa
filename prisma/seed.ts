// Versión sin import problemática
async function seed() {
  try {
    console.log('Iniciando seed...')
    
    // Usa require en lugar de import
    const { PrismaClient } = require('@prisma/client')
    const bcrypt = require('bcryptjs')
    
    const prisma = new PrismaClient()
    
    // Usuario admin
    const hashedPassword = await bcrypt.hash('admin123', 10)
    
    await prisma.usuario.upsert({
      where: { email: 'admin@tienda.com' },
      update: {},
      create: {
        email: 'admin@tienda.com',
        nombre: 'Administrador',
        password: hashedPassword,
        rol: 'ADMIN'
      }
    })
    
    console.log('✅ Seed completado')
    
    await prisma.$disconnect()
  } catch (error) {
    console.error('❌ Error en seed:', error)
    process.exit(1)
  }
}

// Ejecutar
seed()
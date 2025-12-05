import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Creando datos iniciales...")
  
  // Crear usuario admin
  await prisma.usuario.create({
    data: {
      email: "admin@tienda.com",
      nombre: "Administrador",
      password: "admin123",
      rol: "ADMIN"
    }
  })
  console.log("✅ Usuario admin creado: admin@tienda.com / admin123")
  
  // Crear productos
  await prisma.producto.create({
    data: {
      nombre: "Camiseta Básica",
      slug: "camiseta-basica",
      descripcionCorta: "Camiseta 100% algodón",
      descripcionLarga: "Camiseta básica de algodón, cómoda y versátil",
      precio: 25.99,
      stock: 50,
      imagenes: ["/images/camiseta.jpg"],
      destacado: true,
      activo: true
    }
  })
  
  console.log("✅ Producto creado: Camiseta Básica")
  console.log("🎉 ¡Base de datos lista!")
}

main()
  .catch(e => {
    console.error("❌ Error:", e)
    process.exit(1)
  })
  .finally(() => {
    prisma.$disconnect()
  })
// Catálogo de muestra (se carga una sola vez, si la tienda no tiene productos).
// Todos los productos de muestra tienen referencia "DEMO-…" y se pueden borrar
// desde el panel: Configuración → Productos de muestra.

const DESC = (extra) =>
  `${extra}\n\n· Confección nacional con acabados cuidados\n· Lavar a mano o en ciclo delicado, en frío\n· No usar secadora`

const img = (n) => [`/demo/${n}-1.jpg`, `/demo/${n}-2.jpg`]

const PRODUCTOS = [
  { nombre: 'Abrigo largo de lana', cat: 'mujer', precio: 389900, imgs: [...img('abrigo')], tallas: ['S', 'M', 'L'], colores: ['Camel'], destacado: true,
    desc: 'Abrigo de corte recto en mezcla de lana, con solapa amplia y botonadura sencilla. Largo bajo la rodilla.' },
  { nombre: 'Vestido midi terracota', cat: 'mujer', precio: 159900, imgs: img('vestido'), tallas: ['XS', 'S', 'M', 'L'], colores: [], destacado: true,
    desc: 'Vestido midi sin mangas con cintura marcada y falda en A con vuelo suave. Ideal de día o de noche.' },
  { nombre: 'Vestido negro de punto', cat: 'mujer', precio: 179900, imgs: img('vestido-negro'), tallas: ['XS', 'S', 'M', 'L'], colores: ['Negro'], destacado: false,
    desc: 'Un básico que nunca falla: punto fino con caída fluida y cuello redondo.' },
  { nombre: 'Jean recto clásico', cat: 'mujer', precio: 139900, precioAnterior: 169900, imgs: img('jean'), tallas: ['6', '8', '10', '12', '14'], colores: [], destacado: false,
    desc: 'Denim rígido de tiro alto y pierna recta. Cinco bolsillos y cierre con botón metálico.' },
  { nombre: 'Falda plisada', cat: 'mujer', precio: 99900, precioAnterior: 129900, imgs: img('falda'), tallas: ['XS', 'S', 'M'], colores: ['Negro'], destacado: false,
    desc: 'Falda midi de pliegues permanentes con pretina elástica oculta.' },
  { nombre: 'Blusa de algodón', cat: 'mujer', precio: 79900, imgs: img('blusa'), tallas: ['S', 'M', 'L'], colores: ['Crema'], destacado: true,
    desc: 'Blusa de algodón suave con cuello redondo y manga larga. Fresca y fácil de combinar.' },
  { nombre: 'Blazer de lino', cat: 'mujer', precio: 249900, imgs: img('blazer'), tallas: ['S', 'M', 'L'], colores: ['Arena'], destacado: true,
    desc: 'Blazer sin forrar en lino, de hombro suave y silueta relajada.' },
  { nombre: 'Camisa de lino', cat: 'hombre', precio: 119900, precioAnterior: 149900, imgs: [...img('camisa-blanco'), '/demo/camisa-beige-1.jpg'], tallas: ['S', 'M', 'L', 'XL'], colores: ['Blanco', 'Beige'], destacado: true,
    desc: 'Camisa 100% lino con bolsillo en el pecho y botones de nácar. Fresca y ligera.' },
  { nombre: 'Chaqueta de pana', cat: 'hombre', precio: 219900, precioAnterior: 259900, imgs: img('chaqueta'), tallas: ['M', 'L', 'XL'], colores: ['Café'], destacado: true,
    desc: 'Chaqueta de pana de canal fino, con bolsillos de parche y botones de corozo.' },
  { nombre: 'Suéter de punto', cat: 'hombre', precio: 129900, imgs: img('sueter'), tallas: ['S', 'M', 'L'], colores: ['Verde oliva'], destacado: false,
    desc: 'Suéter de punto grueso con cuello redondo y puños acanalados.' },
  { nombre: 'Pantalón sastre', cat: 'hombre', precio: 149900, imgs: img('pantalon'), tallas: ['30', '32', '34', '36'], colores: ['Arena'], destacado: true,
    desc: 'Pantalón de pinzas con pierna amplia y caída impecable.' },
  { nombre: 'Camiseta esencial', cat: 'hombre', precio: 59900, imgs: img('camiseta'), tallas: ['S', 'M', 'L', 'XL'], colores: ['Negro'], destacado: false,
    desc: 'Camiseta de algodón peinado de gramaje medio. La base de cualquier armario.' },
  { nombre: 'Bolso de cuero', cat: 'accesorios', precio: 189900, imgs: img('bolso'), tallas: [], colores: [], stock: 6, destacado: true,
    desc: 'Bolso estructurado de cuero con asa superior y cierre de solapa.' },
]

const STOCKS = [4, 7, 2, 9, 5, 0, 6, 3, 8]

async function cargarDemo(prisma) {
  const config = await prisma.configuracion.findUnique({ where: { id: 1 } })
  if (!config || config.demoCargado) return
  const total = await prisma.producto.count()
  if (total > 0) {
    await prisma.configuracion.update({ where: { id: 1 }, data: { demoCargado: true } })
    return
  }

  const cats = await prisma.categoria.findMany()
  const catId = (slug) => cats.find((c) => c.slug === slug)?.id ?? null
  const slugify = (t) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  let k = 0
  for (const [i, p] of PRODUCTOS.entries()) {
    const ts = p.tallas.length ? p.tallas : ['']
    const cs = p.colores.length ? p.colores : ['']
    const variantes = []
    if (p.tallas.length || p.colores.length) {
      for (const talla of ts) for (const color of cs) variantes.push({ talla, color, stock: STOCKS[k++ % STOCKS.length] })
    }
    const stock = variantes.length ? variantes.reduce((s, v) => s + v.stock, 0) : p.stock ?? 5
    await prisma.producto.create({
      data: {
        nombre: p.nombre,
        slug: slugify(p.nombre),
        descripcion: DESC(p.desc),
        precio: p.precio,
        precioAnterior: p.precioAnterior ?? null,
        sku: `DEMO-${String(i + 1).padStart(2, '0')}`,
        stock,
        imagenes: p.imgs,
        tallas: p.tallas,
        colores: p.colores,
        destacado: p.destacado,
        categoriaId: catId(p.cat),
        // Escalonar fechas para que el orden "más recientes" sea natural
        createdAt: new Date(Date.now() - i * 3600 * 1000),
        variantes: { create: variantes },
      },
    })
  }

  await prisma.configuracion.update({
    where: { id: 1 },
    data: {
      demoCargado: true,
      heroImagen: config.heroImagen ?? '/demo/portada.jpg',
      editorialImagen: config.editorialImagen ?? '/demo/editorial.jpg',
    },
  })
  console.log(`[seed] Catálogo de muestra cargado (${PRODUCTOS.length} productos)`)
}

module.exports = { cargarDemo }

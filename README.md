# Catálogo de Ropa · Tienda online

Tienda de ropa para Colombia (precios en COP) con catálogo, carrito, pedidos por WhatsApp y panel de administración.

## Funcionalidades

**Tienda**
- Inicio con portada configurable, categorías, destacados, ofertas y novedades.
- Catálogo con búsqueda, filtros (categoría, talla, ofertas, disponibles, rango de precio), orden y paginación.
- Ficha de producto con galería, selección de talla/color con stock por combinación y botón "Preguntar por WhatsApp".
- Carrito persistente (cajón lateral + página), con barra de "envío gratis" y sincronización de precio/stock.
- Checkout sin registro: WhatsApp, contra entrega, transferencia/Nequi y tarjeta (Stripe, opcional).
- Página de pedido con seguimiento de estado y mensaje de WhatsApp prellenado con el detalle de la compra.

**Panel (`/admin`)**
- Resumen: ventas del mes, gráfico de 6 meses, más vendidos, pedidos recientes, stock bajo.
- Productos: crear/editar con subida de fotos (se optimizan y se guardan en la base de datos), precio anterior (descuento), tallas × colores con unidades por combinación, visible/destacado.
- Categorías con imagen y orden.
- Pedidos: filtros por estado, búsqueda, cambio de estado (cancelar devuelve el stock), marcar pagado, escribir al cliente por WhatsApp.
- Configuración: nombre, anuncio, portada, contacto y redes, costo de envío y envío gratis, métodos de pago, datos de transferencia, cambio de correo/contraseña.

El inventario se descuenta al crear el pedido (de forma atómica, sin sobreventa) y se repone si el pedido se cancela.

## Despliegue en Railway

1. Servicio desde este repositorio (usa el `Dockerfile`) + plugin **PostgreSQL**.
2. Variables:
   - `DATABASE_URL` → referencia a la del Postgres (`${{Postgres.DATABASE_URL}}`).
   - `NEXTAUTH_SECRET` → recomendado (`openssl rand -base64 32`). Si falta se deriva uno automáticamente.
   - `ADMIN_EMAIL` / `ADMIN_PASSWORD` → opcional, administrador inicial (por defecto `admin@tienda.com` / `admin123`).
   - `STRIPE_SECRET_KEY` y `STRIPE_WEBHOOK_SECRET` → opcional, habilita pago con tarjeta. Webhook: `https://TU-DOMINIO/api/stripe/webhook` con eventos `checkout.session.completed`, `checkout.session.expired`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`.
3. Al arrancar, `scripts/start.sh` sincroniza el esquema (`prisma db push`), crea admin/configuración/categorías base si faltan y lanza el servidor. Healthcheck: `/api/health`.

### Catálogo de muestra

En el primer arranque, si la tienda no tiene productos, se cargan 13 productos de ejemplo (referencia `DEMO-…`, imágenes en `public/demo/`) junto con una portada y una imagen editorial, para ver la tienda completa desde el primer día. Se borran con un clic en **Panel → Configuración → Productos de muestra** y no vuelven a cargarse. Para desactivarlo por completo, define `SEED_DEMO=0`.

> **Importante:** tras el primer despliegue entra a `/admin/configuracion` y cambia la contraseña del administrador y el número de WhatsApp.

## Desarrollo local

```bash
docker compose up -d          # PostgreSQL local
cp .env.example .env
npm install
npm run db:push && npm run db:seed
npm run dev                   # http://localhost:3000
```

Stack: Next.js 14 (App Router) · Prisma 5 + PostgreSQL · NextAuth (credenciales) · Tailwind CSS · Stripe (opcional).

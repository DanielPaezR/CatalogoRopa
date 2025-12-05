```markdown
# Manual del Administrador - Tienda de Ropa

## 📋 Tabla de Contenidos
1. [Acceso al Panel de Administración](#acceso)
2. [Gestión de Productos](#productos)
3. [Gestión de Pedidos](#pedidos)
4. [Gestión de Categorías](#categorias)
5. [Estadísticas y Reportes](#estadisticas)
6. [Configuración de la Tienda](#configuracion)
7. [Solución de Problemas](#problemas)

## 🔑 1. Acceso al Panel de Administración {#acceso}

### URL de Acceso:
https://tudominio.com/admin

text

### Credenciales Iniciales:
Email: admin@tienda.com
Contraseña: admin123

text

### Cambiar Contraseña:
1. Inicia sesión en el panel admin
2. Ve a tu perfil (esquina superior derecha)
3. Haz clic en "Cambiar contraseña"
4. Sigue las instrucciones

## 🛍️ 2. Gestión de Productos {#productos}

### Agregar Nuevo Producto:
1. Ve a **Productos** → **Nuevo Producto**
2. Completa la información básica:
   - Nombre del producto
   - Descripción corta y larga
   - SKU único
   - Precio y precio original (para ofertas)
3. Selecciona categoría
4. Configura stock inicial
5. Agrega imágenes (arrastra o selecciona archivos)
6. Configura tallas y colores disponibles
7. Guarda el producto

### Editar Producto Existente:
1. Ve a **Productos** → Lista de productos
2. Haz clic en **Editar** junto al producto
3. Modifica la información necesaria
4. Guarda cambios

### Gestión de Stock:
- **Stock bajo:** Productos con menos de 10 unidades aparecen en alertas
- **Actualizar stock:** Edita el producto y modifica la cantidad
- **Variantes:** Puedes tener stock diferente por talla/color

### Destacar Productos:
Marca productos como "destacados" para que aparezcan en la página principal.

## 📦 3. Gestión de Pedidos {#pedidos}

### Ver Pedidos:
1. Ve a **Pedidos**
2. Usa filtros para buscar por:
   - Número de pedido
   - Estado (Pendiente, Procesando, Enviado, Entregado)
   - Fecha
   - Cliente

### Procesar un Pedido:
1. **Pendiente:** Pedido recibido, esperando procesamiento
2. **Procesando:** Preparando el pedido para envío
3. **Enviado:** Paquete enviado, agregar número de tracking
4. **Entregado:** Cliente recibió el producto

### Actualizar Estado:
1. Haz clic en el pedido
2. Cambia el estado
3. Agrega número de tracking si es necesario
4. Guarda cambios

### Cancelar Pedido:
1. Cambia estado a **Cancelado**
2. El stock se reintegra automáticamente
3. Se notifica al cliente (si está configurado email)

## 🗂️ 4. Gestión de Categorías {#categorias}

### Crear Categoría:
1. Ve a **Categorías** → **Nueva Categoría**
2. Ingresa nombre y descripción
3. Agrega imagen (opcional)
4. Configura orden de aparición
5. Guarda

### Organizar Categorías:
- Arrastra y suelta para cambiar orden
- Activa/desactiva categorías
- Las categorías inactivas no aparecen en la tienda

### Asignar Productos:
1. Edita un producto
2. Selecciona categoría
3. Un producto puede tener solo una categoría principal

## 📊 5. Estadísticas y Reportes {#estadisticas}

### Dashboard Principal:
- **Ventas totales:** Ingresos del período seleccionado
- **Pedidos:** Cantidad de pedidos procesados
- **Productos más vendidos:** Top 10 productos
- **Stock bajo:** Productos que necesitan reposición

### Reportes Disponibles:
1. **Ventas por período:** Diario, semanal, mensual
2. **Productos más vendidos:** Con gráficos
3. **Clientes más activos:** Por compras realizadas
4. **Categorías más populares:** Por ventas

### Exportar Datos:
1. Selecciona el período
2. Haz clic en **Exportar**
3. Elige formato (CSV, Excel)
4. Descarga el reporte

## ⚙️ 6. Configuración de la Tienda {#configuracion}

### Información General:
1. **Nombre de la tienda:** Aparece en el sitio
2. **Descripción:** Meta descripción para SEO
3. **Logo:** Sube tu logo (recomendado 200x100px)
4. **Favicon:** Icono del navegador

### Métodos de Pago:
- **Stripe:** Configurado automáticamente
- **Transferencia bancaria:** Activar si es necesario
- **Contraentrega:** Activar si es necesario

### Configuración de Envíos:
1. **Costo de envío:** Configura tarifas
2. **Envío gratis:** Establece monto mínimo
3. **Zonas de envío:** Define áreas de cobertura

### Configuración de Email:
- **Notificaciones de pedido:** Automáticas
- **Respuestas automáticas:** Configura templates
- **Newsletter:** Opcional

## 🚨 7. Solución de Problemas {#problemas}

### Problemas Comunes:

#### 1. No puedo iniciar sesión:
- Verifica credenciales
- Contacta al desarrollador para resetear contraseña

#### 2. Imágenes no se cargan:
- Verifica tamaño (máximo 5MB por imagen)
- Formato soportado: JPG, PNG, WebP
- Intenta con otra imagen

#### 3. Pagos no funcionan:
- Verifica configuración de Stripe
- Prueba con tarjeta de prueba: 4242 4242 4242 4242

#### 4. Stock no se actualiza:
- Los pedidos cancelados reintegran stock automático
- Para cambios manuales, edita el producto

#### 5. Sitio lento:
- Limpia caché del navegador
- Contacta a Railway para escalar recursos

### Contacto para Soporte:
- **Desarrollador:** [Tu información de contacto]
- **Railway:** https://railway.app
- **Stripe:** https://stripe.com

## 🔒 Seguridad

### Recomendaciones:
1. **Cambia la contraseña inicial**
2. **Usa contraseña fuerte:** Mínimo 12 caracteres, mayúsculas, números, símbolos
3. **No compartas credenciales**
4. **Cierra sesión** en computadoras públicas
5. **Monitorea** actividad sospechosa

### Backup:
- **Base de datos:** Automático diario en Railway
- **Imágenes:** Almacenadas en Cloudinary
- **Configuración:** Guarda copia de variables de entorno

---

## 📞 Soporte Técnico

### Horario de Atención:
- Lunes a Viernes: 9:00 AM - 6:00 PM
- Sábados: 9:00 AM - 1:00 PM

### Contacto:
- Email: daniel.paezr@unac.edu.co
- Teléfono: [3174694941]
- WhatsApp: [3174694941]

### Emergencias:
Para problemas críticos que afecten ventas, contacta directamente al desarrollador.

---

**Última actualización:** [Fecha]
**Versión:** 1.0.0
# 🛍️ Tienda de Ropa - E-commerce Completo

Tienda de ropa moderna con panel de administración completo, sistema de pagos con Stripe y control de stock automático.

## ✨ Características Principales

### 🛒 Tienda Online
- ✅ Catálogo de productos con filtros avanzados
- ✅ Carrito de compras persistente
- ✅ Checkout con Stripe (tarjetas de crédito/débito)
- ✅ Gestión de variantes (tallas y colores)
- ✅ Búsqueda y categorización inteligente
- ✅ Diseño 100% responsive (móvil, tablet, desktop)

### 🛠️ Panel de Administración
- ✅ Dashboard con estadísticas en tiempo real
- ✅ CRUD completo de productos (con imágenes)
- ✅ Gestión de pedidos (estados, tracking)
- ✅ Control de stock con alertas automáticas
- ✅ Reportes de ventas y productos más vendidos
- ✅ Gestión de categorías y usuarios

### 💳 Sistema de Pagos
- ✅ Integración completa con Stripe
- ✅ Webhooks para confirmación automática
- ✅ Múltiples métodos de pago
- ✅ Ambiente de pruebas y producción
- ✅ Seguridad PCI compliant

### 📦 Gestión de Inventario
- ✅ Stock automático (se reduce al confirmar pago)
- ✅ Alertas de stock bajo
- ✅ Variantes con stock individual
- ✅ Historial de movimientos de stock

## 🚀 Despliegue Rápido

### Opción 1: Railway (Recomendado - 5 minutos)
```bash
# 1. Clonar repositorio
git clone <url-del-repositorio>
cd tienda-ropa

# 2. Ejecutar script de despliegue
chmod +x scripts/deploy-railway.sh
./scripts/deploy-railway.sh
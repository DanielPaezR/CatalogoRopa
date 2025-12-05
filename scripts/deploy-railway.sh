#!/bin/bash

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    print_error "No se encontró package.json"
    print_error "Ejecuta este script desde el directorio del proyecto"
    exit 1
fi

print_info "🚀 Iniciando despliegue de Tienda de Ropa en Railway..."

# Paso 1: Instalar Railway CLI si no está instalado
if ! command -v railway &> /dev/null; then
    print_info "Instalando Railway CLI..."
    npm i -g @railway/cli
fi

# Paso 2: Iniciar sesión en Railway
print_info "Iniciando sesión en Railway..."
if ! railway login; then
    print_error "Error al iniciar sesión en Railway"
    print_info "Por favor inicia sesión manualmente con: railway login"
    exit 1
fi

# Paso 3: Crear o seleccionar proyecto
print_info "Configurando proyecto en Railway..."
if ! railway project; then
    print_info "Creando nuevo proyecto..."
    railway init --name tienda-ropa-production --yes
fi

# Paso 4: Agregar PostgreSQL
print_info "Configurando PostgreSQL..."
if ! railway add postgresql; then
    print_warning "PostgreSQL ya está configurado o hubo un error"
fi

# Paso 5: Desplegar aplicación
print_info "Desplegando aplicación..."
if ! railway up --detach; then
    print_error "Error al desplegar aplicación"
    exit 1
fi

# Paso 6: Esperar a que la aplicación esté disponible
print_info "Esperando a que la aplicación esté lista..."
sleep 30

# Paso 7: Obtener URL de la aplicación
APP_URL=$(railway status --json | grep -o '"serviceDomains":{"web":"[^"]*"' | grep -o '"[^"]*"' | tail -1 | tr -d '"')
if [ -z "$APP_URL" ]; then
    APP_URL="https://$(railway status --json | grep -o '"customDomain":"[^"]*"' | grep -o '"[^"]*"' | tr -d '"')"
fi

if [ -z "$APP_URL" ]; then
    APP_URL="https://$(railway status 2>/dev/null | grep "Deployments:" -A 1 | tail -n 1 | awk '{print $2}')"
fi

print_info "URL de la aplicación: $APP_URL"

# Paso 8: Configurar variables de entorno obligatorias
print_info "Configurando variables de entorno..."

# Lista de variables requeridas
declare -A required_vars=(
    ["NEXTAUTH_URL"]="$APP_URL"
    ["NEXT_PUBLIC_URL"]="$APP_URL"
    ["NODE_ENV"]="production"
)

# Configurar variables automáticas
for key in "${!required_vars[@]}"; do
    print_info "Configurando $key..."
    railway variables set "$key"="${required_vars[$key]}"
done

# Paso 9: Generar secret para NextAuth
print_info "Generando secret para NextAuth..."
NEXTAUTH_SECRET=$(openssl rand -base64 32)
railway variables set NEXTAUTH_SECRET="$NEXTAUTH_SECRET"

# Paso 10: Configurar base de datos
print_info "Configurando base de datos..."
sleep 10 # Esperar a que PostgreSQL esté listo

# Ejecutar migraciones
print_info "Ejecutando migraciones de base de datos..."
if railway run npx prisma db push; then
    print_success "Migraciones ejecutadas exitosamente"
else
    print_error "Error al ejecutar migraciones"
    print_info "Ejecuta manualmente: railway run npx prisma db push"
fi

# Generar cliente Prisma
print_info "Generando cliente Prisma..."
railway run npx prisma generate

# Ejecutar seed de datos iniciales
print_info "Ejecutando seed de datos..."
if railway run npm run prisma:seed; then
    print_success "Seed de datos ejecutado exitosamente"
else
    print_warning "Seed de datos no se pudo ejecutar (puede ser normal si ya existen datos)"
fi

# Paso 11: Verificar despliegue
print_info "Verificando despliegue..."
sleep 10

# Hacer health check
HEALTH_CHECK=$(curl -s -f "$APP_URL/api/health" || echo "FAILED")
if [ "$HEALTH_CHECK" != "FAILED" ]; then
    print_success "✅ Health check exitoso"
else
    print_warning "⚠️  Health check falló, revisa los logs con: railway logs"
fi

# Paso 12: Mostrar información final
print_success "🎉 ¡Despliegue completado!"
echo ""
echo "📋 INFORMACIÓN IMPORTANTE:"
echo "=========================="
echo ""
echo "🌐 URL de la aplicación: $APP_URL"
echo "🔧 Panel de administración: $APP_URL/admin"
echo "👤 Credenciales admin: admin@tienda.com / admin123"
echo ""
echo "⚙️  CONFIGURACIÓN MANUAL REQUERIDA:"
echo "=================================="
echo ""
echo "1. STRIPE CONFIGURATION:"
echo "   - Ve a dashboard.stripe.com"
echo "   - Obtén tus API Keys:"
echo "     * STRIPE_SECRET_KEY (sk_...)"
echo "     * STRIPE_WEBHOOK_SECRET (whsec_...)"
echo "     * NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (pk_...)"
echo "   - Configura las variables en Railway:"
echo "     railway variables set STRIPE_SECRET_KEY=sk_..."
echo "     railway variables set STRIPE_WEBHOOK_SECRET=whsec_..."
echo "     railway variables set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_..."
echo ""
echo "2. WEBHOOK STRIPE:"
echo "   - En dashboard.stripe.com → Developers → Webhooks"
echo "   - Agrega endpoint: $APP_URL/api/webhooks/stripe"
echo "   - Selecciona eventos:"
echo "     * checkout.session.completed"
echo "     * checkout.session.expired"
echo "     * payment_intent.succeeded"
echo "     * payment_intent.payment_failed"
echo ""
echo "3. EMAIL CONFIGURATION (opcional pero recomendado):"
echo "   railway variables set SMTP_HOST=smtp.gmail.com"
echo "   railway variables set SMTP_PORT=587"
echo "   railway variables set SMTP_USER=tu-email@gmail.com"
echo "   railway variables set SMTP_PASSWORD=tu-app-password"
echo "   railway variables set SMTP_FROM=noreply@$APP_URL"
echo ""
echo "4. DOMINIO PERSONALIZADO:"
echo "   - Ve a Railway Dashboard → Tu proyecto → Settings → Domains"
echo "   - Agrega tu dominio personalizado"
echo ""
echo "🔧 COMANDOS ÚTILES:"
echo "==================="
echo "railway logs               # Ver logs de la aplicación"
echo "railway status             # Estado del despliegue"
echo "railway open               # Abrir la aplicación en el navegador"
echo "railway variables          # Ver variables de entorno"
echo "railway run [comando]      # Ejecutar comando en el contenedor"
echo ""
echo "📞 SOPORTE:"
echo "==========="
echo "Problemas comunes:"
echo "1. Error de base de datos: railway run npx prisma db push"
echo "2. Error de build: railway logs --tail 100"
echo "3. Variables faltantes: railway variables"
echo ""
echo "💡 Para reiniciar la aplicación: railway up"
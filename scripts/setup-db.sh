#!/bin/bash

# Script de configuración inicial para Tienda de Ropa
echo "🚀 Configurando Tienda de Ropa..."

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encontró package.json"
    echo "   Ejecuta este script desde el directorio del proyecto"
    exit 1
fi

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

# Configurar variables de entorno
echo "⚙️  Configurando variables de entorno..."
if [ ! -f ".env.local" ]; then
    cp .env.example .env.local
    echo "✅ Archivo .env.local creado"
    echo "⚠️  Edita .env.local con tus configuraciones"
fi

# Iniciar PostgreSQL con Docker
echo "🐘 Iniciando PostgreSQL..."
docker-compose up -d postgres

# Esperar a que PostgreSQL esté listo
echo "⏳ Esperando a que PostgreSQL esté listo..."
sleep 10

# Ejecutar migraciones de Prisma
echo "🗃️  Ejecutando migraciones..."
npx prisma db push

# Generar cliente Prisma
echo "🔧 Generando cliente Prisma..."
npx prisma generate

# Ejecutar seed de datos iniciales
echo "🌱 Ejecutando seed de datos..."
npm run prisma:seed

echo ""
echo "✅ ¡Configuración completada!"
echo ""
echo "📋 Pasos siguientes:"
echo "1. Edita .env.local con tus configuraciones:"
echo "   - STRIPE_SECRET_KEY (de dashboard.stripe.com)"
echo "   - STRIPE_WEBHOOK_SECRET (de dashboard.stripe.com)"
echo "   - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (de dashboard.stripe.com)"
echo "   - SMTP configuraciones para emails"
echo ""
echo "2. Inicia la aplicación:"
echo "   npm run dev"
echo ""
echo "3. Accede a:"
echo "   - Tienda: http://localhost:3000"
echo "   - Admin: http://localhost:3000/admin"
echo "   - Credenciales: admin@tienda.com / admin123"
echo ""
echo "4. Para producción, ejecuta:"
echo "   npm run build"
echo "   npm start"
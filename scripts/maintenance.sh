#!/bin/bash

# Script de mantenimiento para Tienda de Ropa

print_info() {
    echo "ℹ️  $1"
}

print_success() {
    echo "✅ $1"
}

print_error() {
    echo "❌ $1"
}

# Verificar Railway CLI
if ! command -v railway &> /dev/null; then
    print_error "Railway CLI no está instalado"
    print_info "Instala con: npm i -g @railway/cli"
    exit 1
fi

case "$1" in
    backup)
        print_info "Creando backup de base de datos..."
        TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
        railway run pg_dump > "backup_${TIMESTAMP}.sql"
        print_success "Backup creado: backup_${TIMESTAMP}.sql"
        ;;
    
    restore)
        if [ -z "$2" ]; then
            print_error "Especifica archivo de backup"
            print_info "Uso: $0 restore archivo.sql"
            exit 1
        fi
        print_info "Restaurando base de datos..."
        railway run psql < "$2"
        print_success "Base de datos restaurada"
        ;;
    
    logs)
        print_info "Mostrando logs..."
        railway logs --tail 100
        ;;
    
    status)
        print_info "Estado de la aplicación..."
        railway status
        ;;
    
    restart)
        print_info "Reiniciando aplicación..."
        railway up
        print_success "Aplicación reiniciada"
        ;;
    
    variables)
        print_info "Variables de entorno..."
        railway variables
        ;;
    
    update)
        print_info "Actualizando aplicación..."
        git pull
        railway up
        print_success "Aplicación actualizada"
        ;;
    
    health)
        print_info "Health check..."
        APP_URL=$(railway status --json | grep -o '"serviceDomains":{"web":"[^"]*"' | grep -o '"[^"]*"' | tail -1 | tr -d '"')
        curl -s "$APP_URL/api/health" | jq .
        ;;
    
    *)
        echo "Uso: $0 {backup|restore|logs|status|restart|variables|update|health}"
        echo ""
        echo "Comandos:"
        echo "  backup     - Crear backup de base de datos"
        echo "  restore    - Restaurar desde backup"
        echo "  logs       - Ver logs de la aplicación"
        echo "  status     - Estado del despliegue"
        echo "  restart    - Reiniciar aplicación"
        echo "  variables  - Ver variables de entorno"
        echo "  update     - Actualizar aplicación"
        echo "  health     - Health check"
        exit 1
        ;;
esac
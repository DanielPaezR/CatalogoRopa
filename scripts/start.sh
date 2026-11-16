#!/bin/sh
# Arranque en producción: sincroniza el esquema de la base de datos,
# crea los datos iniciales (admin, configuración) y lanza el servidor.
set -e

if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: falta la variable DATABASE_URL" >&2
  exit 1
fi

# Variables heredadas de configuraciones antiguas pueden apuntar a motores de Prisma
# que no existen en esta imagen (p. ej. openssl-1.1.x) y tumbar la app. Se ignoran.
for VAR in PRISMA_QUERY_ENGINE_LIBRARY PRISMA_QUERY_ENGINE_BINARY PRISMA_SCHEMA_ENGINE_BINARY PRISMA_MIGRATION_ENGINE_BINARY; do
  eval "VALOR=\${$VAR:-}"
  if [ -n "$VALOR" ] && [ ! -f "$VALOR" ]; then
    echo "AVISO: se ignora $VAR=$VALOR (el archivo no existe). Puedes borrar esa variable en Railway."
    unset "$VAR"
  fi
done

# Muestra a qué base de datos se conecta (sin usuario ni contraseña)
DB_DESTINO=$(echo "$DATABASE_URL" | sed -E 's#^[a-z]+://[^@]*@##; s#[/?].*$##')
echo "→ Base de datos: $DB_DESTINO"

echo "→ Sincronizando esquema de base de datos…"
INTENTO=1
until node node_modules/prisma/build/index.js db push --skip-generate --accept-data-loss; do
  if [ "$INTENTO" -ge 10 ]; then
    echo "ERROR: no se pudo conectar a la base de datos ($DB_DESTINO) tras $INTENTO intentos." >&2
    echo "Revisa en Railway que el servicio Postgres esté activo y que DATABASE_URL sea \${{Postgres.DATABASE_URL}}." >&2
    exit 1
  fi
  echo "   La base de datos aún no responde (intento $INTENTO/10). Reintentando en 5 s…"
  INTENTO=$((INTENTO + 1))
  sleep 5
done

echo "→ Datos iniciales…"
node prisma/seed.js

echo "→ Iniciando servidor en el puerto ${PORT:-3000}"
exec node server.js

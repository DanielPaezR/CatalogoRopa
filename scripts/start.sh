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

echo "→ Sincronizando esquema de base de datos…"
node node_modules/prisma/build/index.js db push --skip-generate --accept-data-loss

echo "→ Datos iniciales…"
node prisma/seed.js

echo "→ Iniciando servidor en el puerto ${PORT:-3000}"
exec node server.js

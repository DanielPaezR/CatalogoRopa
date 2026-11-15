#!/bin/sh
# Arranque en producción: sincroniza el esquema de la base de datos,
# crea los datos iniciales (admin, configuración) y lanza el servidor.
set -e

if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: falta la variable DATABASE_URL" >&2
  exit 1
fi

echo "→ Sincronizando esquema de base de datos…"
node node_modules/prisma/build/index.js db push --skip-generate --accept-data-loss

echo "→ Datos iniciales…"
node prisma/seed.js

echo "→ Iniciando servidor en el puerto ${PORT:-3000}"
exec node server.js

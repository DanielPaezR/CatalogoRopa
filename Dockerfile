# Etapa 1: Dependencias
FROM node:18-alpine AS deps
# Instalar OpenSSL 1.1 específicamente (no solo openssl que podría ser 3.0)
RUN apk add --no-cache libc6-compat openssl1.1-compat openssl-dev
WORKDIR /app

# Copiar archivos de dependencias
COPY package.json package-lock.json* ./
COPY prisma ./prisma/

# Instalar dependencias (producción + desarrollo para build)
RUN npm ci

# Etapa 2: Builder
FROM node:18-alpine AS builder
# Instalar OpenSSL en builder también
RUN apk add --no-cache openssl1.1-compat
WORKDIR /app

# Copiar desde deps
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variables de entorno
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# Configurar variable para Prisma
ENV PRISMA_QUERY_ENGINE_LIBRARY=/app/node_modules/.prisma/client/libquery_engine-linux-musl-openssl-1.1.x.so.node

# Generar cliente Prisma
RUN npx prisma generate

# Verificar que el engine de Prisma existe
RUN ls -la /app/node_modules/.prisma/client/

# Construir la aplicación
RUN npm run build

# Etapa 3: Runner
FROM node:18-alpine AS runner
# Instalar OpenSSL en runner
RUN apk add --no-cache openssl1.1-compat
WORKDIR /app

# Crear usuario no-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar archivos necesarios
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/package.json ./package.json

# Copiar Prisma Client y engine necesario
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma

# Cambiar a usuario no-root
USER nextjs

# Exponer puerto
EXPOSE 3000

# Variables de entorno
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"
ENV NODE_ENV production
ENV PRISMA_QUERY_ENGINE_LIBRARY=/app/node_modules/.prisma/client/libquery_engine-linux-musl-openssl-1.1.x.so.node

# Comando de inicio
CMD ["node", "server.js"]